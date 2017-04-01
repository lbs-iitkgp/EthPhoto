var map, contentString;
var markers = [];

function initMap() {
    var centerPos = { lat: 22.3333, lng: 87.3333 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: centerPos,
        zoom: 8
    });

    contentString = '<h5>Click on the \'Add photo\' button to add a new picture to this location.</h5>';
}

angular.module('mainCtrl', ['ngFileUpload'])
    .controller('mainController', ['$scope', 'Upload', '$http', '$location', '$timeout', '$compile', 'Clarifai', function($scope, Upload, $http, $location, $timeout, $compile, Clarifai) {
        $scope.addLocation = {};
        $scope.$watch('tagSearch', function() {
            if ($scope.tagSearch != "")
                fetchTags();
        });

        function clickAddButton() {
            $timeout(function() {
                angular.element(document.querySelector('#addButton')).triggerHandler('click');
            }, 0);
        };

        function clickSearchButton() {
            $timeout(function() {
                angular.element(document.querySelector('#searchButton')).triggerHandler('click');
            }, 0);
        };

        function getThumbnail(tHash) {
            $http({
                    url: '/api/renderSearchImage',
                    method: 'GET',
                    params: {
                        name: tHash
                    }
                })
                .then(function locationSuccessCallback(response) {
                    console.log(response);
                    return "data:image/jpeg;base64," + response;
                }, function locationErrorCallback(response) {
                    console.log(response);
                });
        }

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
            $timeout(function() {
                var compiled = $compile(contentString)($scope)

                var infowindow = new google.maps.InfoWindow({
                    content: compiled[0]
                });

                google.maps.event.addListener(map, 'click', function(event) {
                    console.log(event.latLng.lat(), event.latLng.lng());
                    infowindow.setPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
                    infowindow.open(map);
                    $scope.addLocation = { lat: event.latLng.lat(), lng: event.latLng.lng() };
                });

                setInterval(function() {
                    google.maps.event.addListenerOnce(map, 'mousemove', function(event) {
                        $http({
                                url: 'http://localhost:7070/getTopNMarker/20/' + event.latLng.lat() + '/' + event.latLng.lng(),
                                method: 'GET'
                            })
                            .then(function locationSuccessCallback(response) {
                                console.log(response.data);
                                for (var i = 0; i < response.data.length; ++i) {
                                    deleteMarkers();
                                    var tempMarker = {};
                                    tempMarker.loc = {};
                                    tempMarker.loc.lat = parseInt(response.data[i][0].latitude);
                                    tempMarker.loc.lng = parseInt(response.data[i][0].longitude);
                                    // tempMarker.icon = getThumbnail(response.data[i][0].thumbnailHash);
                                    $http({
                                            url: '/api/renderSearchImage',
                                            method: 'GET',
                                            params: {
                                                name: response.data[i][0].thumbnailHash
                                            }
                                        })
                                        .then(function locationSuccessCallback(response) {
                                            console.log(response);
                                            tempMarker.icon = "data:image/jpeg;base64," + response.data;
                                            console.log("tempMarker icon: ");
                                            console.log(tempMarker.icon);
                                            addMarker(tempMarker);
                                        }, function locationErrorCallback(response) {
                                            console.log(response);
                                        });
                                }
                            }, function locationErrorCallback(response) {
                                console.log(response);
                            });
                    });
                }, 500)

            }, 2000);
        }
        $scope.init();

        // Blur classes
        $scope.addToggle = false;
        $scope.allToggle = false;
        $scope.searchToggle = false;
        $scope.toggleAdd = function() {
            console.log("Add toggled!!");
            $scope.addToggle = !$scope.addToggle;
            $('#map').removeClass('firstBlur');
        }
        $scope.toggleAll = function() {
            console.log("All toggled!!");
            $scope.allToggle = !$scope.allToggle;
        }
        $scope.toggleSearch = function() {
            console.log("Search toggled!!");
            $scope.searchToggle = !$scope.searchToggle;
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
                        $scope.uploadedFilePath = response.data.filePath + '/' + response.config.data.file.name;
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

        $scope.getTags = function(file) {
            console.log("Calling getTags for " + file);
            Clarifai.getTags(file)
                .success(function(data) {
                    $scope.clarifaiResponse = data;
                    if ($scope.clarifaiResponse.status_code == "TOKEN_EXPIRED" || $scope.clarifaiResponse.status_code == "TOKEN_INVALID" || $scope.clarifaiResponse.status_code == "TOKEN_APP_INVALID") {
                        Clarifai.authenticate()
                            .success(function(newToken) {
                                Clarifai.getTags(file)
                                    .success(function(newData) {
                                        $scope.imageTags = newData.results[0].result.tag.classes.slice(0, 10);
                                    });
                            });
                    } else
                        $scope.imageTags = $scope.clarifaiResponse.results[0].result.tag.classes.slice(0, 10);
                });
        };

        $scope.uploadFromDisk = function() {
            console.log($scope.uploadedFilePath);
            // uploadFac.uploadPhoto($scope.uploadedFilePath, $scope.tagsText, JSON.stringify($scope.addLocation));
            $http({
                method: 'POST',
                url: 'http://localhost:6969/' + 'uploadPhoto/',
                params: {
                    path: $scope.uploadedFilePath,
                    tag: $scope.tagsText,
                    geoLocation: JSON.stringify($scope.addLocation)
                }
            }).then(function(response) {
                console.log(response);
                $scope.successSearch = response.data;
                clickAddButton();
            }, function(response) {
                console.log(response);
            });
        }

        $scope.fetchImages = function() {
            $http.get('/api/fetchAll')
                .then(function locationSuccessCallback(response) {
                    console.log(response);
                    $scope.myImages = [];
                    var j = 0;
                    (function loopOverfiles(index) {
                        console.log(index);
                        var jsonPromise = new Promise((resolve, reject) => {
                            console.log("find me");
                            if (response.data.files[index][0] != '.') {
                                console.log("if mein");
                                var temp = [];
                                temp['id'] = j;
                                temp['title'] = response.data.files[index];
                                console.log("try to render" + j);
                                $http({
                                        url: '/api/renderImage',
                                        method: 'GET',
                                        params: {
                                            name: response.data.files[index]
                                        }
                                    })
                                    .then(function locationSuccessCallback(response) {
                                        index++;
                                        console.log("over here");
                                        temp['src'] = response.data;
                                        resolve();
                                    }, function locationErrorCallback(response) {
                                        console.log(response);
                                    });
                                $scope.myImages.push(temp);
                                ++j;
                            } else {
                                index++;
                                resolve();
                                console.log("else");
                            }
                        });
                        jsonPromise.then(() => {
                            if (index < response.data.files.length) {
                                loopOverfiles(index);
                            } else if (index == response.data.files.length) {
                                //qwe
                            }
                        })
                    })(0);
                    console.log($scope.myImages);
                }, function locationErrorCallback(response) {
                    console.log(response);
                });
        }

        function fetchTags() {
            $http({
                    url: 'http://localhost:6969/searchTag',
                    method: 'GET',
                    params: {
                        tag: $scope.tagSearch,
                        startIndex: 0,
                        endIndex: 1
                    }
                })
                .then(function locationSuccessCallback(response) {
                    console.log(response);
                    var resArray = response['data'][0]['data'];
                    $scope.searchImages = [];
                    var j = 0;
                    (function loopOverfiles(index) {
                        console.log(index);
                        var jsonPromise = new Promise((resolve, reject) => {
                            console.log("find me");
                            if (resArray[index]['hash'][0] != '.') {
                                console.log("if mein");
                                var temp = [];
                                temp['id'] = j;
                                temp['title'] = resArray[index]['hash'];
                                console.log("try to render" + j);
                                $http({
                                        url: '/api/renderSearchImage',
                                        method: 'GET',
                                        params: {
                                            name: resArray[index]['hash']
                                        }
                                    })
                                    .then(function locationSuccessCallback(response) {
                                        index++;
                                        console.log("over here");
                                        temp['src'] = response.data;
                                        resolve();
                                    }, function locationErrorCallback(response) {
                                        console.log(response);
                                    });
                                $scope.searchImages.push(temp);
                                ++j;
                            } else {
                                index++;
                                resolve();
                                console.log("else");
                            }
                        });
                        jsonPromise.then(() => {
                            if (index < resArray.length) {
                                loopOverfiles(index);
                            } else if (index == resArray.length) {
                                //qwe
                            }
                        })
                    })(0);
                    console.log($scope.searchImages);
                    clickSearchButton();
                }, function locationErrorCallback(response) {
                    console.log(response);
                });
        };

        // Adds a marker to the map and push to the array.
        function addMarker(location) {
            var marker = new google.maps.Marker({
                position: location.loc,
                map: map,
                icon: location.icon
            });
            console.log("searched marker: ");
            console.log(marker);
            markers.push(marker);
        }

        // Sets the map on all markers in the array.
        function setMapOnAll(map) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(map);
            }
        }

        // Removes the markers from the map, but keeps them in the array.
        function clearMarkers() {
            setMapOnAll(null);
        }

        // Shows any markers currently in the array.
        function showMarkers() {
            setMapOnAll(map);
        }

        // Deletes all markers in the array by removing references to them.
        function deleteMarkers() {
            clearMarkers();
            markers = [];
        }

        $scope.closeSearch = function() {
            clickSearchButton();
        }


        $scope.select = function() {
            this.setSelectionRange(0, this.value.length);
        }
    }]);
