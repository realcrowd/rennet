var rennetApp = angular.module('rennetApp', []);

rennetApp.controller('RennetController', ['$scope', function($scope) {
    $scope.value = new Date();
}]);