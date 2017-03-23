const fs=require('fs')
const Web3=require('web3')
const ipfsApi=require('ipfs-api')
const concat = require('concat-stream')

var ipfsHost='localhost';
var ipfsAPIPort='5001';
var ipfsWebPort='8080';
var web3Host='http://localhost';
var web3Port='8545';
var web3=new Web3();
web3.setProvider(new web3.providers.HttpProvider(web3Host + ':' + web3Port));
var ipfs=ipfsApi(ipfsHost,ipfsAPIPort);

//check if web3 connected
if(!web3.isConnected()){
	console.error("Ethereum - no connection to RPC server");
}
else{
	console.log("Ethereum - connected to RPC server");
}

function createNewUserAccount(){
	//TODO
}

function unlockUserAccount(){
	//TODO
}

function uploadFileToIPFS(){
	//TODO
}

function uploadHashToEthereum(){
	//TODO
}

function downloadFileGivenHash(){
	//TODO
}

function searchPhotoForTagWithRange(){
	//TODO
}

function respondToHashChange(){
	//TODO
}

function deleteFileFromNetwork(){
	//TODO
}

function pinFileFromIPFS(){
	//TODO
}