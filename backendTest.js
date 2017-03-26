const fs=require('fs')
const web3=require('web3')
const ipfsApi=require('ipfs-api')
const concat = require('concat-stream')
const util=require('./util.js')
// const fileSystem=require('./fileSystemOperations.js')

var ipfsHost='localhost';
var ipfsAPIPort='5001';
var ipfsWebPort='8080';
var web3Host='http://localhost';
var web3Port='8545';
web3.setProvider(new web3.providers.HttpProvider(web3Host + ':' + web3Port));
var ipfs=ipfsApi(ipfsHost,ipfsAPIPort);
var lastBlockNumber=0;

//check if web3 connected
// if(!web3.isConnected()){
// 	console.error("Ethereum - no connection to RPC server");
// 	fs.readFile('./accountAddress', 'utf-8', function(error, content) {
//     	if(error) {
//     		content = createAccount();
//     	}
//     	sendTransaction(content, "0xb6c0ec09dbb8444b011bc60de37f46dce1320130c2ef0038d595912280ef71cd", "KalyanThumbnail", "YoMama", "0x87b06760fd412afce37eb3b60c21643979ae769a252d9c6825bf670411fa3f63");
//     });
// }
// else{
// 	console.log("Ethereum - connected to RPC server");
// }
// 

//start of fileSystem CODE

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

var mutexForFile={};
var mutexForCountImagesTag={};
var countImagesForTag={};
var indexOfHashInTagFile={};
var getUserCountForHash={};

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
	var fileName=currPhoto.tag+"_"+indexOfFileInInt.toString()+"_"+(indexOfFileInInt+1).toString()+".txt";
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
	var currPhoto=new Photo(hash,thumbNailHash,tag,geoLocation);
	var jsonPromise=new Promise(function(resolve,reject){
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
function searchforTagWithRange(tag,startIndex,endIndex){
	return new Promise((resolve,reject)=>{
		(function loopingOverFiles(index){
			var jsonPromise=new Promise((resolveThis,reject)=>{
				var fileName=tag+"_"+index.toString()+"_"+(index+1).toString()+".txt";
				console.log(fileName);
				mutexForFile[fileName].synchronize(()=>{
					return readDataFromFile(fileName);
				});
				index++;
				resolveThis();
			});
			jsonPromise.then(()=>{
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
	console.log(fileName+"__"+hash);
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
						console.log("here");
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
		var fileName=tag+"_"+indexOfHash.toString()+"_"+(indexOfHash+1).toString()+".txt";
		deleteFromFileName(fileName,hash);
		resolve();
	})
}

function deletePhoto(tag,hash){
	mutexForCountImagesTag[tag].synchronize(function(){
		return deletePhotoFromFile(tag,hash);
	})
}

function sleep (time){
	return new Promise((resolve)=>{
		setTimeout(resolve,time);
	})
}

//END OF fileSystem CODE

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
				fs.writeFile('accountAddress', contract.address);
				return contract.address;				
			}
		} else {
			console.log(e);
			throw e;
		}
	})
}

// createAccount();

function sendTransactionToAdd(address, photoHash, thumbnailHash, tag, geolocation) {
	var accountSource = util.parseRemoveLineBreaks('./userAccount.sol');
	var compiledObject = web3.eth.compile.solidity(accountSource);
	var accountContract = web3.eth.contract(compiledObject['<stdin>:userAccount'].info.abiDefinition);
	sleep(0).then(()=>{
		var account = accountContract.at(address);
		var transactionHash = account.uploadPhoto(photoHash, thumbnailHash, tag, geolocation, {from:web3.eth.accounts[0]});
	})
}

function sendTransactionToDelete(address, photoHash, tag) {
	var accountSource = util.parseRemoveLineBreaks('/userAccount.sol');
	var compiledObject = web3.eth.compile.solidity(accountSource);
	var accountContract = web3.eth.contract(compiledObject['<stdin>:userAccount'].info.abiDefinition);

	var account = accountContract.at(address);
	var transactionHash = account.deletePhoto(tag, photoHash, {from:web3.eth.accounts[0]});
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
	web3.eth.getTransactionReceipt(transactionHash,(error,response)=>{
		if(!error){
			if(response["logs"].length>0){
				console.log("here");
				var functionArgumet=hexToAscii(response["logs"][0]["data"]).toString();
				console.log(functionArgumet.length);
				console.log(functionArgumet=="PHOTO_UPLOAD_START");
				if(response["logs"].length==6){
					console.log("one of these");
					if(functionArgumet=="PHOTO_UPLOAD_START"){
						var hash=hexToAscii(response["logs"][1]["data"]);
						var thumbnailHash=hexToAscii(response["logs"][2]["data"]);
						var tag=hexToAscii(response["logs"][3]["data"]);
						var geolocation=hexToAscii(response["logs"][4]["data"]);
						addPhoto(tag,hash,thumbnailHash,geolocation);
					}
					else if(functionArgumet=="PHOTO_DELETE_START"){
						var hash=hexToAscii(response["logs"][1]["data"]);
						var tag=hexToAscii(response["logs"][2]["data"]);
						deletePhoto(tag,hash);
					}
				}
				else if(response["logs"].length==3){
					if(functionArgumet.indexOf("AddPeer")!=-1){
						console.log("AddPeer");
						addPeer(response["logs"]);
					}
				}
			}
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