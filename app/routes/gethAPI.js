// ONLY SUPPORT FOR .png FILES FOR NOW.
const express = require('express')
const fs = require('fs')
const web3 = require('web3')
const ipfsApi = require('ipfs-api')
const concat = require('concat-stream')
const util = require('./utilAPI.js')
const mkdirp = require('mkdirp')
const request = require('request')
    // const lwip=require('lwip')
var PythonShell=require('python-shell')

app = express();

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.send(200);
    } else {
        return next();
    }
});

const appDataDir = process.env.HOME + '/.EthPhoto/'
const imageDataDir = appDataDir + 'img-store/'
const fileDataDir = appDataDir + 'file-store/'
var web3Host = 'http://localhost';
var web3Port = '8545';

var ipfsHost = 'localhost';
var ipfsAPIPort = '5001';
var ipfsWebPort = '8080';
var ipfs = ipfsApi(ipfsHost, ipfsAPIPort);

var appPort = 6969;

var lastBlockNumber = 0;

//============================
//========VARIABLES===========
//============================
var mutexForFile = {};
var mutexForCountImagesTag = {};
var countImagesForTag = {};
var indexOfHashInTagFile = {};
var getUserCountForHash = {};
var getUserImages = {};
var thumbnailHashToImageHash = {};
var address = "";
var hashToTag = {};
//===========================
//======END OF VARIABLES=====
//===========================

web3.setProvider(new web3.providers.HttpProvider(web3Host + ':' + web3Port));

if (web3.isConnected()) {
    console.log("Ethereum - connected to RPC server");
    fs.readFile(appDataDir + 'accountAddress', 'utf-8', function(error, content) {
        if (error)
            content = createAccount();
        address = content;
    });
    if (!fs.existsSync(imageDataDir))
        mkdirp.sync(imageDataDir);
    if (!fs.existsSync(fileDataDir))
        mkdirp.sync(fileDataDir);
} else {
    console.error("Ethereum - no connection to RPC server from 47");
}

//===========================
//==== API to call BEGIN ====
//===========================
app.post('/uploadPhoto', function uploadPhotoFromDisk(req, res) {
    console.log(req.query.path, req.query.tag, req.query.geoLocation);
    addFileToIPFSAndSendTransaction(req.query.path, req.query.tag, req.query.geoLocation)
        .then(() => {
            res.json("Completed adding image and thumbnail.");
            console.log("Completed adding image and thumbnail.");
        })
});

app.post('/deletePhoto', function deletePhotoFromDisk(req, res) {
    console.log("path - ", req.query.path);
    deleteFileFromIPFSSendTransaction(req.query.path)
        .then(() => {
            res.json("Completed deleting image and thumbnail.");
            console.log("Completed deleting image.")
        })
});

app.post('/viewPhoto', function viewPhoto(thumbnailHash) {
    var imageHash = thumbnailHashToImageHash[thumbnailHash];
    getIPFSImageData(imageHash)
        .then(() => {
            console.log("Got image.");
        })
});
//=========================
//==== API to call END ====
//=========================


//=============================
//==== start of IPFS CODE =====
//=============================
var _thumbnailHash;

function getImageThumbnailHash(path) {
    return new Promise((resolve, reject) => {
        // lwip.open(path,(error,image)=>{
        // 	image.batch()
        // 		.scale(0.3)
        // 		.writeFile('./thumbNail.png',(err)=>{
        // 			ipfs.util.addFromFs("./thumbNail.png",(err,res)=>{
        // 				if(err){
        // 					console.log("Error while adding thumbNail");
        // 				}
        // 				else{
        // 					_thumbnailHash=res[0]["hash"];
        // 					resolve();
        // 				}
        // 			})
        // 		})
        // })
        var options = {
            mode: 'text',
            args: [path]
        };
        console.log(path);
        PythonShell.run('./app/routes/thumbnail-gen.py', options, (err, res) => {
            console.log(err);
            console.log('done');
            ipfs.util.addFromFs('./_thumbnail.png', (err, result) => {
                if (err) {
                    console.log("Error while adding thumbnail");
                } else {
                    _thumbnailHash = result[0]["hash"];
                    resolve();
                }
            })
        })
    });
}

function getIPFSImageData(multihash) {
    ipfs.files.cat(multihash, (error, stream) => {
        if (error) {
            console.log("Error while getting " + multihash, error);
            throw error;
        }
        var writeStream = fs.createWriteStream(imageDataDir + multihash + '.png');
        stream.pipe(writeStream, { end: false });
        console.log('done');
    });
}

