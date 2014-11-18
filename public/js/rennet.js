var rennetApp = angular.module('rennetApp', []);

rennetApp.controller('LoginController', ['$scope', function($scope) {
    $scope.value = new Date();
}]);