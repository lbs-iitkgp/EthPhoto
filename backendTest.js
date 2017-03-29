// ONLY SUPPORT FOR .png FILES FOR NOW.
const fs=require('fs')
const web3=require('web3')
const ipfsApi=require('ipfs-api')
const concat = require('concat-stream')
const util=require('./util.js')
const mkdirp=require('mkdirp')
const lwip=require('lwip')
// const fileSystem=require('./fileSystemOperations.js')

const appDataDir=process.env.HOME+'/.EthPhoto/'
const imageDataDir=appDataDir+'img-store/'
const fileDataDir=appDataDir+'file-store/'
var web3Host='http://localhost';
var web3Port='8545';

var ipfsHost='localhost';
var ipfsAPIPort='5001';
var ipfsWebPort='8080';
var ipfs=ipfsApi(ipfsHost,ipfsAPIPort);

var lastBlockNumber=0;

//============================
//========VARIABLES===========
//============================
var mutexForFile={};
var mutexForCountImagesTag={};
var countImagesForTag={};
var indexOfHashInTagFile={};
var getUserCountForHash={};
var getUserImages={};
var thumbnailHashToImageHash={};
var address="";
//===========================
//======END OF VARIABLES=====
//===========================

web3.setProvider(new web3.providers.HttpProvider(web3Host + ':' + web3Port));

if(web3.isConnected()) {
	console.log("Ethereum - connected to RPC server");
 	fs.readFile(appDataDir + 'accountAddress', 'utf-8', function(error, content) {
		if(error)
     		content = createAccount();
     	address = content;
     });
 	if(!fs.existsSync(imageDataDir))
 		mkdirp.sync(imageDataDir);
 	if(!fs.existsSync(fileDataDir))
 		mkdirp.sync(fileDataDir);
} else {
 	console.error("Ethereum - no connection to RPC server from 47");
}


//===========================
//==== API to call BEGIN ====
//===========================
function uploadPhotoFromDisk(path,tag,geoLocation){
	addFileToIPFSAndSendTransaction(path,tag,geoLocation)
		.then(()=>{
			console.log("Completed adding image and thumbnail.");
		})
}

function deletePhotoFromDisk(path,tag){
	deleteFileFromIPFSSendTransaction(path,tag)
		.then(()=>{
			console.log("Completed deleting image.")
		})
}

function viewPhoto(thumbnailHash){
	var imageHash=thumbnailHashToImageHash[thumbnailHash];
	getIPFSImageData(imageHash)
		.then(()=>{
			console.log("Got image.");
		})
}
//=========================
//==== API to call END ====
//=========================


//=============================
//==== start of IPFS CODE =====
//=============================
var _thumbnailHash;
function getImageThumbnailHash(path){
	return new Promise((resolve,reject)=>{
		lwip.open(path,(error,image)=>{
			image.batch()
				.scale(0.3)
				.writeFile('./thumbNail.png',(err)=>{
					ipfs.util.addFromFs("./thumbNail.png",(err,res)=>{
						if(err){
							console.log("Error while adding thumbNail");
						}
						else{
							_thumbnailHash=res[0]["hash"];
							resolve();
						}
					})
				})
		})
	});
}

function getIPFSImageData(multihash){
	ipfs.files.cat(multihash,(error,stream)=>{
		var writeStream=fs.createWriteStream(imageDataDir + multihash + '.png');
		stream.pipe(writeStream,{end:false});
		console.log('done');
	});
}

function ipfsAddToDisk(hash,thumbnailHash){
	console.log("ipfsAddToDisk_BEGIN");
	getIPFSImageData(hash);
	getIPFSImageData(thumbnailHash);
	console.log("ipfsAddToDisk_END");
}

function deleteFileFromIPFSSendTransaction(path,tag){
	return new Promise((resolve,reject)=>{
		ipfs.util.addFromFs(path,(error,response)=>{
			if(error){
				console.log("File already deleted.");
			}
			else{
				sendTransactionToDelete(address,response[0]["hash"],tag);
				resolve();
			}
		})
	})
}

function addFileToIPFSAndSendTransaction(path,tag,geolocation){
	return new Promise((resolve,reject)=>{
		ipfs.util.addFromFs(path,(error,response)=>{
			if(error){
				console.log(path, error);
				console.log("Error while adding file.");
			}
			else{
				console.log("Added file to IPFS");
				getImageThumbnailHash(path)
					.then(()=>{
						console.log("thumbnailHash is: " + _thumbnailHash);
						thumbnailHashToImageHash[_thumbnailHash]=response[0]["hash"];
						sendTransactionToAdd(address,response[0]["hash"],_thumbnailHash,tag,geolocation);
						resolve();
					})
			}
		})
	})
}
//==========================
//==== end of IPFS CODE ====
//==========================


