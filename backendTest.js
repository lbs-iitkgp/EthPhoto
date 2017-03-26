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
	fs.readFile('./accountAddress', 'utf-8', function(error, content) {
    	if(error) {
    		content = createAccount();
    	}
    	sendTransaction(content, "0xb6c0ec09dbb8444b011bc60de37f46dce1320130c2ef0038d595912280ef71cd", "KalyanThumbnail", "YoMama", "0x87b06760fd412afce37eb3b60c21643979ae769a252d9c6825bf670411fa3f63");
    });
}
else{
	console.log("Ethereum - connected to RPC server");
}

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

function sendTransaction(address, photoHash, thumbnailHash, tag, geolocation) {
	var accountSource = util.parseRemoveLineBreaks('./userAccount.sol');
	var compiledObject = web3.eth.compile.solidity(accountSource);
	var accountContract = web3.eth.contract(compiledObject['<stdin>:userAccount'].info.abiDefinition);

	var account = accountContract.at(address);
	var arguments = [];
	var transactionHash = account.uploadPhoto(photoHash, thumbnailHash, tag, geolocation, {from:web3.eth.accounts[0]});
	// setTimeout(function () {
	// 	web3.eth.getTransactionReceipt(transactionHash, function(error, response) {
	// 		if(error) {
	// 			console.log(error);
	// 			throw error;
	// 		} else {
	// 			response.logs.forEach(function(value) {
	// 				arguments.push(value.data);
	// 				console.log(hexToAscii(value.data));
	// 			})
	// 		}
	// 	})
	// }, 10000);


}

function hexToAscii(hexStr) {
	var str = '';
	var n=hexStr.length;
	for(var i=0 ; i<n ; i+=2) {
		str += String.fromCharCode(parseInt(hexStr.substr(i, 2), 16));
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
			console.log(response);
			if(response["logs"].length==5){
				if(hexToAscii(response["logs"][0]["data"])=="PHOTO_UPLOAD_START"){
					console.log("AddPhoto");
					addPhoto(response["logs"]);
				}
				else if(hexToAscii(response["logs"][0]["data"])=="DeletePhoto"){
					console.log("DeletePhoto");
					deletePhot(response["logs"]);
				}
			}
			else if(response["logs"].length==3){
				if(hexToAscii(response["logs"][0]["data"])=="AddPeer"){
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
