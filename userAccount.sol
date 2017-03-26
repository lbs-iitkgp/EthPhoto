pragma solidity ^0.4.10;

contract userAccount {

	event addressLogger(string message);

	function userAccount() {
	}

	function uploadPhoto(string photoHash, string thumbnailHash, string tag, string geolocation)
 payable {
		addressLogger("PHOTO_UPLOAD_START");
		addressLogger(photoHash);
		addressLogger(thumbnailHash);
		addressLogger(tag);
		addressLogger(geolocation);
		addressLogger("PHOTO_UPLOAD_END");
	}

	function deletePhoto(string photoHash,string tag) payable {
		addressLogger("PHOTO_DELETE_START");
		addressLogger(photoHash);
		addressLogger(tag);
		addressLogger("PHOTO_DELETE_END");
	}
}
