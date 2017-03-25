const fs=require('fs')
const web3=require('web3')
// const ipfsApi=require('ipfs-api')
// const concat = require('concat-stream')

// var ipfsHost='localhost';
// var ipfsAPIPort='5001';
// var ipfsWebPort='8080';
// var web3Host='http://localhost';
// var web3Port='8545';
// web3.setProvider(new web3.providers.HttpProvider(web3Host + ':' + web3Port));
// var ipfs=ipfsApi(ipfsHost,ipfsAPIPort);

//check if web3 connected
// if(!web3.isConnected()){
// 	console.error("Ethereum - no connection to RPC server");
// }
// else{
// 	console.log("Ethereum - connected to RPC server");
// }

// var _interactionManagerAddress="0x0fefda4fcdc4b9f4127c8fd1046d28f77b1de5d0";
// var _interactionManagerCode=[{"constant":false,"inputs":[{"name":"tag","type":"string"}],"name":"checkIFTagExists","outputs":[{"name":"","type":"bool"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"string"},{"name":"tag","type":"string"}],"name":"viewPhoto","outputs":[{"name":"","type":"bool"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"tag","type":"string"},{"name":"hash","type":"string"},{"name":"thumbNailHash","type":"string"}],"name":"deletePhoto","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"tag","type":"string"},{"name":"hash","type":"string"},{"name":"thumbNailHash","type":"string"}],"name":"addPhoto","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"tag","type":"string"},{"name":"contractAddress","type":"address"}],"name":"addTagContract","outputs":[],"payable":true,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"}],"name":"functionStatus","type":"event"}];

// var _tagManagerAddress="0x227580b1b0a951b1e644b25878c131d2ea26e3c8"
// var _tagManagerCode=[{"constant":false,"inputs":[{"name":"hash","type":"string"}],"name":"checkIfPhotoExists","outputs":[{"name":"","type":"bool"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"string"},{"name":"thumbNailHash","type":"string"}],"name":"addNewPhoto","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"string"},{"name":"thumbNailHash","type":"string"}],"name":"deletePhoto","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[{"name":"x","type":"bytes32"}],"name":"bytes32ToString","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"v","type":"uint256"}],"name":"uintToBytes","outputs":[{"name":"ret","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"putInNewBlock","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"string"},{"name":"thumbNailHash","type":"string"}],"name":"constrcutHashThumbNailString","outputs":[{"name":"","type":"string"}],"payable":true,"type":"function"},{"constant":true,"inputs":[{"name":"arrLength","type":"uint256"}],"name":"convertToJson","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"inputs":[{"name":"tagName","type":"string"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tagName","type":"string"},{"indexed":false,"name":"data","type":"string"}],"name":"newBlockAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"}],"name":"messagePrompt","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"}],"name":"functionStatus","type":"event"}];

// // var _userManagerAddress="";
// // var _userManagerCode="";

// var _interactionManagerContract=web3.eth.contract(_interactionManagerCode).at(_interactionManagerAddress);
// var _tagManagerContract=web3.eth.contract(_tagManagerCode).at(_tagManagerAddress);
// // var _userManagerContract=web3.eth.contract(userManagerContract).at(userManagerAddress);

// var _addressList=["0x0fefda4fcdc4b9f4127c8fd1046d28f77b1de5d0"]
// var _allContracts=[_interactionManagerContract, _tagManagerContract]

// function init(){
// 	if(!web3.isConnected()){
// 		console.log("Ethereum - no connection to RPC server");
// 	}
// 	else{
// 		console.log("Ethereum - connected to RPC server");
// 		ipfs.swarm.peers(function(err,reponse){
// 			if(err){
// 				console.log(err);
// 			}
// 			else{
// 				console.log("IPFS - connected to "+response.Strings.length + " peers");
// 				console.log(response);
// 			}
// 		})
// 	}
// }

// function getUserAccount(){
// 	if(web3.eth.accounts.length==0){
// 		console.log("No account found. Create a new account.");
// 	}
// 	else{
// 		console.log("Account found: " + web3.eth.accounts[0]);
// 	}
// }

