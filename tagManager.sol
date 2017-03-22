pragma solidity ^0.4.10;

//NOT YET TESTED OR COMPILED

contract Tag {
	
	struct Photo {
		string hash;
		string thumbNailHash;
		unit timestamp;
		bool isDeleted;
	}

	event newBlockAdded(string tagName,string data);

	mapping (uint => Photo) _photos;
	
	mapping (string => countUsers) _getUserCount;

	mapping (string => uint) _photosIndex;
	
	Photo[] _pedingPhotos;

	Photo[] _createNewBlockForPhotos;
	
	uint _numPendingPhotos;
	
	bool _fileSystemOccupied;

	uint _blockSize;

	unit _totalBlocks;

	string _tagName;

	function Tag(string tagName){
		_blockSize=3;
		_fileSystemOccupied=false;
		_totalBlocks=0;
		_numPendingPhotos=0;
		_tagName=tagName;
	}

	function convertToJson(uint arrLength) constant returns (string finalString){
		string finalString="";
		for(uint index=0;index<arrLength;index++){
			string currentElement="{ " + "hash: " + _createNewBlockForPhotos[index] +", " + "thumbNailHash: " + _createNewBlockForPhotos[index].thumbNailHash + "} ";
			if(index!=0){
				finalString=finalString+ ", " + currentElement;
			}
			else{
				finalString=currentElement;
			}
		}
		finalString="{[" + finalString + "]}";
		return finalString;
	}

	function putInNewBlock(){
		if(_numPendingPhotos>_blockSize){
			if(!_fileSystemOccupied){
				_fileSystemOccupied=true;
				uint countImages=0;
				while(countImages<_blockSize){
					_createNewBlockForPhotos[countImages]=_pedingPhotos[_numPendingPhotos-1-countImages];
					countImages=countImages+1;
				}
				_totalBlocks=_totalBlocks+1;
				_numPendingPhotos=_numPendingPhotos - blockSize;
				string data=convertToJson(countImages);
				string newFileName=_tagName+"_"+string(_totalBlocks-1)+"_"+string(_totalBlocks);
				event(newFileName,data);
				putInNewBlock();
			}
		}
		else{
			_fileSystemOccupied=false;
		}
	}

	function recreateBlock(Photo[] blockPhotos,uint currBlockIndex){
		uint countImages=0;
		while(countImages<blockPhotos.length){
			_createNewBlockForPhotos[countImages]=blockPhotos[countImages];
			countImages++;
		}
		string data=convertToJson(countImages);
		string fileName=_tagName+"_"+string(currBlockIndex)+"_"+string(currBlockIndex+1);
		event(fileName,data);
	}

	function deletePhoto(string hash,string thumbNailHash){
		_getUserCount[hash]--;
		if(_getUserCount[hash]==0){
			while(!_fileSystemOccupied){};
			_fileSystemOccupied=true;
			uint currPhotoIndex=_photosIndex[hash];
			uint photoBlockId=currPhotoIndex/10;
			uint photoBlockIndex=currPhotoIndex%10;
			_photos[currPhotoIndex].isDeleted=true;
			Photo[] recreateBlockPhotos;
			for(uint index=photoBlockId*10;index<(photoBlockId+1)*10;index++){
				if(!_photos[index].isDeleted){
					recreateBlockPhotos.push(_photos[index]);
				}
			}
			recreateBlock(recreateBlockPhotos,currPhotoIndex/10);
			_fileSystemOccupied=false;
		}
	}

	function addNewPhoto(string hash,string thumbNailHash){
		if(_getUserCount[hash]>=1){
			_getUserCount[hash]=_getUserCount[hash]+1;
		}
		else{
			while(!_fileSystemOccupied){}
			_fileSystemOccupied=true;
			_pedingPhotos[_numPendingPhotos].hash=hash;
			_pedingPhotos[_numPendingPhotos].thumbNailHash=thumbNailHash;
			_pedingPhotos[_numPendingPhotos].timestamp=now;
			_numPendingPhotos++;
			_fileSystemOccupied=false;
		}
	}
}