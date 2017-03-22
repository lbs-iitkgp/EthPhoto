pragma solidity ^0.4.10;

contract Tag {
	
	struct Photo {
		string hash;
		string thumbNailHash;
		unit timestamp;
	}

	event newBlockAdded(string tagName,string data);

	mapping (uint => Photo) _photos;

	mapping (address => blockIndex) _photosBlock;
	
	mapping (address => countUsers) _getUserCount;
	
	Photo[] _pedingPhotos;
	
	unint _numPendingPhotos;
	
	bool fileSystemOccupied;

	function convertToJson(){
		//TODO
	}

	function putInNewBlock(){
		//TODO
	}

	function deletePhoto(){
		//TODO
	}
}