// // function createNewUserAccount(){
// // 	//TODO not yet supported by geth-js API.
// // }

// // function unlockUserAccount(string passWord){
// // 	var account=getUserAccount();
// // 	//TODO not supported by geth-js API.
// // }

// // saving all files in .EthPhoto/Photos
// function uploadFileToIPFS(pathToFile){
// 	//TODO
// }

// // function uploadHashToEthereum(){
// // 	//TODO
// // }

// console.log(_interactionManagerContract.addTagContract("tree", "0x227580b1b0a951b1e644b25878c131d2ea26e3c8",{from:web3.eth.accounts[0]}));

// function downloadFileGivenHash(multiHash){
// 	var writeStream=fs.createWriteStream(hash);
// 	ipfs.files.cat(multiHash,(error,stream)=>{
// 		stream.pipe(writeStream,{end:false});
// 	});
// }

// //search in files inside .EthPhoto/searchBlocks
// function searchPhotoForTagWithRange(tag,startIndex,endIndex){
// 	var dataFromFiles=[];
// 	(function loopingOverFiles(indexOfFile){
// 		var jsonPromise=new Promise(function(resolve,reject){
// 			fs.readFile(tag+'_'+indexOfFile+'_'+(indexOfFile+1)+'.txt','utf8',function(err,data){
// 				if(err){
// 					console.log(err);
// 				}
// 				else{
// 					var fileData=JSON.parse(data);
// 					(function iterateOverData(index){
// 						var jsonPromiseData=new Promise(function(resolveData,reject){
// 							dataFromFiles.push(fileData["data"][index]);
// 							resolveData('done');
// 						});
// 						jsonPromiseData.then(function(){
// 							if(index+1<fileData["data"].length){
// 								iterateOverData(index+1);
// 							}
// 							else{
// 								resolve('done');
// 							}
// 						})
// 					})(0);
// 				}
// 			})
// 		});
// 		jsonPromise.then(function(){
// 			if(indexOfFile+1<endIndex){
// 				indexOfFile++;
// 				loopingOverFiles(indexOfFile);
// 			}
// 			else{
// 				return dataFromFiles;
// 			}
// 		})
// 	})(startIndex);
// }

// function deleteFileFromNetwork(hash,tag){
// 	if(_userManagerContract.checkIfOwner(hash)){
// 		_interactonManagerContract.deletePhot(tag,hash);
// 	}
// 	else{
// 		console.log("you are not the owner! :| ");
// 	}
// }

// function pinFileToIPFS(){
// 	//TODO
// }

// //data of the form str+delimiter+str+delimiter..
// //parse it and return an array of strings.
// // function parseHexToString(string data,string delimiter){
// // 	//TODO
// // }

// // function correctHashOfTheBlock(string fileName,string data){
// // 	//CREATE FILE WITH GIVEN FILENAME
// // 	//WRITE DATA INTO IT.
// // }

// _allContracts.forEach(function(value) {
// 	value.functionStatus().watch(function(err, response) {
// 		if(err) {
// 			console.log(err);
// 		} else {
// 			console.log(response);
// 		}
// 	});
// });

// web3.eth.filter({address:_addressList,'topics':[web3.sha3('functionStatus(string)')]}).watch(function(error,response){
// 	if(!error){
// 		console.log(response);
// //		string args[]=parseHexToString(response.data,',');
// //		correctHashOfTheBlock(args[0],args[1]);
// 	}
// })





toAscii = function(hex) {
    var str = '',
        i = 0,
        l = hex.length;
    if (hex.substring(0, 2) === '0x') {
        i = 2;
    }
    for (i=2; i < l; i+=2) {
        var code = parseInt(hex.substr(i, 2), 16);
        if (code === 0) continue;
        str += String.fromCharCode(code);
    }
    return str;
};





var str=toAscii("0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000c686f6c6120616d69676f7321000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000076c6f6c5844212100000000000000000000000000000000000000000000000000");

console.log(str.substring(3,str.length));