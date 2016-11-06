'use strict';

var services = angular.module('app.services', []);


services.factory('srvEvents', ['$http', function($http) {
    var sdo = {
        getEvents: function() {
            var promise = $http({ method: 'POST', url: 'event/fetch' })
                .success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        }
    }
    return sdo;

}]);