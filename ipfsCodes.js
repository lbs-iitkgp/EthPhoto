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
console.log(ipfs);
var account=web3.eth.accounts[0];

//check if web3 connected
if(!web3.isConnected()){
	console.error("Ethereum - no connection to RPC server");
}
else{
	console.log("Ethereum - connected to RPC server");
}

function findPeers(){
	ipfs.swarm.peers(function(err,peerInfos){
		if(err){
			console.log(err);
			throw err;
		}
		else{
			console.log(peerInfos);
			console.log("IPFS - connected to " + peerInfos.Strings.length);
		}
	})
}

function init(){
	ipfs.config.get(function(err,config){
		if(err){
			throw err;
		}
		console.log(config);
	})
}

function getEthBalance(){
	web3.eth.getBalance(account,function(err,balance){
		console.log(parseFloat(web3.fromWei(balance,'ether')));
	});
}

function sendTransaction(){
	//TODO
}

function addFile(){
	ipfs.util.addFromFs('temp1.png',function(err,res){
		if(err){
			throw err;
		}
		console.log(res);
	});
}

function deleteFile(){
	//TODO
}

function getIPFSFileData(){
	ipfs.files.cat(multihashStr,function(error,stream){
		var res= ' ';
		stream.on('data',function(chunk){
			res+=chunk.toString()
		})
		stream.on('error',function(err){
			console.log('On nooooo',err);
		})
		stream.on('end',function(){
			console.log('Got:',res);
		})
	})
}

function getIPFSImageData(){
	//This multihash is of the temp1.png image
	const multihashStr='QmPEK1DntiVoCpZrtT4sn2bjvFXAqvQciSbY8rvjbNhi8N';
	var writeStream=fs.createWriteStream(multihashStr);
	ipfs.files.cat(multihashStr,(error,stream)=>{
		stream.pipe(writeStream,{end:false});
		})
}
