const fs=require('fs')
const web3=require('web3')
const ipfsApi=require('ipfs-api')
const concat = require('concat-stream')

var ipfsHost='localhost';
var ipfsAPIPort='5001';
var ipfsWebPort='8080';
var web3Host='http://localhost';
var web3Port='8545';
web3.setProvider(new web3.providers.HttpProvider(web3Host + ':' + web3Port));
var ipfs=ipfsApi(ipfsHost,ipfsAPIPort);
var lastBlockNumber=0;

//check if web3 connected
if(!web3.isConnected()){
	console.error("Ethereum - no connection to RPC server");
}
else{
	console.log("Ethereum - connected to RPC server");
}

var _interactionManagerAddress="0x152f3027e21e4402855a7c80ad3c5322b38baa59";
var _interactionManagerCode=[{"constant":false,"inputs":[{"name":"tag","type":"string"},{"name":"contractAddress","type":"string"}],"name":"addTagContract","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[{"name":"tag","type":"string"}],"name":"getTagContractAddress","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"}],"name":"functionStatus","type":"event"}];
var _interactionManagerContract=web3.eth.contract(_interactionManagerCode).at(_interactionManagerAddress);

var _tagManagerAddress="0x8a4fa035c9bb538f9394c0e5a1d4e3007c84a684"
var _tagManagerCode=[{"constant":false,"inputs":[{"name":"hash","type":"string"},{"name":"hashThumbNail","type":"string"}],"name":"addNewPhoto","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[],"name":"greet","outputs":[],"payable":true,"type":"function"},{"inputs":[{"name":"tagName","type":"string"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tagName","type":"string"},{"indexed":false,"name":"data","type":"string"}],"name":"newBlockAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"}],"name":"messagePrompt","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"}],"name":"functionStatus","type":"event"}];
// console.log(web3.eth.estimateGas({data:_tagManagerCode}));
var _tagManagerContract=web3.eth.contract(_tagManagerCode).at(_tagManagerAddress);

