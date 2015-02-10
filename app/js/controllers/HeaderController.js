/* 
 * Controller for header.phtml 
 * in site
 */
angular.module('st.app').controller("HeaderCtrl", ['$scope', '$rootScope',
    '$log', 'APP_CONFIG', '$location', '$injector', '$sce', '$animate',
    '$timeout', function($scope, $rootScope, $log, APP_CONFIG, $location,
            $injector, $sce, $animate, $timeout) {
         
    $scope.baseUrl = APP_CONFIG.baseUrl;

}]);
            

