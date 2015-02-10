'use strict'

angular.module('st.app').controller('ProductOptionCtrl', ['$scope', '$log',
    'ProductsService', function($scope, $log, ProductsService) {

        $scope.selectedVal = '';
        $scope.selectedLabel = '';

        if ($scope.prodId && $scope.optionLabel) {
            ProductsService.getProductOptions($scope.prodId, function(
                    options) {
                for (var optionIndex in options) {
                    var option = options[optionIndex];
                    if (option.label == $scope.optionLabel)
                        $scope.option = option;
                }
            });
        }

        $scope._click = function(value) {
            $scope.selectedLabel = value.label;
            $scope.selectedVal = value.value;
            $scope.option.selectedVal = value.value;
        };

    }]);