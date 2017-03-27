const fs=require('fs')
const mkdirp=require('mkdirp')
const ipfsAPI=require('ipfs-api')

const ipfsHost='localhost';
const ipfsAPIPort='5001';
const ipfsWebPort='8080';
const ipfsDataPath='/home/kalyan/.EthPhoto/image-data/';
var ipfsPeers = [];
var ipfs = ipfsAPI(ipfsHost, ipfsAPIPort)

// ipfsGet('QmXMSzMXC6pTqqDFBZWpgBUZaW3bQ8gYzrjdyv2wkfvSLs');
ipfsAdd("./temp1.png",false);

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

function ipfsAdd(path, recursive) {
	options = {};
	if(recursive) {
		options.recursive = recursive;
	}

	options.hidden = false;
	ipfs.util.addFromFs(path, options, (err,res) => {
		if(err){
			console.log("Error while adding path " + path + ": ", err);
			throw err;
		} else {
			console.log(res);
			return res;
		}
	});
}

function ipfsGet(multihash) {
	mkdirp.sync(ipfsDataPath);
	ipfs.files.get(multihash, (err, stream) => {
		if(err) {
			console.log("Error while getting file over IPFS");
			throw err;
		}
		else {
			stream.on('data', (file) => {
				if(typeof(file.content) != 'undefined')
					file.content.pipe(fs.createWriteStream(ipfsDataPath + file.path));
				else {
					if(!fs.existsSync(ipfsDataPath + file.path))
						mkdirp.sync(ipfsDataPath + file.path);
				}
			})
			stream.on('error', (err) => {
				console.log('Error while getting file',err);
			})
		}
	})
}

function getIPFSImageData(multihash){
	ipfs.files.cat(multihash,(error,stream)=>{
		var writeStream=fs.createWriteStream('./data/'+multihash+'.png');
		stream.pipe(writeStream,{end:false});
		console.log('done');
	});
}

getIPFSImageData("QmPEK1DntiVoCpZrtT4sn2bjvFXAqvQciSbY8rvjbNhi8N");
