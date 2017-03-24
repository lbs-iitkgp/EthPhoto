pragma solidity ^0.4.10;

contract ManageAccount {

	struct Photo {
		string hash;
		string thumbNailHash;
		uint timestamp;
	}

	mapping (uint => Photo) _photos;
	mapping (string => uint) _ownerOfHash;

	uint _numberOfPhotos;

	address _accountHolder;

	function ManageAccount() {
		_numberOfPhotos = 0;
		_accountHolder = msg.sender;
	}

	function isHolder() constant returns (bool isHolder) {
		return msg.sender == _accountHolder;
	}

	function upload(string hash) returns (int result) {
		if(!isHolder()) {
			result = -1;
		} else {
			_photos[_numberOfPhotos].hash = hash;
			_photos[_numberOfPhotos].timestamp = now;
			_numberOfPhotos++;
			result = 0;
		}
	}

	function getAccountHolder() constant returns (address accountHolder) {
		return _accountHolder;
	}

	function getNumberOfPhotos() constant returns (uint numberOfPhotos) {
		return _numberOfPhotos;
	}

	function accountDelete() {
		if (isHolder()) {
			suicide(_accountHolder);
		}
	}

	function checkIfOwner(string hash) payable returns(bool){
		if(_ownerOfHash[hash]!=address(0x0)){
			return true;
		}
		else{
			return false;
		}
	}
}
