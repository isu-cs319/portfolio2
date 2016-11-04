/**
 * Created by schott on 03.11.16.
 */
var app = angular.module('App', ['ui.calendar']);
    app.controller('myCtrl', ['$scope', function($scope) {
        $scope.eventSources = [];
    }]);