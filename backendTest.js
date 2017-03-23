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

var _interactionManagerAddress="";
var _interactionManagerCode="";
var _userManagerAddress="";
var _userManagerCode="";
var _interactonManagerContract=web3.eth.contract(interactionManagerCode).at(interactionManagerAddress);
var _userManagerContract=web3.eth.contract(userManagerContract).at(userManagerAddress);

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

function createNewUserAccount(){
	//TODO not yet supported by geth-js API.
}

function unlockUserAccount(string passWord){
	var account=getUserAccount();
	//TODO not supported by geth-js API.
}

// saving all files in .EthPhoto/Photos
function uploadFileToIPFS(string pathToFile){
	//TODO
}

function uploadHashToEthereum(){
	//TODO
}

function downloadFileGivenHash(string hash){
	//TODO
}

//search in files inside .EthPhoto/searchBlocks
function searchPhotoForTagWithRange(string tag,int startIndex,int endIndex){
	//TODO
}

function respondToHashChange(){
	//TODO
}

function deleteFileFromNetwork(string hash,string tag){
	if(_userManagerContract.checkIfOwner(hash)){
		_interactonManagerContract.deletePhot(tag,hash);
	}
	else{
		console.log("you are not the owner! :| ");
	}
}

function pinFileFromIPFS(){
	//TODO
}