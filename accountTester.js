const fs=require('fs')
const util=require('./util.js')
const geth=require('geth')
const web3=require('web3')

var web3Host='http://localhost';
var web3Port='8545';

var options = {
    rpc : null,
	rpcapi : "db,eth,net,web3,personal",
    datadir : "~/.ethereum-opensoft/",
    networkid : "123",
    nodiscover : null,
//	unlock : "0",
//	password : "/home/kalyan/pass"
}

//geth.start(options, function(err, proc) {
//    if (err) return console.log(err);

	web3.setProvider(new web3.providers.HttpProvider(web3Host + ':' + web3Port));
	if(web3.isConnected()) {
        console.log("Ethereum - connected to RPC server");
    	fs.readFile('./accountAddress', 'utf-8', function(error, content) {
        	if(error) {
        		content = createAccount();
        	}
        	sendTransaction(content, "0xb6c0ec09dbb8444b011bc60de37f46dce1320130c2ef0038d595912280ef71cd", "KalyanThumbnail", "YoMama", "0x87b06760fd412afce37eb3b60c21643979ae769a252d9c6825bf670411fa3f63");
        });
    }
    else {
        console.error("Ethereum - no connection to RPC server");
    }
//});

function createAccount() {
	var accountSource = util.parseRemoveLineBreaks('./userAccount.sol');
	var compiledObject = web3.eth.compile.solidity(accountSource);
	var accountContract = web3.eth.contract(compiledObject['<stdin>:userAccount'].info.abiDefinition);
	
	accountContract.new({from: web3.eth.accounts[0], data: compiledObject['<stdin>:userAccount'].code, gas:4700000}, function(e, contract) {
		if(!e) {
			if(!contract.address) {
				console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined ...");
			} else {
				console.log("Contract mined! Address: " + contract.address);
				fs.writeFile('accountAddress', contract.address);
				return contract.address;
//				contract.addressLogger().watch(function(error, response) {
//					if(!error) {
//						console.log(response);
//					} else {
//						console.log(error);
//					}
//				});
				
			}
		} else {
			console.log(e);
			throw e;
		}
	})
}

function sendTransaction(address, photoHash, thumbnailHash, tag, geolocation) {
	var accountSource = util.parseRemoveLineBreaks('./userAccount.sol');
	var compiledObject = web3.eth.compile.solidity(accountSource);
	var accountContract = web3.eth.contract(compiledObject['<stdin>:userAccount'].info.abiDefinition);

	var account = accountContract.at(address);
	var transactionHash = account.uploadPhoto(photoHash, thumbnailHash, tag, geolocation, {from:web3.eth.accounts[0]});
	setTimeout(function () {
		web3.eth.getTransactionReceipt(transactionHash, function(error, response) {
			if(error) {
				console.log(error);
				throw error;
			} else {
				response.logs.forEach(function(value) {
					console.log(hexToAscii(value.data));
				})
			}
		})
	}, 5000);
}

function hexToAscii(hexStr) {
	var str = '';
	var n=hexStr.length;
	for(var i=0 ; i<n ; i+=2) {
		str += String.fromCharCode(parseInt(hexStr.substr(i, 2), 16));
	}
	return str;
}