function ipfsAddToDisk(hash, thumbnailHash) {
    console.log("ipfsAddToDisk_BEGIN");
    getIPFSImageData(hash);
    getIPFSImageData(thumbnailHash);
    console.log("ipfsAddToDisk_END");
}

function deleteFileFromIPFSSendTransaction(path) {
    return new Promise((resolve, reject) => {
        ipfs.util.addFromFs(path, (error, response) => {
            if (error) {
                console.log("File already deleted.");
            } else {
                try {
                    fs.unlink(path);
                } catch (e) {
                    console.log(e);
                }
                request.delete({
                    'path': 'http://localhost:7070' + '/' + response[0]["hash"]
                });
                var tag = hashToTag[response[0]["hash"]];
                sendTransactionToDelete(address, response[0]["hash"], tag);
                resolve();
            }
        })
    })
}

function addFileToIPFSAndSendTransaction(path, tag, geolocation) {
    console.log(path, tag, geolocation);
    return new Promise((resolve, reject) => {
        ipfs.util.addFromFs(path, (error, response) => {
            if (error) {
                console.log(path, error);
                console.log("Error while adding file.");
            } else {
                console.log("Added file to IPFS");
                hashToTag[response[0]["hash"]] = tag;
                getImageThumbnailHash(path)
                    .then(() => {
                        console.log("thumbnailHash is: " + _thumbnailHash);
                        thumbnailHashToImageHash[_thumbnailHash] = response[0]["hash"];
                        resolve();
                        sendTransactionToAdd(address, response[0]["hash"], _thumbnailHash, tag, geolocation);
                    })
            }
        })
    })
}
//==========================
//==== end of IPFS CODE ====
//==========================


//==================================
//=====start of fileSystem CODE=====
//==================================
var Mutex = function() {
    this._busy = false;
    this._queue = [];
}

Mutex.prototype.synchronize = function(task) {
    this._queue.push(task);
    if (!this._busy) {
        this._dequeue();
    }
};

Mutex.prototype._dequeue = function() {
    this._busy = true;
    var next = this._queue.shift();
    if (next) {
        this._execute(next);
    } else {
        this._busy = false;
    }
};

Mutex.prototype._execute = function(task) {
    var self = this;
    task().then(function() {
        self._dequeue();
    }, function() {
        self._dequeue();
    });
};

function Photo(hash, thumbNailHash, tag, geoLocation) {
    this.hash = hash;
    this.thumbNailHash = thumbNailHash;
    this.tag = tag;
    this.geoLocation = geoLocation;

    this.print = () => {
        console.log(this.hash);
        console.log(this.thumbNailHash);
        console.log(this.tag);
        console.log(this.geoLocation);
    }
}

function editFile(fileName, photo) {
    return new Promise(function(resolve, reject) {
        fs.readFile(fileName, 'utf8', function(error, json) {
            var config = { "data": [] };
            try {
                config = JSON.parse(json);
            } catch (e) {
                // console.log("empty");
            }
            config["data"].push(photo);
            fs.writeFile(fileName, JSON.stringify(config), 'utf8', function(error) {
                fs.readFile(fileName, 'utf8', function(error, json) {
                    resolve();
                })
            });
        });
    });
}

function addPhotoToFile(indexOfFile, currPhoto) {
    var indexOfFileInInt = parseInt(parseInt(indexOfFile) / 10);
    var fileName = fileDataDir + currPhoto.tag + "_" + indexOfFileInInt.toString() + "_" + (indexOfFileInInt + 1).toString() + ".txt";
    var jsonPromise = new Promise(function(resolve, reject) {
        if (fileName in mutexForFile) {
            resolve();
        } else {
            //
            console.log("====================================");
            console.log(fileName + " ADDED TO MUTEX SYSTEM");
            console.log("====================================");
            mutexForFile[fileName] = new Mutex();
            fs.writeFile(fileName, '', function(error) {
                resolve();
            })
        }
    });
    jsonPromise.then(() => {
        mutexForFile[fileName].synchronize(function() {
            return editFile(fileName, currPhoto)
        });
    });
}

