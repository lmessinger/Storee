'use strict';

/* ProductFull Controller */
angular.module('st.app').controller("ProductFullCtrl", ['$scope',
    'ProductsService', '$rootScope', '$log', '$sce', '$timeout', function(
            $scope, ProductsService, $rootScope, $log, $sce, $timeout) {
        $scope.product = {};
        $scope.descriptionAnimPromise = null;
        $scope.showDescription = false;
        $scope.mouseMovePosX;
        $scope.mouseMovePosY;

        // set class for the image. called by ng-class on the partial
        $scope.fitToSizeClass = function() {
            return $scope.fitToSize ? "st-fitToSize" : "st-dontFitToSize";
        }

        /**
         * This event is used by other controllers to load product image in
         * the browsesr cache on request for given product id.
         */
        $scope.$on('load_product_image', function(event, prodId) {
            if ($scope.prodId == prodId && $scope.product) {
                var img = new Image();
                img.src = $scope.product.image_url;

                //create a message to be broadcasted to its listeners
                var message = {id: prodId, name: $scope.product.name,
                    image_url: $scope.product.image_url};

                /**
                 * when image loading is done in browser's cache then broadcast the message to its listeners
                 * 
                 */
                img.onload = function() {
                    $rootScope.$broadcast('image_loaded', message);
                }

                img.onerror = function() {
                    $rootScope.$broadcast('product_load_failed',
                            message)
                }

            }
        });

        /**
         * received when a mouse has moved
         */
        $scope.$on('st-app-mousemove', function() {
            $scope.makeDescriptionVisible();
        });

        $scope.$watch('prodId', function(n, o) {
            var prod_id = parseInt(n);
            if (!isNaN(prod_id)) {
                $scope.makeDescriptionVisible();
                //retrieve the information related to product from Service
                ProductsService.get(prod_id, function(product) {
                    if (product != null) {
                        //when Product data is retreived then load the image of product in browser's cache
                        var img = new Image();
                        img.src = product.image_url;

                        //create a message to be broadcasted to its listeners
                        var message = {id: prod_id, name: product.name,
                            image_url: product.image_url};

                        //when image loading is done in browser's cache then broadcast the message to its listeners
                        img.onload = function() {
                            $rootScope.$broadcast('image_loaded', message);
                        }

                        img.onerror = function() {
                            $rootScope.$broadcast('product_load_failed',
                                    message)
                        }
                        //load the product in product-full scope
                        try {
                            product.title = $sce.trustAsHtml(product.title);
                        } catch (e) {
                        }
                        $scope.product = product;
                    } else {
                        //create a message to be broadcasted to its listeners
                        var message = {id: prod_id};
                        $rootScope.$broadcast('product_load_failed', message);
                    }
                });
            }
        });

        

        /**
         * Description:
         * It will show description by setting showDescription Flag and registers
         * a timeout event that will hide description after 5 seconds.
         * 
         * @returns {undefined}
         */
        $scope.makeDescriptionVisible = function() {
            if ($scope.descriptionAnimPromise != null) {
                // save mouse position and canel already registered timeout event
                $timeout.cancel($scope.descriptionAnimPromise);
                $scope.descriptionAnimPromise = null;
            }

            $scope.descriptionAnimPromise = $timeout(function() {

                $scope.showDescription = false;
                $scope.descriptionAnimPromise = null;
                $scope.$digest();

            }, 5000);
            $scope.showDescription = true;
        };
    }]);