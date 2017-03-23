pragma solidity ^0.4.10;

contract manageInteractions {
	mapping (string => address) _tagContractAddress;

	event newTagAdded(string tag,_tagContractAddress[tag]);

	function addPhoto(string tag,string hash,string thumbNailHash){
		if(_tagContractAddress[tag]!=address(0x0)){
			tagContract=tagManager(_tagContractAddress[tag]);
			tagContract.addNewPhoto(hash,thumbNailHash);
		}
		else{
			throw ;
		}
	}

	function deletePhoto(){
		if(_tagContractAddress[tag]!=address(0x0)){
			tagContract=tagManager(_tagContractAddress[tag]);
			tagContract.deletePhoto(hash,thumbNailHash);
		}
		else{
			throw ;
		}
	}

	function viewPhoto(string hash,string tag) returns (bool){
		if(_tagContractAddress[tag]!=address(0x0)){
			tagContract=tagManager(_tagContractAddress[tag]);
			bool picExists=tagContract.checkIfPhotoExists(hash);
			return picExists;
		}
		else{
			return false;
		}
	}

	function checkIFTagExists(string tag) returns (bool){
		if(_tagContractAddress[tag]!=address(0x0)){
			return true;
		}
		else{
			return false;
		}
	}
}