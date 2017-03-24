pragma solidity ^0.4.10;

//NOT YET TESTED OR COMPILED

contract tagManager {
	
	struct Photo {
		string hash;
		string thumbNailHash;
		uint timestamp;
		bool isDeleted;
	}

	event newBlockAdded(string tagName,string data);
	event messagePrompt(string message);

	mapping (uint => Photo) _photos;
	
	mapping (string => uint) _getUserCount;

	mapping (string => uint) _photosIndex;
	
	Photo[] _pendingPhotos;

	Photo[] _createNewBlockForPhotos;
	
	uint _numPendingPhotos;
	
	bool _fileSystemOccupied;

	uint _blockSize;

	uint _totalBlocks;

	string _tagName;

	function tagManager(string tagName){
		_blockSize=3;
		_fileSystemOccupied=false;
		_totalBlocks=0;
		_numPendingPhotos=0;
		_tagName=tagName;
	}
	
	function strConcat(string _a, string _b, string _c, string _d, string _e) internal returns (string){
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
        for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
        return string(babcde);
    }
    
    string _firstPart;
    string _secondPart;
    
    function constrcutHashThumbNailString(string hash,string thumbNailHash) payable returns (string){
        _firstPart=strConcat("{hash:",hash,",","thumbNailHash:",thumbNailHash);
        _secondPart=strConcat(_firstPart,"}","","","");
        return _secondPart;
    }
    
    string _convertJson;
    string _currentElement;
    string _finalString;

	function convertToJson(uint arrLength) constant returns (string){
	    _finalString="";
		for(uint index=0;index<arrLength;index++){
		    _currentElement=constrcutHashThumbNailString(_createNewBlockForPhotos[index].hash,_createNewBlockForPhotos[index].thumbNailHash);
			if(index!=0){
			    _finalString=strConcat(_finalString,",",_currentElement,"","");
			}
			else{
				_finalString=_currentElement;
			}
		}
		_finalString=strConcat("{[",_finalString,"]}","","");
		return _finalString;
	}
	
	string _data;
	string _newFileName;
	string _firstBlockName;
	string _endBlockName;
	
	function uintToBytes(uint v) constant returns (bytes32 ret) {
        if (v == 0) {
            ret = '0';
        }
        else {
            while (v > 0) {
                ret = bytes32(uint(ret) / (2 ** 8));
                ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
                v /= 10;
            }
        }
        return ret;
    }
    
    function bytes32ToString(bytes32 x) constant returns (string) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }

	function putInNewBlock() payable {
		if(_numPendingPhotos>_blockSize){
			if(!_fileSystemOccupied){
				_fileSystemOccupied=true;
				uint countImages=0;
				while(countImages<_blockSize){
					_createNewBlockForPhotos[countImages]=_pendingPhotos[_numPendingPhotos-1-countImages];
					countImages=countImages+1;
				}
				_totalBlocks=_totalBlocks+1;
				_numPendingPhotos=_numPendingPhotos - _blockSize;
				_data=convertToJson(countImages);
				_firstBlockName=bytes32ToString(uintToBytes(_totalBlocks-1));
				_endBlockName=bytes32ToString(uintToBytes(_totalBlocks));
				_newFileName=strConcat(_tagName,"_",_firstBlockName,"_",_endBlockName);
				// _newFileName=_tagName+"_"+string(_totalBlocks-1)+"_"+string(_totalBlocks);
				newBlockAdded(_newFileName,_data);
				putInNewBlock();
			}
		}
		else{
			_fileSystemOccupied=false;
		}
	}
	
	string _dataNowRecreate;
	string _fileNameRecreate;
	string _firstBlockRecreate;
	string _endBlockRecreate;

	function recreateBlock(Photo[] blockPhotos,uint currBlockIndex) internal {
		uint countImages=0;
		while(countImages<blockPhotos.length){
			_createNewBlockForPhotos[countImages]=blockPhotos[countImages];
			countImages++;
		}
		_dataNowRecreate=convertToJson(countImages);
		_firstBlockRecreate=bytes32ToString(uintToBytes(currBlockIndex));
		_endBlockRecreate=bytes32ToString(uintToBytes(currBlockIndex+1));
		_fileNameRecreate=strConcat(_tagName,_firstBlockRecreate,_endBlockRecreate,"","");
		newBlockAdded(_fileNameRecreate,_dataNowRecreate);
	}
	
	Photo[] _recreateBlockPhotos;

	function deletePhoto(string hash,string thumbNailHash) public payable {
		_getUserCount[hash]--;
		if(_getUserCount[hash]==0){
			while(!_fileSystemOccupied){
			    uint t1=10;
			}
			_fileSystemOccupied=true;
			uint currPhotoIndex=_photosIndex[hash];
			uint photoBlockId=currPhotoIndex/10;
			uint photoBlockIndex=currPhotoIndex%10;
			_photos[currPhotoIndex].isDeleted=true;
			for(uint index=photoBlockId*10;index<(photoBlockId+1)*10;index++){
				if(!_photos[index].isDeleted){
					_recreateBlockPhotos.push(_photos[index]);
				}
			}
			recreateBlock(_recreateBlockPhotos,currPhotoIndex/10);
			_fileSystemOccupied=false;
		}
	}

	function addNewPhoto(string hash,string thumbNailHash) public payable {
		if(_getUserCount[hash]>=1){
			_getUserCount[hash]=_getUserCount[hash]+1;
		}
		else{
			while(!_fileSystemOccupied){}
			_fileSystemOccupied=true;
			_pendingPhotos[_numPendingPhotos].hash=hash;
			_pendingPhotos[_numPendingPhotos].thumbNailHash=thumbNailHash;
			_pendingPhotos[_numPendingPhotos].timestamp=now;
			_numPendingPhotos++;
			_fileSystemOccupied=false;
		}
	}

	function checkIfPhotoExists(string hash) payable returns (bool){
		if(_getUserCount[hash]>=1){
			return true;
		}
		else{
			return false;
		}
	}
}

contract manageInteractions {
    mapping (string => address) _tagContractAddress;

    function addPhoto(string tag,string hash,string thumbNailHash) payable {
        if(_tagContractAddress[tag]!=address(0x0)){
            tagManager tagContract=tagManager(_tagContractAddress[tag]);
            tagContract.addNewPhoto(hash,thumbNailHash);
        }
        else{
            throw ;
        }
    }

    function deletePhoto(string tag,string hash,string thumbNailHash) payable {
        if(_tagContractAddress[tag]!=address(0x0)){
            tagManager tagContract=tagManager(_tagContractAddress[tag]);
            tagContract.deletePhoto(hash,thumbNailHash);
        }
        else{
            throw ;
        }
    }

    function viewPhoto(string hash,string tag) payable returns (bool){
        if(_tagContractAddress[tag]!=address(0x0)){
            tagManager tagContract=tagManager(_tagContractAddress[tag]);
            bool picExists=tagContract.checkIfPhotoExists(hash);
            return picExists;
        }
        else{
            return false;
        }
    }

    function checkIFTagExists(string tag) payable returns (bool){
        if(_tagContractAddress[tag]!=address(0x0)){
            return true;
        }
        else{
            return false;
        }
    }

    function addTagContract(string tag, address contractAddress) payable {
        _tagContractAddress[tag] = contractAddress;
    }
}