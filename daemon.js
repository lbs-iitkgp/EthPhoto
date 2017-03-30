// ONLY SUPPORT FOR .png FILES FOR NOW.

//=========================
//=========MODULES=========
//=========================
const express=require('express')
const fs=require('fs')
const web3=require('web3')
const ipfsApi=require('ipfs-api')
const concat = require('concat-stream')
const mkdirp=require('mkdirp')
const lwip=require('lwip')
app = express();

//===========================
//=========CONSTANTS=========
//===========================
const appDataDir=process.env.HOME+'/.EthPhoto/'
const imageDataDir=appDataDir+'img-store/'
const fileDataDir=appDataDir+'file-store/'
const web3Host='http://localhost';
const web3Port='8545';
const ipfsHost='localhost';
const ipfsAPIPort='5001';
const ipfsWebPort='8080';

var ipfs=ipfsApi(ipfsHost,ipfsAPIPort);

var lastBlockNumber=0;

//========================
//=========ROUTES=========
//========================
const gethAPI = require('./gethAPI.js')
const ipfsAPI = require('./ipfsAPI.js')
const fileAPI = require('./fileAPI.js')
const utilAPI = require('./utilAPI.js')


//============================
//========VARIABLES===========
//============================
var mutexForFile={};
var mutexForCountImagesTag={};
var countImagesForTag={};
var indexOfHashInTagFile={};
var getUserCountForHash={};
var getUserImages={};
var thumbnailHashToImageHash={};
var address="";
//===========================
//======END OF VARIABLES=====
//===========================

web3.setProvider(new web3.providers.HttpProvider(web3Host + ':' + web3Port));

if(web3.isConnected()) {
	console.log("Ethereum - connected to RPC server");
 	fs.readFile(appDataDir + 'accountAddress', 'utf-8', function(error, content) {
		if(error)
     		content = createAccount();
     	address = content;
     });
 	if(!fs.existsSync(imageDataDir))
 		mkdirp.sync(imageDataDir);
 	if(!fs.existsSync(fileDataDir))
 		mkdirp.sync(fileDataDir);
} else {
 	console.error("Ethereum - no connection to RPC server from 47");
}

app.post('/uploadPhoto', gethAPI.uploadPhotoFromDisk);
app.post('/deletePhoto', gethAPI.deletePhotoFromDisk);
app.post('/viewPhoto', gethAPI.viewPhoto);