function incrementTag(tag, currPhoto) {
    return new Promise((resolve, reject) => {
        countImagesForTag[tag] = parseInt(countImagesForTag[tag]) + 1;
        indexOfHashInTagFile[currPhoto.hash] = countImagesForTag[tag];
        console.log(indexOfHashInTagFile[currPhoto.hash] + "__" + currPhoto.hash);
        addPhotoToFile(countImagesForTag[tag], currPhoto);
        resolve();
    });
}

function addPhoto(tag, hash, thumbNailHash, geoLocation) {
    console.log(geoLocation);
    console.log("addPhoto_BEGIN");
    console.log(tag, hash, thumbNailHash, geoLocation);
    var currPhoto = new Photo(hash, thumbNailHash, tag, geoLocation);
    try {
        // var geoJson=JSON.parse(geoLocation);
        request.post({
            url: 'http://localhost:7070/addMarker/' + hash + '/' + thumbNailHash + '/' + geoLocation['lat'] + '/' + geoLocation['lng'] + '/' + tag
        });
        var jsonPromise = new Promise(function(resolve, reject) {
            // console.log("JSON_PROMISE",hash,thumbNailHash);
            ipfsAddToDisk(hash, thumbNailHash);
            if (tag in countImagesForTag) {
                resolve();
            } else {
                countImagesForTag[tag] = 0;
                mutexForCountImagesTag[tag] = new Mutex();
                resolve();
            }
        });
        jsonPromise.then((error, response) => {
            mutexForCountImagesTag[tag].synchronize(function() {
                return incrementTag(tag, currPhoto);
            })
        });
        console.log("addPhoto_END");
    } catch (e) {
        console.log(e);
        console.log("Error while parsing the geo-Location.");
    }
}

var _result = [];

function readDataFromFile(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf8', (error, json) => {
            var config = [];
            try {
                config = JSON.parse(json);
            } catch (e) {
                throw e;
            }
            _result.push(config);
            resolve();
        })
    })
}

//To use this function include a callback function after
//setting a suitable timer.
//NEED TO UNDERSTAND THIS!

app.get('/searchTag', (req, res) => {
    var tag = req.query.tag;
    var startIndex = req.query.startIndex;
    var endIndex = req.query.endIndex;
    searchForTagWithRange(tag, startIndex, endIndex)
        .then(() => {
            console.log(_result);
            res.json(_result);
        })
})

function searchForTagWithRange(tag, startIndex, endIndex) {
    _result = []
    return new Promise((resolve, reject) => {
        (function loopingOverFiles(index) {
            var jsonPromise = new Promise((resolveThis, reject) => {
                var fileName = fileDataDir + tag + "_" + index.toString() + "_" + (index + 1).toString() + ".txt";
                index++;
                try {
                    mutexForFile[fileName].synchronize(() => {
                        return readDataFromFile(fileName)
                            .then(() => {
                                resolveThis();
                            })
                    });
                } catch (err) {
                    console.log(err);
                }
            });
            jsonPromise.then(() => {
                if (index < parseInt(endIndex)) {
                    loopingOverFiles(index);
                } else if (index == parseInt(endIndex)) {
                    resolve();
                }
            });
        })(parseInt(startIndex));
    })
}

function deleteFromFileNameAfterLock(fileName, hash) {
    // console.log(fileName+"__"+hash);
    return new Promise((resolve, response) => {
        fs.readFile(fileName, 'utf8', function(error, json) {
            config = JSON.parse(json);
            configNew = { "data": [] };
            (function loopingOverData(index) {
                var jsonPromise = new Promise((resolveThis, reject) => {
                    if (config["data"][index].hash != hash) {
                        configNew["data"].push(config["data"][index]);
                    }
                    index++;
                    resolveThis();
                });
                jsonPromise.then(() => {
                    if (index < config["data"].length) {
                        loopingOverData(index);
                    } else if (index == config["data"].length) {
                        fs.writeFile(fileName, JSON.stringify(configNew), 'utf8', function(error) {
                            console.log(configNew);
                            resolve();
                        })
                    }
                })
            })(0);
        })
    })
}

function deleteFromFileName(fileName, hash) {
    mutexForFile[fileName].synchronize(function() {
        return deleteFromFileNameAfterLock(fileName, hash);
    })
}

function deletePhotoFromFile(tag, hash) {
    return new Promise((resolve, response) => {
        var indexOfHash = parseInt(parseInt(indexOfHashInTagFile[hash]) / 10);
        var fileName = fileDataDir + tag + "_" + indexOfHash.toString() + "_" + (indexOfHash + 1).toString() + ".txt";
        deleteFromFileName(fileName, hash);
        resolve();
    })
}

