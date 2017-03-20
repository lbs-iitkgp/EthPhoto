function getContractCode() {  // This function must parse ManageAccount.sol, remove line breaks and return the content in string format. Remove the comment once this is implemented.
	return "LBS-OpenSoft2017";
}

function createAccount() {
	var accountSource = getContractCode();
	var compiledObject = web3.eth.compile.solidity(accountSource);

	var accountContract = web3.eth.contract(compiledObject['<stdin>:ManageAccount'].info.abiDefinition);

	var account = accountContract.new({from: web3.eth.accounts[0], data: compiledObject['<stdin>:ManageAccount'].code, gas:30000}, function(e, contract) {
		if(!e) {
			if(!contract.address) {
				console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined ...");
			} else {
				console.log("Contract mined! Address: " + contract.address);
				console.log(contract);
			}
		}
	})
}
