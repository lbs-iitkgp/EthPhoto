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

var untitled_greeterContract = [{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"greet","outputs":[{"name":"","type":"string"}],"payable":true,"type":"function"},{"inputs":[{"name":"_greeting","type":"string"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"}],"name":"greetings","type":"event"}];
var contractCode=untitled_greeterContract;
var contractAddress="0x2d5295659dfca89502af7584a9e637a11d941b13";

var contract=web3.eth.contract(contractCode).at(contractAddress)
console.log(contract.greet({from:web3.eth.accounts[0]}));

contract.greetings().watch(function(error,response){
	if(!error){
		console.log(response);
	}
})