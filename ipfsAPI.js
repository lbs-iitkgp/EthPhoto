const lwip=require('lwip')

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