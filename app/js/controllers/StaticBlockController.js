'use strict'

angular.module('st.app').controller('StaticBlockCtrl', ['$scope', '$log',
    '$injector', '$sce', 'APP_CONFIG', function($scope, $log, $injector, $sce,
            APP_CONFIG) {
        $scope.block = {};
        var ContentModel = $injector.get(APP_CONFIG.dataProvider +
                'ContentModel');

        /**
         * watch the blockId. If <> 0, show the block 
         */
        $scope.$watch('blockId', function(n, o) {
            if (n == APP_CONFIG.noBlock || typeof n == 'undefined') {
                $scope.display = false;
                $scope.block = {};
            } else {
                ContentModel.getStaticBlock(n, function(block) {
                    if (block) {
                        block.html = $sce.trustAsHtml(block.html);
                        $scope.block = block;
                        $scope.display = true;
                    } else {
                        $scope.display = false;
                    }
                });
            }
        });
        
        /*
         * remove the block and send an event so that the users could go back to last category
         */
        $scope.removeBlock = function() {
            $scope.display = false;
            $scope.blockId = 0;// reset id
            $scope.$emit('staticBlockExit');
        };
    }]);