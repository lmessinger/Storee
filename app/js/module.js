'use strict';

// Make sure to include the `ui.router` module as a dependency
angular.module('st.app', ['ui.router', 'ui.bootstrap', 'ngSanitize',
    'ngAnimate'])
        .run(
                ['$rootScope', '$state', '$stateParams',
                    function($rootScope, $state, $stateParams) {
                        $rootScope.$state = $state;
                        $rootScope.$stateParams = $stateParams;

                    }]);