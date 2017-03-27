const fs=require('fs')

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

// sleep(500).then(()=>{
// 	searchforTagWithRange("tree",0,2)
// 		.then(()=>{
// 			console.log("result");
// 			sleep(200).then(()=>{
// 				console.log(_result);
// 			})
// 		})
// });

// Test Function calls.
// addPhoto("tree","123","123","123");
// addPhoto("tree","34345","234346","324346");
// addPhoto("fooder","34","2342435","3246");
// addPhoto("fooder","545","675767","213123");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","34","456457","6578");
// addPhoto("tree","546","56456","68678");
//put a sleep if delete dosent work.