function deletePhoto(tag, hash) {
    console.log("DELETING_PHOTO_BEGIN", tag, hash);
    mutexForCountImagesTag[tag].synchronize(function() {
        console.log("DELETING: " + hash);
        fs.exists(imageDataDir + hash + '.png', (exists) => {
            if (exists) {
                console.log('File exists.');
                try {
                    fs.unlink(imageDataDir + hash + '.png');
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.log("FILE DOSENT EXIST");
            }
        })
        return deletePhotoFromFile(tag, hash);
    })
    console.log("DELETING_PHOTO_END");
}

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    })
}
//================================
//=====END OF fileSystem CODE=====
//================================


//===========================================
//===== backEndProcess related code BEGIN====
//===========================================
function createAccount() {
    // var accountSource = util.parseRemoveLineBreaks('./userAccount.sol');
    // console.log(accountSource);
    // var compiledObject = web3.eth.compile.solidity(accountSource);
    // console.log("compiled object" + compiledObject);
    // var accountContract = web3.eth.contract(compiledObject['<stdin>:userAccount'].info.abiDefinition);
    // console.log(accountContract);
    var accountContract = web3.eth.contract([{ "constant": false, "inputs": [{ "name": "photoHash", "type": "string" }, { "name": "tag", "type": "string" }], "name": "deletePhoto", "outputs": [], "payable": true, "type": "function" }, { "constant": false, "inputs": [{ "name": "photoHash", "type": "string" }, { "name": "thumbnailHash", "type": "string" }, { "name": "tag", "type": "string" }, { "name": "geolocation", "type": "string" }], "name": "uploadPhoto", "outputs": [], "payable": true, "type": "function" }, { "inputs": [], "payable": false, "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "message", "type": "string" }], "name": "addressLogger", "type": "event" }]);
    var data = '0x6060604052341561000c57fe5b5b5b5b6107ca8061001e6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680635d960e1a14610046578063ebe7a7e5146100db575bfe5b6100d9600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506101f6565b005b6101f4600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190505061041f565b005b7fa6389559397379f4838732946412b33d3c7880096a9de333e06c6fd5a3ba6a146040518080602001828103825260128152602001807f50484f544f5f44454c4554455f5354415254000000000000000000000000000081525060200191505060405180910390a17fa6389559397379f4838732946412b33d3c7880096a9de333e06c6fd5a3ba6a148260405180806020018281038252838181518152602001915080519060200190808383600083146102cf575b8051825260208311156102cf576020820191506020810190506020830392506102ab565b505050905090810190601f1680156102fb5780820380516001836020036101000a031916815260200191505b509250505060405180910390a17fa6389559397379f4838732946412b33d3c7880096a9de333e06c6fd5a3ba6a14816040518080602001828103825283818151815260200191508051906020019080838360008314610379575b80518252602083111561037957602082019150602081019050602083039250610355565b505050905090810190601f1680156103a55780820380516001836020036101000a031916815260200191505b509250505060405180910390a17fa6389559397379f4838732946412b33d3c7880096a9de333e06c6fd5a3ba6a146040518080602001828103825260108152602001807f50484f544f5f44454c4554455f454e440000000000000000000000000000000081525060200191505060405180910390a15b5050565b7fa6389559397379f4838732946412b33d3c7880096a9de333e06c6fd5a3ba6a146040518080602001828103825260128152602001807f50484f544f5f55504c4f41445f5354415254000000000000000000000000000081525060200191505060405180910390a17fa6389559397379f4838732946412b33d3c7880096a9de333e06c6fd5a3ba6a148460405180806020018281038252838181518152602001915080519060200190808383600083146104f8575b8051825260208311156104f8576020820191506020810190506020830392506104d4565b505050905090810190601f1680156105245780820380516001836020036101000a031916815260200191505b509250505060405180910390a17fa6389559397379f4838732946412b33d3c7880096a9de333e06c6fd5a3ba6a148360405180806020018281038252838181518152602001915080519060200190808383600083146105a2575b8051825260208311156105a25760208201915060208101905060208303925061057e565b505050905090810190601f1680156105ce5780820380516001836020036101000a031916815260200191505b509250505060405180910390a17fa6389559397379f4838732946412b33d3c7880096a9de333e06c6fd5a3ba6a1482604051808060200182810382528381815181526020019150805190602001908083836000831461064c575b80518252602083111561064c57602082019150602081019050602083039250610628565b505050905090810190601f1680156106785780820380516001836020036101000a031916815260200191505b509250505060405180910390a17fa6389559397379f4838732946412b33d3c7880096a9de333e06c6fd5a3ba6a148160405180806020018281038252838181518152602001915080519060200190808383600083146106f6575b8051825260208311156106f6576020820191506020810190506020830392506106d2565b505050905090810190601f1680156107225780820380516001836020036101000a031916815260200191505b509250505060405180910390a17fa6389559397379f4838732946412b33d3c7880096a9de333e06c6fd5a3ba6a146040518080602001828103825260108152602001807f50484f544f5f55504c4f41445f454e440000000000000000000000000000000081525060200191505060405180910390a15b505050505600a165627a7a72305820d78294893ab0c99669220ea0ee7b3cc44626be5f31093697aef2465de88a0d4e0029';

    accountContract.new({ from: web3.eth.accounts[0], data: data, gas: 470000000 }, function(e, contract) {
        if (!e) {
            if (!contract.address) {
                console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined ...");
            } else {
                console.log("Contract mined! Address: " + contract.address);
                fs.writeFile(appDataDir + 'accountAddress', contract.address);
                return contract.address;
            }
        } else {
            console.log(e);
            throw e;
        }
    })
}

function replaceAllWithCharacters(geolocation) {
    (function loopingOverData(index) {
        var jsonPromise = new Promise((resolve, reject) => {
            if (geolocation[index] == '.') {
                geolocation[index] = '+';
            } else if (geolocation[index] == ':') {
                geolocation[index] = '-';
            }
            console.log(geolocation);
            index++;
            resolve();
        });
        jsonPromise.then(() => {
            if (index < geolocation.size) {
                loopingOverData(index);
            } else {
                console.log("inside replace function.");
                console.log(geolocation);
                return geolocation;
            }
        })
    })(0);
}

function sendTransactionToAdd(address, photoHash, thumbnailHash, tag, geolocation) {
    console.log("_sendTransactionToAdd_BEGIN");
    var accountContract = web3.eth.contract([{ "constant": false, "inputs": [{ "name": "photoHash", "type": "string" }, { "name": "tag", "type": "string" }], "name": "deletePhoto", "outputs": [], "payable": true, "type": "function" }, { "constant": false, "inputs": [{ "name": "photoHash", "type": "string" }, { "name": "thumbnailHash", "type": "string" }, { "name": "tag", "type": "string" }, { "name": "geolocation", "type": "string" }], "name": "uploadPhoto", "outputs": [], "payable": true, "type": "function" }, { "inputs": [], "payable": false, "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "message", "type": "string" }], "name": "addressLogger", "type": "event" }]);
    var account = accountContract.at(address);
    geoJSON = JSON.parse(geolocation);
    console.log(parseFloat(geoJSON.lat), parseFloat(geoJSON.lng));
    var transactionHash = account.uploadPhoto(photoHash, thumbnailHash, tag, parseInt(parseFloat(geoJSON.lat)*1000).toString() + "," + parseInt(parseFloat(geoJSON.lng)*1000).toString(), { from: web3.eth.accounts[0] });
    console.log("_sendTransactionToAdd_FINISH " + transactionHash);
}

function sendTransactionToDelete(address, photoHash, tag) {
    var accountContract = web3.eth.contract([{ "constant": false, "inputs": [{ "name": "photoHash", "type": "string" }, { "name": "tag", "type": "string" }], "name": "deletePhoto", "outputs": [], "payable": true, "type": "function" }, { "constant": false, "inputs": [{ "name": "photoHash", "type": "string" }, { "name": "thumbnailHash", "type": "string" }, { "name": "tag", "type": "string" }, { "name": "geolocation", "type": "string" }], "name": "uploadPhoto", "outputs": [], "payable": true, "type": "function" }, { "inputs": [], "payable": false, "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "message", "type": "string" }], "name": "addressLogger", "type": "event" }]);
    var account = accountContract.at(address);
    var transactionHash = account.deletePhoto(photoHash, tag, { from: web3.eth.accounts[0] });
}

function hexToAscii(hexStr) {
    var str = '';
    var n = hexStr.length;
    for (var i = 0; i < n; i += 2) {
        var c = String.fromCharCode(parseInt(hexStr.substr(i, 2), 16));
        if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || (c == '_') || (c == '{') || (c == ',') || (c == '+') || (c == '-')) {
            if (c == '-') {
                str += ':'
            } else if (c == '+') {
                str += '.'
            } else {
                str += c;
            }
        }
    }
    return str;
}

function init() {
    if (!web3.isConnected()) {
        console.log("Ethereum - no connection to RPC server");
    } else {
        console.log("Ethereum - connected to RPC server");
        ipfs.swarm.peers(function(err, reponse) {
            if (err) {
                console.log(err);
            } else {
                console.log("IPFS - connected to " + response.Strings.length + " peers");
                console.log(response);
            }
        })
    }
}

function computeOnTransaction(transactionHash) {
    console.log("computeOnTransaction_BEGIN");
    web3.eth.getTransactionReceipt(transactionHash, (error, response) => {
        if (!error) {
            if (response["logs"].length > 0) {
                var functionArgumet = hexToAscii(response["logs"][0]["data"]).toString();
                console.log(functionArgumet.length);
                console.log(functionArgumet == "PHOTO_UPLOAD_START");
                if (response["logs"].length == 6) {
                    console.log("one of these");
                    if (functionArgumet == "PHOTO_UPLOAD_START") {
                        var hash = hexToAscii(response["logs"][1]["data"]);
                        var thumbnailHash = hexToAscii(response["logs"][2]["data"]);
                        var tag = hexToAscii(response["logs"][3]["data"]);
                        var geolocation = hexToAscii(response["logs"][4]["data"]);
                        var geoLocationArr = geolocation.split(",");
                        var geoJsonData = {};
                        geoJsonData["lat"] = parseFloat(geoLocationArr[0])/1000;
                        geoJsonData["lng"] = parseFloat(geoLocationArr[1])/1000;
                        sleep(100).then(() => {
                            console.log("hi" + geoJsonData);
                            addPhoto(tag, hash, thumbnailHash, geoJsonData);
                        })
                    }
                } else if (response["logs"].length == 4) {
                    // console.log("PHOTO_DELETE_START");
                    var hash = hexToAscii(response["logs"][1]["data"]);
                    var tag = hexToAscii(response["logs"][2]["data"]);
                    deletePhoto(tag, hash);
                } else if (response["logs"].length == 3) {
                    if (functionArgumet.indexOf("AddPeer") != -1) {
                        console.log("AddPeer");
                        addPeer(response["logs"]);
                    }
                }
            }
        } else {
            console.log(error);
        }
    })
}

function getDataFromBlock(blockIndex) {
    console.log(blockIndex);
    web3.eth.getBlockTransactionCount(blockIndex, (error, response) => {
        try {
            var numOfTransaction = JSON.parse(response);
            if (numOfTransaction > 0) {
                (function loopingOverBlockTransaction(index) {
                    var jsonPromise = new Promise((resolve, reject) => {
                        web3.eth.getTransactionFromBlock(blockIndex, index, (error, response) => {
                            if (!error) {
                                try {
                                    computeOnTransaction(response["hash"]);
                                } catch (e) {
                                    console.log(e);
                                }
                                index++;
                                resolve();
                            }
                        })
                    });
                    jsonPromise.then(() => {
                        if (index < numOfTransaction) {
                            loopingOverBlockTransaction(index);
                        }
                    })
                })(0);
            }
        } catch (e) {
            console.log(e);
        }
    })
}

function checkForTransactions() {
    console.log(lastBlockNumber);
    web3.eth.getBlockNumber((error, response) => {
        var blockIndex = JSON.parse(response);
        var goFromBlock = lastBlockNumber;
        lastBlockNumber = blockIndex;
        for (var index = goFromBlock; index < blockIndex; index++) {
            getDataFromBlock(index);
        }
    });
}
setInterval(checkForTransactions, 3000);
//=========================================
//==== backEndProcess related code END ====
//=========================================

var server = app.listen(appPort, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("EthPhoto listening at http://%s:%s", host, port)
});

// expose app           
exports = module.exports = app;

//=======================
//======TEST CODE========
//=======================

// sleep(20000).then(()=>{
// 	searchForTagWithRange("anime",0,1)
// 		.then(()=>{
// 			console.log(_result);
// 		})
// })
