var map;

function initMap() {
    var centerPos = { lat: 22.3333, lng: 87.3333 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: centerPos,
        zoom: 8
    });
}

angular.module('mainCtrl', [])
    .controller('mainController', ['$scope', '$http', '$location', '$timeout', function($scope, $http, $location, $timeout) {
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
        $scope.addToggle = false;
        $scope.allToggle = false;
        $scope.toggleAdd = function() {
            $scope.addToggle = !$scope.addToggle;
            $('#map').removeClass('firstBlur');
        }
        $scope.toggleAll = function() {
            $scope.allToggle = !$scope.allToggle;
        }
    }]);
