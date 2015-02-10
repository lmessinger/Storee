'use strict'

angular.module('st.app').controller('ProductDetailsCtrl', ['$scope', '$log',
    'ProductsService', '$rootScope', '$injector', 'APP_CONFIG',
    function($scope, $log, ProductsService, $rootScope, $injector,
            APP_CONFIG) {

        var CartModel = $injector.get(APP_CONFIG.dataProvider +
                'CartModel');

        $scope.product = {};
        $scope.main_img = '';
        $scope.price = '';
        $scope.loading = false;
        $scope.addingProduct = false;
        $scope.attributes = [];
        $scope.options = [];
        $scope.attributes = [];
        $scope.showCtrls = false;
        $scope.productSize = '';
        $scope.alerts = [];

        /**
         * Validates product options/attributes before adding
         * product to bag/cart
         * 
         * @returns {Boolean}
         */
        $scope._validateOptions = function() {
            for (var optionIndex in $scope.options) {
                var option = $scope.options[optionIndex];
                if (typeof option.selectedVal == 'undefined') {
                    $scope.alerts.push({type: 'warning',
                        msg: 'Please select some value for "' + option.label +
                                '"'});
                    return false;
                }
            }

            return true;
        };

        /**
         * Closes the alert upon clicking the close icon. An index argument is
         * passed if we want to close relevant alert when displaying multiple
         * alerts on same page.
         * 
         * @param {type} index
         * @returns {undefined}
         */
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        /**
         * Validates the product and then add it to bag/cart
         * 
         * @returns {undefined}
         */
        $scope.add2bag = function() {
            if ($scope.addingProduct)
                return;

            $scope.alerts = [];
            if ($scope.product && $scope._validateOptions()) {
                var options = [];

                for (var optionIndex in $scope.options) {
                    options.push({
                        id: $scope.options[optionIndex].id,
                        value: $scope.options[optionIndex].selectedVal,
                        isSuper: $scope.options[optionIndex].is_super
                    });
                }

                $scope.addingProduct = true;

                CartModel.addToCart($scope.prodId, options, 1, function(
                        response) {
                    if (response != '') {
                        $scope.alerts.push({type: 'danger',
                            msg: response
                        });
                    } else {
                        $scope.alerts.push({type: 'success',
                            msg: 'Thanks! Your product is added in the cart.'
                        });
                        $rootScope.$broadcast('st-item-added');
                    }
                    $scope.addingProduct = false;

                    $log.debug(response);
                });
            }
        };

        /**
         * Its an event listener which looks for the selected thumb and then 
         * it displays in the main area.
         * 
         */
        $scope.$on('product_image_selected', function(event, item) {
            $scope.main_img = item.original_image;
            if (typeof $scope.ez != 'undefined') {
                //reloads the image for elevateZoom
                $scope.ez.swaptheimage(item.original_image,
                        item.original_image);
            }
        });

        /**
         * Used for two way data binding if any change in prodId is observed
         * then it will load particular product detail on the page.
         * 
         */
        $scope.$watch('prodId', function(n, o) {
            if ($scope.loading)
                return;

            $scope.loading = true;

            if (n != 0) {
                ProductsService.get(n, function(product) {
                    if (product != null) {
                        $scope.product = product;
                        $scope.main_img = product.image_url;
                        $scope.price = product.final_price;
                        $scope.loading = false;
                        $rootScope.pageTitle = product.name;

                        if (typeof product.attributes == 'undefined' ||
                                product.attributes == null) {
                            ProductsService.getProductAttributes($scope.prodId,
                                    function(attributes) {
                                        $scope.product.attributes = attributes;
                                        $scope.attributes = attributes;
                                    });
                        } else {
                            $scope.attributes = product.attributes;
                        }

                        if (typeof product.options == 'undefined' ||
                                product.options == null) {
                            ProductsService.getProductOptions($scope.prodId,
                                    function(options) {
                                        $scope.product.options = options;
                                        $scope.options = options;
                                    });
                        } else {
                            $scope.options = product.options;
                        }
                    }
                });
            }
        });

    }]);