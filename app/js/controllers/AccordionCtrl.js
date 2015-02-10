'use strict'

angular.module('st.app').controller('AccordionCtrl', ['$scope', '$log', '$sce',
    function($scope, $log, $sce) {
        $scope.accordionGroups = [];
        $scope.oneAtATime = true;

        $scope.$watch('attrSrc', function(n, o) {
            $scope.accordionGroups = [];
            for (var i in $scope.fields) {
                try {
                    if (typeof n[$scope.fields[i]] != 'undefined') {
                        try {
                            n[$scope.fields[i]].content = $sce.trustAsHtml(
                                    n[$scope.fields[i]].content);
                        } catch (e) {
                        }
                        var group = n[$scope.fields[i]];
                        group.isopen = false;
                        $scope.accordionGroups.push(group);
                    }
                } catch (e) {
                    $log.error(e);
                }

            }
        });

    }]);