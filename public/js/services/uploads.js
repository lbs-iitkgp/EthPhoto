angular.module('uploadService', [])
  .factory('uploadFac', ['$http', function($http) {
    return {
      uploadPhoto: function(filePath, fileTag, fileGL) {
        // return $http.post(':6969/uploadPhoto');
        console.log(filePath, fileTag, fileGL);
        return $http({
          method: 'POST',
          url: 'http://localhost:6969/' + 'uploadPhoto/',
          params: {
            path: filePath,
            tag: fileTag,
            geoLocation: fileGL
          }
        }).then(function(response) {
          console.log(response);
          $scope.successSearch = response.data;
        }, function(response) {
          console.log(response);
        });
      }
    }
  }])