//==================================
//=====start of fileSystem CODE=====
//==================================
var Mutex=function(){
	this._busy=false;
	this._queue=[];
}

Mutex.prototype.synchronize=function(task){
	this._queue.push(task);
	if(!this._busy){
		this._dequeue();
	}
};

Mutex.prototype._dequeue=function(){
	this._busy=true;
	var next=this._queue.shift();
	if(next){
		this._execute(next);
	}
	else{
		this._busy=false;
	}
};

Mutex.prototype._execute=function(task){
	var self=this;
	task().then(function(){
		self._dequeue();
	},function(){
		self._dequeue();
	});
};

function Photo(hash,thumbNailHash,tag,geoLocation){
	this.hash=hash;
	this.thumbNailHash=thumbNailHash;
	this.tag=tag;
	this.geoLocation=geoLocation;

	this.print=()=>{
		console.log(this.hash);
		console.log(this.thumbNailHash);
		console.log(this.tag);
		console.log(this.geoLocation);
	}
}

function editFile(fileName,photo){
	return new Promise(function(resolve,reject){
		fs.readFile(fileName,'utf8',function(error,json){
			var config={"data":[]};
			try{
				config=JSON.parse(json);
			}catch(e){
				// console.log("empty");
			}
			config["data"].push(photo);
			fs.writeFile(fileName,JSON.stringify(config),'utf8',function(error){
				fs.readFile(fileName,'utf8',function(error,json){
					resolve();
				})
			});
		});
	});
}

function addPhotoToFile(indexOfFile,currPhoto){
	var indexOfFileInInt=parseInt(parseInt(indexOfFile)/10);
	var fileName=fileDataDir + currPhoto.tag + "_" + indexOfFileInInt.toString() + "_" + (indexOfFileInInt+1).toString() + ".txt";
	var jsonPromise=new Promise(function(resolve,reject){
		if(fileName in mutexForFile){
			resolve();
		}
		else{
			mutexForFile[fileName]=new Mutex();
			fs.writeFile(fileName,'',function(error){
				resolve();
			})
		}
	});
	jsonPromise.then(()=>{
		mutexForFile[fileName].synchronize(function(){
			return editFile(fileName,currPhoto)
		});
	});
}

function incrementTag(tag,currPhoto){
	return new Promise((resolve,reject)=>{
		countImagesForTag[tag]=parseInt(countImagesForTag[tag])+1;
		indexOfHashInTagFile[currPhoto.hash]=countImagesForTag[tag];
		console.log(indexOfHashInTagFile[currPhoto.hash]+"__"+currPhoto.hash);
		addPhotoToFile(countImagesForTag[tag],currPhoto);
		resolve();
	});
}

function addPhoto(tag,hash,thumbNailHash,geoLocation){
	console.log("addPhoto_BEGIN");
	console.log(tag,hash,thumbNailHash,geoLocation);
	var currPhoto=new Photo(hash,thumbNailHash,tag,geoLocation);
	var jsonPromise=new Promise(function(resolve,reject){
		// console.log("JSON_PROMISE",hash,thumbNailHash);
		ipfsAddToDisk(hash,thumbNailHash);
		if(tag in countImagesForTag){
			resolve();
		}
		else{
			countImagesForTag[tag]=0;
			mutexForCountImagesTag[tag]=new Mutex();
			resolve();
		}
	});
	jsonPromise.then((error,response)=>{
		mutexForCountImagesTag[tag].synchronize(function(){
			return incrementTag(tag,currPhoto);
		})
	});
	console.log("addPhoto_END");
}

var _result=[];

function readDataFromFile(fileName){
	return new Promise((resolve,reject)=>{
		fs.readFile(fileName,'utf8',(error,json)=>{
			var config=[];
			try{
				config=JSON.parse(json);
			}catch(e){
				throw e;
			}
			_result.push(config);
			resolve();
		})
	})
}

//To use this function include a callback function after
//setting a suitable timer.
//NEED TO UNDERSTAND THIS!
function searchForTagWithRange(tag,startIndex,endIndex){
	_result=[]
	return new Promise((resolve,reject)=>{
		(function loopingOverFiles(index){
			var jsonPromise=new Promise((resolveThis,reject)=>{
				var fileName=tag+"_"+index.toString()+"_"+(index+1).toString()+".txt";
				console.log(fileName);
				index++;
				mutexForFile[fileName].synchronize(()=>{
					return readDataFromFile(fileName)
						.then(()=>{
							resolveThis();
						})
				});
			});
			jsonPromise.then(()=>{
				console.log("now here");
				if(index<parseInt(endIndex)){
					loopingOverFiles(index);
				}
				else if(index==parseInt(endIndex)){
					resolve();
				}
			});
		})(parseInt(startIndex));
	})
}