var _stackAddress="0x459682c0b67a647d9e74118274a9a80c4d18ec6c";
var _stackCode=[{"constant":false,"inputs":[],"name":"greet","outputs":[],"payable":true,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tagName","type":"string"},{"indexed":false,"name":"data","type":"string"}],"name":"newBlockAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"}],"name":"messagePrompt","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"}],"name":"functionStatus","type":"event"}];
var _stackContract=web3.eth.contract(_stackCode).at(_stackAddress);
var _stackContract2=web3.eth.contract(_stackCode).at("0x304beedade15c5ae8f165e2f82fb2a9a8a5c429e");
// var _userManagerAddress="";
// var _userManagerCode="";

// var _userManagerContract=web3.eth.contract(userManagerContract).at(userManagerAddress);

var _allContracts=[_interactionManagerContract, _tagManagerContract,_stackContract];

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

function getUserAccount(){
	if(web3.eth.accounts.length==0){
		console.log("No account found. Create a new account.");
	}
	else{
		console.log("Account found: " + web3.eth.accounts[0]);
	}
}

// console.log(_interactionManagerContract.addTagContract("tree", _tagManagerAddress,{from:web3.eth.accounts[0]}));

function downloadFileGivenHash(multiHash){
	var writeStream=fs.createWriteStream(hash);
	ipfs.files.cat(multiHash,(error,stream)=>{
		stream.pipe(writeStream,{end:false});
	});
}

//search in files inside .EthPhoto/searchBlocks
function searchPhotoForTagWithRange(tag,startIndex,endIndex){
	var dataFromFiles=[];
	(function loopingOverFiles(indexOfFile){
		var jsonPromise=new Promise(function(resolve,reject){
			fs.readFile(tag+'_'+indexOfFile+'_'+(indexOfFile+1)+'.txt','utf8',function(err,data){
				if(err){
					console.log(err);
				}
				else{
					var fileData=JSON.parse(data);
					(function iterateOverData(index){
						var jsonPromiseData=new Promise(function(resolveData,reject){
							dataFromFiles.push(fileData["data"][index]);
							resolveData('done');
						});
						jsonPromiseData.then(function(){
							if(index+1<fileData["data"].length){
								iterateOverData(index+1);
							}
							else{
								resolve('done');
							}
						})
					})(0);
				}
			})
		});
		jsonPromise.then(function(){
			if(indexOfFile+1<endIndex){
				indexOfFile++;
				loopingOverFiles(indexOfFile);
			}
			else{
				return dataFromFiles;
			}
		})
	})(startIndex);
}

function deleteFileFromNetwork(hash,tag){
	if(_userManagerContract.checkIfOwner(hash)){
		_interactonManagerContract.deletePhot(tag,hash);
	}
	else{
		console.log("you are not the owner! :| ");
	}
}

function pinFileToIPFS(){
	//TODO
}

function getTagContractFromTag(tagName){
	_interactionManagerContract.getTagContractAddress(tagName,(error,response)=>{
		console.log(response);
		var _tagManagerContract=web3.eth.contract(_tagManagerCode).at(response);
		return _tagManagerContract;
	})
}

function searchPhotoForTagWithRange(tag,startIndex,endIndex){
	(function loopingOverFiles(indexOfFile){
		var jsonPromise=new Promise(function(resolve,reject){
			fs.readFile(tag+'_'+indexOfFile+'_'+(indexOfFile+1)+'.txt','utf8',function(err,data){
				if(err){
					console.log(err);
				}
				else{
					var fileData=JSON.parse(data);
					(function iterateOverData(index){
						var jsonPromiseData=new Promise(function(resolveData,reject){
							dataFromFiles.push(fileData["data"][index]);
							resolveData('done');
						});
						jsonPromiseData.then(function(){
							if(index+1<fileData["data"].length){
								iterateOverData(index+1);
							}
							else{
								resolve('done');
							}
						})
					})(0);
				}
			})
		});
		jsonPromise.then(function(){
			if(indexOfFile+1<endIndex){
				indexOfFile++;
				loopingOverFiles(indexOfFile);
			}
			else{
				return dataFromFiles;
			}
		})
	})(startIndex);
}

function hex2a(hex){
	var str= '';
	for(var index=0;index<hex.length;index=index+2){
		str=String.fromCharCode(parseInt(hex.substr(index,2),16));
	}
	return str;
}

function processHex(hex){
	var stringFromHex=hex2a(hex);
	return stringFromHex.replace(" ","");
}

function addPhoto(response){
	var hash=processHex(response[1]["data"]);
	var thumbNailHash=processHex(response[2]["data"]);
	var tag=processHex(response[3]["data"]);
	var geoLocation=processHex(response[4]["data"]);
	//get this from IPFS
	//add to the specific block
}


function computeOnTransaction(transactionHash){
	web3.eth.getTransactionReceipt(transactionHash,(error,response)=>{
		if(!error){
			console.log(response["logs"]);
			if(response["logs"].length==4){
				if(processHex(response["logs"][0]["data"])=="AddPhoto"){
					console.log("AddPhoto");
					addPhoto(response["logs"]);
				}
				else if(processHex(response["logs"][0]["data")=="DeletePhoto"){
					console.log("DeletePhoto");
					deletePhot(response["logs"]);
				}
			}
			else if(response["logs"].length==3){
				if(processHex(response["logs"][0]["data"])=="AddPeer"){
					console.log("AddPeer");
					addPeer(response["logs"]);
				}
			}
		}
	})
}

function getDataFromBlock(blockIndex){
	web3.eth.getBlockTransactionCount(blockIndex,(error,response)=>{
		var numOfTransaction=JSON.parse(response);
		for(var index=0;index<numOfTransaction;index++){
			web3.eth.getTransactionFromBlock(blockIndex,index,(error,response)=>{
				if(!error){
					computeOnTransaction(response["hash"]);
				}
			})
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
setInterval(checkForTransactions,5000);