var map;

function initMap() {
    var centerPos = { lat: 22.3333, lng: 87.3333 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: centerPos,
        zoom: 8
    });
}

angular.module('mainCtrl', ['ngFileUpload'])
    .controller('mainController', ['$scope', 'Upload', '$http', '$location', '$timeout', function($scope, Upload, $http, $location, $timeout) {
        // Init to get map location
        $scope.init = function() {
            $http.get('http://freegeoip.net/json/')
                .then(function locationSuccessCallback(response) {
                    jsonBody = response.data;
                    centerPos = {
                        lat: jsonBody.latitude,
                        lng: jsonBody.longitude
                    };
                    map.setCenter(centerPos);
                }, function locationErrorCallback(response) {
                    console.log(response);
                });
        }
        $scope.init();

        // Blur classes
        $scope.addToggle = false;
        $scope.allToggle = false;
        $scope.toggleAdd = function() {
            $scope.addToggle = !$scope.addToggle;
            $('#map').removeClass('firstBlur');
        }
        $scope.toggleAll = function() {
            $scope.allToggle = !$scope.allToggle;
        }

        // File uploads
        var newName = '';

        $scope.$watch('file', function() {
            $scope.upload($scope.file);
        });

        $scope.upload = function(file, errFiles) {
            $scope.f = file;
            $scope.errFile = errFiles && errFiles[0];
            if (file) {
                Upload.upload({
                    url: '/api/upload',
                    method: 'POST',
                    arrayKey: '',
                    data: { file: file }
                }).then(function(response) {
                    if (response.data.error_code === 0) {
                        console.log('Success! ' + response.config.data.file.name + ' uploaded.');
                        UploadSuccess.uploadedFile = file;
                        Lowpolify.makeLowPoly(file, 0.15)
                            .success(function(data) {
                                Lowpolify.getLowPoly(file)
                                    .success(function(data) {
                                        $scope.outputFilePath = data;
                                    });
                            });
                    } else {
                        console.log(response.data.err_desc);
                    }
                }, function(response) {
                    console.log('Error status: ' + response.status);
                }, function(evt) {
                    file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                });
            }
        };
    }]);