function deleteFromFileNameAfterLock(fileName,hash){
	// console.log(fileName+"__"+hash);
	return new Promise((resolve,response)=>{
		fs.readFile(fileName,'utf8',function(error,json){
			config=JSON.parse(json);
			configNew={"data":[]};
			(function loopingOverData(index){
				var jsonPromise= new Promise((resolveThis,reject)=>{
					if(config["data"][index].hash!=hash){
						configNew["data"].push(config["data"][index]);
					}
					index++;
					resolveThis();
				});
				jsonPromise.then(()=>{
					if(index<config["data"].length){
						loopingOverData(index);
					}
					else if(index==config["data"].length){
						// console.log("here");
						fs.writeFile(fileName,JSON.stringify(configNew),'utf8',function(error){
							console.log(configNew);
							resolve();
						})
					}
				})
			})(0);
		})
	})
}

function deleteFromFileName(fileName,hash){
	mutexForFile[fileName].synchronize(function(){
		return deleteFromFileNameAfterLock(fileName,hash);
	})
}

function deletePhotoFromFile(tag,hash){
	return new Promise((resolve,response)=>{
		var indexOfHash=parseInt(parseInt(indexOfHashInTagFile[hash])/10);
		var fileName=fileDataDir + tag + "_" + indexOfHash.toString() + "_" + (indexOfHash+1).toString()+".txt";
		deleteFromFileName(fileName,hash);
		resolve();
	})
}

function deletePhoto(tag,hash){
	console.log("DELETING_PHOTO_BEGIN",tag,hash);
	mutexForCountImagesTag[tag].synchronize(function(){
		console.log("DELETING: " + hash);
		fs.exists(imageDataDir + hash + '.png',(exists)=>{
			if(exists){
				console.log('File exists.');
				try{
					fs.unlink(imageDataDir + hash + '.png');
				}
				catch(e){
					console.log(e);
				}
			}
			else{
				console.log("FILE DOSENT EXISTS");
			}
		})
		return deletePhotoFromFile(tag,hash);
	})
	console.log("DELETING_PHOTO_END");
}

function sleep (time){
	return new Promise((resolve)=>{
		setTimeout(resolve,time);
	})
}
//================================
//=====END OF fileSystem CODE=====
//================================


//===========================================
//===== backEndProcess related code BEGIN====
//===========================================
function createAccount() {
	var accountSource = util.parseRemoveLineBreaks('./userAccount.sol');
	var compiledObject = web3.eth.compile.solidity(accountSource);
	var accountContract = web3.eth.contract(compiledObject['<stdin>:userAccount'].info.abiDefinition);
	
	accountContract.new({from: web3.eth.accounts[0], data: compiledObject['<stdin>:userAccount'].code, gas:4700000}, function(e, contract) {
		if(!e) {
			if(!contract.address) {
				console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined ...");
			} else {
				console.log("Contract mined! Address: " + contract.address);
				fs.writeFile(appDataDir + 'accountAddress', contract.address);
				return contract.address;				
			}
		} else {
			console.log(e);
			throw e;
		}
	})
}

function sendTransactionToAdd(address, photoHash, thumbnailHash, tag, geolocation) {
	console.log("_sendTransactionToAdd_BEGING");
	var accountSource = util.parseRemoveLineBreaks('./userAccount.sol');
	var compiledObject = web3.eth.compile.solidity(accountSource);
	var accountContract = web3.eth.contract(compiledObject['<stdin>:userAccount'].info.abiDefinition);
	var account = accountContract.at(address);
	var transactionHash = account.uploadPhoto(photoHash, thumbnailHash, tag, geolocation, {from:web3.eth.accounts[0]});
	console.log("_sendTransactionToAdd_FINISH "+transactionHash);
}

function sendTransactionToDelete(address, photoHash, tag) {
	var accountSource = util.parseRemoveLineBreaks('./userAccount.sol');
	var compiledObject = web3.eth.compile.solidity(accountSource);
	var accountContract = web3.eth.contract(compiledObject['<stdin>:userAccount'].info.abiDefinition);
	var account = accountContract.at(address);
	var transactionHash = account.deletePhoto(photoHash, tag, {from:web3.eth.accounts[0]});
}

function hexToAscii(hexStr) {
	var str = '';
	var n=hexStr.length;
	for(var i=0 ; i<n ; i+=2) {
		var c=String.fromCharCode(parseInt(hexStr.substr(i, 2), 16));
		if((c>='A' && c<='Z') || (c>='a' && c<='z') || (c>='0' && c<='9') || (c=='_')){
			str+=c;
		}
	}
	return str;
}

