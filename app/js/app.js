'use strict';

// Make sure to include the `ui.router` module as a dependency
var myApp = angular.module('myApp', ['ui.router','ui.bootstrap'])
.run(
    [        '$rootScope', '$state', '$stateParams',
    function ($rootScope,   $state,   $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    
    }]);