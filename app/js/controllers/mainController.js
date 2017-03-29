angular.module('mainCtrl', [])
    .controller('mainController', ['$scope', '$http', '$location', '$timeout', function($scope, $http, $location, $timeout) {
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