function init(){
	if(!web3.isConnected()){
		console.log("Ethereum - no connection to RPC server");
	}
	else{
		console.log("Ethereum - connected to RPC server");
		ipfs.swarm.peers(function(err,reponse){
			if(err){
				console.log(err);
			}
			else{
				console.log("IPFS - connected to "+response.Strings.length + " peers");
				console.log(response);
			}
		})
	}
}

function computeOnTransaction(transactionHash){
	console.log("computeOnTransaction_BEGIN");
	web3.eth.getTransactionReceipt(transactionHash,(error,response)=>{
		if(!error){
			if(response["logs"].length>0){
				var functionArgumet=hexToAscii(response["logs"][0]["data"]).toString();
				console.log(functionArgumet.length);
				console.log(functionArgumet=="PHOTO_UPLOAD_START");
				if(response["logs"].length==6){
					// console.log("one of these");
					if(functionArgumet=="PHOTO_UPLOAD_START"){
						var hash=hexToAscii(response["logs"][1]["data"]);
						var thumbnailHash=hexToAscii(response["logs"][2]["data"]);
						var tag=hexToAscii(response["logs"][3]["data"]);
						var geolocation=hexToAscii(response["logs"][4]["data"]);
						addPhoto(tag,hash,thumbnailHash,geolocation);
					}
				}
				else if(response["logs"].length==4){
					// console.log("PHOTO_DELETE_START");
					var hash=hexToAscii(response["logs"][1]["data"]);
					var tag=hexToAscii(response["logs"][2]["data"]);
					deletePhoto(tag,hash);
				}
				else if(response["logs"].length==3){
					if(functionArgumet.indexOf("AddPeer")!=-1){
						console.log("AddPeer");
						addPeer(response["logs"]);
					}
				}
			}
		}
		else{
			console.log(error);
		}
	})
}

function getDataFromBlock(blockIndex){
	console.log(blockIndex);
	web3.eth.getBlockTransactionCount(blockIndex,(error,response)=>{
		var numOfTransaction=JSON.parse(response);
		if(numOfTransaction>0){
			(function loopingOverBlockTransaction(index){
				var jsonPromise=new Promise((resolve,reject)=>{
					web3.eth.getTransactionFromBlock(blockIndex,index,(error,response)=>{
						if(!error){
							try{
								computeOnTransaction(response["hash"]);
							}catch(e){
								console.log(e);
							}
							index++;
							resolve();
						}
					})
				});
				jsonPromise.then(()=>{
					if(index<numOfTransaction){
						loopingOverBlockTransaction(index);
					}
				})
			})(0);
		}
	})
}

function checkForTransactions(){
	console.log(lastBlockNumber);
	web3.eth.getBlockNumber((error,response)=>{
		var blockIndex=JSON.parse(response);
		var goFromBlock=lastBlockNumber;
		lastBlockNumber=blockIndex;
		for(var index=goFromBlock;index<blockIndex;index++){
			getDataFromBlock(index);
		}
	});
}
setInterval(checkForTransactions,3000);
//=========================================
//==== backEndProcess related code END ====
//=========================================


//=======================
//======TEST CODE========
//=======================

// createAccount();
// sleep(1000).then(()=>{
// 	uploadPhotoFromDisk("/home/sandeep/github/EthPhoto/testImages/23048_5_centimeters_per_second.jpg","anime","home");
// })
// uploadPhotoFromDisk("/home/kalyan/opsrc/opensoft2017/EthPhoto/test.png","anime","home");
// uploadPhotoFromDisk("/home/sandeep/github/EthPhoto/testImages/wallhaven-903.png","anime","home");
// uploadPhotoFromDisk("/home/sandeep/github/EthPhoto/testImages/wallhaven-16746.png","anime","home");
// uploadPhotoFromDisk("/home/sandeep/github/EthPhoto/testImages/wallhaven-203329.png","anime","home");
// uploadPhotoFromDisk("/home/sandeep/github/EthPhoto/testImages/wallhaven-239129.jpg","anime","home");
// uploadPhotoFromDisk("/home/sandeep/github/EthPhoto/testImages/wallhaven-285982.jpg","anime","home");
// uploadPhotoFromDisk("/home/sandeep/github/EthPhoto/testImages/wallhaven-373257.jpg","anime","home");
// searchForTagWithRange("anime",0,2)
// 	,then(()=>{
// 		console.log(_result);
// 	})
sleep(2000).then(()=>{
 	deletePhotoFromDisk("/home/kalyan/opsrc/opensoft2017/EthPhoto/test.png","anime");
})
// sleep(10000).then(()=>{
// 	searchForTagWithRange("anime",0,1)
// 		.then(()=>{
// 			console.log(_result);
// 		})
// })
