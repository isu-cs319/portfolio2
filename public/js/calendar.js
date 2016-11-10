/**
 * Created by schott on 03.11.16.
 */
var app = angular.module('app', ['ui.calendar', 'ui.bootstrap', 'app.services', 'ngRoute']);

/* Not used yet, $route doesnt update in time...
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/load', {
        //templateUrl: 'index.html',
        controller: 'myCtrl',
        resolve: {
            events: function (srvEvents) {
                return srvEvents.getEvents();
            }
        }
    });
 }]);*/

// Calendar controller
app.controller('myCtrl', ['$scope','$http','$q','$route', '$uibModal', function($scope,$http,$q,$route,$uibModal) {

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();


    $scope.eventSource = {
        url:"/event/fetch",
        method:"POST",
        currentTimezone: false
    };
    $scope.events = [];
    /*
    $scope.asyncEvents = function(){
        var deferred = $q.defer();
            $http.post('/event/fetch', '')
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data) {
                    deferred.reject('Error: ' + data);
                });
        return deferred.promise;
    };
    $scope.asyncEvents2 = function(){
        return $http.post('/event/fetch', '').then(
            function(payload){
                $scope.events = payload.data;
                return payload.data;
            });
    };
    $scope.asyncEvents2().then(function(items)  {
        $scope.events = items;
    });
    console.log($scope.events);
    /*$scope.events =
        [
        {title: 'All Day Event',start: new Date(y, m, 1), status: 'full'},
        {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2), status: 'full'}, // multiple days
        {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false, status: 'partial'},
        {id: 919,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false, status: 'partial'},
        {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false, status: 'partial'},
        {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/', status: 'partial'}
    ];*/
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();
        var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
        callback(events);
    };

    $scope.calEventsExt = {
        color: '#f00',
        textColor: 'yellow',
        events: [
            {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
            {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
            {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        ]
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        // date = event
        $scope.selectedEvent = date;

        var modalInstance = $uibModal.open({
            animation: true,
            component: 'detailsModalComponent',
            resolve: {
                items: function () {
                    return $scope.selectedEvent;
                }
            }
        });
        modalInstance.result.then(function (selectedItem) {
            console.log(selectedItem);
            this.selected = selectedItem;
            $scope.remove(selectedItem.id);
        });
    };
    /* alert on Drop */
    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
        $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
        $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
        var canAdd = 0;
        angular.forEach(sources,function(value, key){
            if(sources[key] === source){
                sources.splice(key,1);
                canAdd = 1;
            }
        });
        if(canAdd === 0){
            sources.push(source);
        }
    };

    /* remove event */
    $scope.remove = function(id) {
        for (var i = 0; i < $scope.events.length; i++) {
            if ($scope.events[i].id == id){
                $scope.events.splice(i,1);
            }
        }
	$scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };
    /* Change View */
    $scope.renderCalender = function(calendar) {
        if(uiCalendarConfig.calendars[calendar]){
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };
    /* config object */
    $scope.uiConfig = {
        calendar:{
            height: 450,
            editable: true,
            header:{
                left: '',
                center: 'title',
                right: 'today prev,next'
            },
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender
        }
    };

    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
    $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];
}]);


// Modal controller
app.controller('modalCtrl', ['$uibModal','$log','$document','$scope', function ($uibModal, $log, $document,$scope) {
    var $ctrl = this;
    $ctrl.items = $scope.events;

    $ctrl.animationsEnabled = true;

    $ctrl.open = function (size, parentSelector) {
        var parentElem = parentSelector ?
            angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;

        var modalInstance = $uibModal.open({
                animation: $ctrl.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                controllerAs: '$ctrl',
                size: size,
                appendTo: parentElem,
                resolve: {
                    items: function () {
                        return $ctrl.items;
                    }
                }
            });
        modalInstance.result.then(function (selectedItem) {
            $ctrl.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
}]);
// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

app.controller('ModalInstanceCtrl',function ($uibModalInstance, items) {
    var $ctrl = this;
    $ctrl.items = items;
    $ctrl.selected = {
        item: $ctrl.items
    };

    $ctrl.ok = function (valid) {
        if (valid == undefined && !valid) // This is a bit of a hack, but it works. Do not change!
            $uibModalInstance.close($ctrl.items);
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


app.component('detailsModalComponent', {
    templateUrl: 'viewEventModal.html',
    bindings: {
        resolve: '<',
        close: '&',
        dismiss: '&'
    },
    controller: function () {
        var $ctrl = this;

        $ctrl.$onInit = function () {
            $ctrl.items = $ctrl.resolve.items;
            $ctrl.selected = {
                item: $ctrl.items
            };
        };

        $ctrl.ok = function () {
            $ctrl.dismiss({$value: 'OK'});
        };

        $ctrl.cancel = function () {
            $ctrl.close({$value: $ctrl.items});
        };
        $ctrl.formatDate = function (date) {
            return date.format("dddd, MMMM Do YYYY, h:mm:ss a");
        }
    }
});

// Begin Timepicker
app.controller('timeCtrl', function ($scope, $log) {
    $scope.hstep = 1;
    $scope.mstep = 15;
    $scope.ismeridian = true;
    $scope.changed = function () {
        $log.log('Time changed to: ' + $scope.mytime);
    };

});
// Date controller
app.controller('dateCtrl', function ($scope) {
    $scope.today = function() {
        $scope.mytime = new Date();
    };
    $scope.today();

    $scope.clear = function() {
        $scope.mytime = null;
    };

    $scope.options = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
    };

    $scope.setEvents = function(items){
        console.log(items);
        $scope.events = items;
    };

    $scope.setDate = function(year, month, day) {
        $scope.mytime = new Date(year, month, day);
    };

    // label current dates on calender TODO: this doesnt work unfortunately...
    function getDayClass(data) {
        var date = data.date,
            mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0,0,0,0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].start).setHours(0,0,0,0);
                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }
        return '';
    }
});
// Textbox, and event creator
app.controller('evtCtrl', ['$scope','$http',function ($scope,$http) {
    $scope.newEvent = {
        start: $scope.mytime,
        title: '',
        availability:'partial',
        id: Date.now(),
        sendTo: ''
    };
    // Phones stuff
    $scope.phones = [$scope.newEvent.sendTo];
    $scope.registerPhone = function () {
        $scope.phones.push($scope.phones.length);
    };

    $scope.changePhone = function (index, elem) {
        $scope.phones[index] = elem;
    };

    $scope.collectPhones = function () {
        $('.phone').each(function (i, obj) {
            $scope.changePhone(i, obj.value);
        });
        $scope.newEvent.sendTo = $scope.phones[0];
        if ($scope.phones.length > 1) {
            for (var i = 1; i < $scope.phones.length; i++) {
                $scope.newEvent.sendTo += ',' + $scope.phones[i];
            }
        }
        console.log($scope.newEvent.sendTo);
    };

    $scope.validatePhones = function () {
        return $scope.phones[0] != '';
    }

    $scope.submit = function () {
        $scope.collectPhones();
        if ($scope.newEvent.title != '' && $scope.validatePhones() && $scope.newEvent.message != '') {
            $scope.newEvent.start = moment.tz($scope.mytime, "America/Chicago").format();
            $scope.events.push($scope.newEvent);
            $http.post("/event", {newEvent: $scope.newEvent})
                .success(function(data){
                    console.log("Success: " + data);  // TODO: display some success
                    return true;
            })
                .error(function(data){
                    console.log('Error: ' + data);   // TODO: display some alert
                    return false;
        });
        }
        else{
            alert("Error. Title, message, or phone field is empty!");
            return false;
        }
    };
    $scope.unSubmit = function (id) {
        $http.post("/event/cancel", {id: id})
            .success(function (data) {
                return data;
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };
}]);
