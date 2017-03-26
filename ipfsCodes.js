const fs=require('fs')
const geth=require('geth')
const web3=require('web3')
const IPFS=require('ipfs-api')
const concat = require('concat-stream')

const ipfs = new IPFS({init:'true',start:'true'})
var ipfsHost='localhost';
var ipfsAPIPort='5001';
var ipfsWebPort='8080';
var ipfsPeers = [];

var web3Host='http://localhost';
var web3Port='8545';

var options = {
	networkid : "123",
	rpc : null,
	datadir : "~/.ethereum-opensoft/",
	nodiscover : null
}

geth.start(options, (err, proc) => {
	if (err) return console.log(err);

	web3.setProvider(new web3.providers.HttpProvider(web3Host + ':' + web3Port));	
	if(web3.isConnected()) {
		console.log("Ethereum - connected to RPC server");
	}
	else {
		console.error("Ethereum - no connection to RPC server");
	}
});

//ipfs.on('start', ()=> {
//	console.log("IPFS daemon started");

//	ipfsPeers.forEach((addr) => {addIPFSPeer(addr)});


	addFile('/home/kalyan/opsrc/opensoft2017/EthPhoto/temp1.png');
	getIPFSFile('QmPEK1DntiVoCpZrtT4sn2bjvFXAqvQciSbY8rvjbNhi8N')
//});

function addIPFSPeer(addr) {
	ipfs.swarm.connect(addr, (err) => {
		if(err) {
			console.log("Unable to add peer " + addr);
			throw err;
		}
		console.log("Added peer " + addr);
	});
}

function listPeers(){
	ipfs.swarm.peers(function(err,peerInfos){
		if(err){
			console.log("Error while listing peers");
			throw err;
		} else {
			console.log(peerInfos);
		}
	})
}

function getEthBalance(account){
	web3.eth.getBalance(account,function(err,balance){
		console.log(parseFloat(web3.fromWei(balance,'ether')));
	});
}

function sendTransaction(){
	//TODO
}

function addFile(data){
	ipfs.util.addFromFs(data, (err,res) => {
		if(err){
			console.log("Error while adding file " + file);
			throw err;
		} else {
			console.log(res);
		}
	});
}

function deleteFile(){
	//TODO
}

function getIPFSFile(multihash) {
	ipfs.files.get(multihash, function(err,rstream) {
		if(err) {
			console.log("Error while getting file over IPFS");
			throw err;
		}
		else {
			var wstream = fs.createWriteStream('tmpx.png');
			rstream.pipe(wstream);

//		var res= ' ';
//		stream.on('data', (file) => {
//			file.content.pipe(process.stdout);
//			//res+=chunk.toString()
//		})
//		stream.on('error',function(err){
//			console.log('On nooooo',err);
//		})
//		stream.on('end',function(){
//			console.log('Got:',res);
		}
	})
//	})
}

function getIPFSImageData(){
	//This multihash is of the temp1.png image
	const multihashStr='QmPEK1DntiVoCpZrtT4sn2bjvFXAqvQciSbY8rvjbNhi8N';
	var writeStream=fs.createWriteStream(multihashStr);
	ipfs.files.cat(multihashStr,(error,stream)=>{
		stream.pipe(writeStream,{end:false});
		})
}
