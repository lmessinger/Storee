'use strict';

/* ProductFull Controller */
angular.module('st.app').controller("ProductFullListCtrl", ['$scope',
    '$location', 'ProductsService', '$rootScope', '$log', '$document',
    function($scope, $location, ProductsService, $rootScope, console, $document) {
        /* ProductFullList Flow:
         1.MainCtrl takes prod id and cat id from URL, sets in currentProdId and currentCategory
         2. ProductFullList directive receives as an atrtibute the ids 
         3. calls ProductService to get product ids  into productsBasicData
         4. creates 3 ProductFulls using a repeater on productsBasicData
         5. Each ProductFull download its image and then broadcasts an image_loaded event. 
         a. for first product,  animateProducts is called on this event, fading in the product
         b. other productFull's are being hidden from view by default
         4. On next (or prev), next_slide is called. it
         a. finds next product in productsBasicData
         b. puts next product in $scope.activeProdId 
         c. puts next product in URL
         */

        $scope.productsBasicData = [
        ]; //Product ids to generate product-full directive
        $scope.hasProducts =
                false; //a flag which is used to show/hide the prev/next navigation if products are there.
        $scope.effect =
                'fade'; // animation effect, fade/slide
        $scope.loading = false;
        $scope.showActiveProd = false;
        $scope.oldProdId = 0;

        var TAG = 'ProductFullListCtrl';

        // autoAnim is used to stop animation
        var autoAnim = null;
        var shouldResetAnim = true;

        /* LM remarked since thought there few issues here:
         a. it is not needed: the product is already here, why duplicate it? ideally we can change next/prev product position and put it using z-layers on top, and then animate
         b. on any case, when adding divs, we need to compile the div, before appending so we can use angular directives inside it. 
         // if($('#product-full-list-last-image').length == 0){
         // $('product-full-list').prepend('<div id="product-full-list-last-image" class="product-full-img"></div>');
         // }
         */
        //image_loaded listener to display the image only when its loaded in the browser's cache
        $scope.$on('image_loaded', function(event, product) {
            try {
                if ($scope.activeProdId == product.id) {
                    $rootScope.pageTitle = product.name;
//                animateProducts($scope, product.image_url);
                    $scope.showActiveProd = true;
                    $scope.loading = false;
                    $rootScope.loading = false;
                    $rootScope.$digest();
                }
            } catch (e) {
            }
        });

        $scope.$on('product_load_failed', function(event, product) {
            console.log(TAG + ' product_load_failed')
            if ($scope.activeProdId == product.id) {
                $scope.loading = false;
                $rootScope.loading = false;
                $rootScope.$digest();
            }
        });

        $scope.$on('st-open-product-details', function(event, link) {
            angular.element($document[0].querySelector(
                    'category-thumb-list')).fadeOut();
            $location.path(link);
        });

        $scope.getAnimClass = function() {
            if ($scope.animate) {
                if ($scope.effect == 'slide')
                    return 'anim-' + $scope.effect + '-' + $rootScope.navdir;
                else
                    return 'anim-' + $scope.effect;
            }
        };

        $scope.setDirection = function() {
            var oldProdRank = ProductsService.getProductRank($scope.catId,
                    $scope.oldProdId);
            var newProdRank = ProductsService.getProductRank($scope.catId,
                    $scope.activeProdId);

            if (newProdRank > oldProdRank) {
                $rootScope.navdir = 'next';
            }
            else if (newProdRank < oldProdRank) {
                $rootScope.navdir = 'prev';
            }
        }

        /**
         * loadProductList, is used to load product list w.r.t given prodId
         * But prodId can be null as well to get product w.r.t catId
         * 
         * @param {type} $scope
         * @param {type} prodId
         * @returns {undefined}
         */
        function loadProductList($scope, prodId) {
            try {
                //productId is null if we are navigating through category id only
                var productId = parseInt(prodId);
                var rank = ProductsService.getProductRank($scope.catId,
                        productId);

                $scope.loading = true;

                //retrieve the 3 product ids from the service on the basis of cateogry and productId
                ProductsService.getProductsBasicData($scope.catId,
                        productId, rank, 3, 'created_at', 'desc',
                        $rootScope.navdir, true, true, function(
                                productsBasicData) {
                            if (productsBasicData != null) {
                                if (productsBasicData.length)
                                    $scope.hasProducts = true;
                                else {
                                    $scope.hasProducts = false;
                                    $scope.loading = false;
                                }

                                //make the activeProdId product, if productId already given then make it 
                                // as activeProdId otherwise find the first prodcut from the list and make it as activeProdId
                                if (productId) {
                                    $scope.activeProdId = productId;
                                } else {
                                    for (var index in productsBasicData) {
                                        $scope.activeProdId =
                                                productsBasicData[index].entity_id;
                                        break;
                                    }
                                }

                                $rootScope.$broadcast('load_product_image',
                                        $scope.activeProdId);

                                $scope.productsBasicData = productsBasicData;
                            } else {
                                $scope.hasProducts = false;
                                $scope.loading = false;
                            }
                        });
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * Monitor any change in the category id from the parent upon which 
         * new list will be loaded in the scope.
         */
        $scope.$watch('catId', function(n, o) {
            if (!$scope.loading) {
                $scope.scheduleAnimation();
            }

        });

        $scope.$watch('activeProdId', function(n, o) {

            $scope.oldProdId = o;
            $scope.setDirection();

            if (!$scope.loading) {

                loadProductList($scope, n);

                /** shouldResetAnim == true means item change is not invoked from
                 *  auto animation. So we should reset animation period so that
                 *  selected item can be displayed for full time
                 */

                if (shouldResetAnim == true)
                    $scope.scheduleAnimation();
            }

        });

        /**
         * 
         * @param {type} $scope
         * @param {type} prodId
         * @returns {Number}
         */
        function getProductIndex($scope, prodId) {
            for (var index in $scope.productsBasicData) {
                if (prodId == $scope.productsBasicData[index].entity_id)
                    return parseInt(index);
            }

            return -1;
        }

        function updateLocation(product_id) {
            ProductsService.get(product_id, function(product) {
                if (product != null) {
                    var path = $location.path();
                    var productPattern = new RegExp(
                            '^/(\\d+)+/([a-zA-Z0-9\\-_]+)+/(\\d+)+/([a-zA-Z0-9\\-_]+)+$');
                    var productParams = productPattern.exec(path);
                    if (productParams != null) {
                        $location.path(productParams[1] + '/' +
                                productParams[2] + '/' + product_id +
                                '/' + product.slug);
                    } else {
                        $location.path(path + '/' + product_id +
                                '/' + product.slug);
                    }
                }
            });
        }
        
        /**
         * listener to angular's event for location change
         * extract the params 
         * TBD: better logic for stopping the animation
         */
        $scope.$on('$locationChangeSuccess', function(event, n, o) {

            try {

                var url = $location.path();; //new url

                var productDetailsPattern = new RegExp(
                        '^/productdetails/(\\d+)+/([a-zA-Z0-9\\-_]+)+$');
                var productDetailsParams = productDetailsPattern.exec(url);
                var cmsPagePattern = new RegExp('^/cmspage/(\\d+)+/([a-zA-Z0-9\\-_]+)+$');
                var cmsPageParams = cmsPagePattern.exec(url);

                // if non-product full list, stop the animation
                if (productDetailsParams != null || cmsPageParams != null) {
                    
                    if ($scope.autoPlay == true){
                        shouldResetAnim = false;
                        $scope.unInitAnimation();
                    }
                } else
                {
                     if ($scope.autoPlay == true)
                     {
                        shouldResetAnim = true;
                        $scope.unInitAnimation();
                        $scope.initAnimation();
                     }
                }

            } catch (e) {
                console.error(e);
            }
        });

        /**
         * prev_slide function to redirect to the previous slide.
         * 
         * @returns {undefined}
         */
        $scope.prev_slide = function() {
            $rootScope.navdir =
                    'prev'; //stores the navigation direction in scope

            console.debug(TAG + ':prev_slide: called');

            //finds the previous product id and redirect the page on that product url
            var prod_index = getProductIndex($scope, $scope.activeProdId);
            console.debug(TAG + ':prev_slide: prod_index: ' + prod_index);

            if (prod_index != -1 && (typeof $scope.productsBasicData[prod_index
                    - 1] != 'undefined')) {

                var prod_id = parseInt($scope.productsBasicData[prod_index
                        - 1].entity_id);

                console.debug(TAG + ':prev_slide: previous prod_id: ' + prod_id);

                if (!isNaN(prod_id)) {
                    $scope.activeProdId = prod_id;
                    updateLocation(prod_id);

                }
            } else {
                console.debug(TAG + ':prev_slide: No previous product found');
            }
        };

        /**
         * next_slide function to redirect to the previous slide.
         * 
         * @returns {undefined}
         */
        $scope.next_slide = function() {
            $rootScope.navdir =
                    'next'; //stores the navigation direction in scope

            //finds the next product id and redirect the page on that product url
            var prod_index = getProductIndex($scope, $scope.activeProdId);
            if (prod_index != -1 && (typeof $scope.productsBasicData[prod_index
                    + 1] != 'undefined')) {
                var prod_id = parseInt($scope.productsBasicData[prod_index
                        + 1].entity_id);

                if (!isNaN(prod_id)) {

                    $scope.activeProdId = prod_id;
                    updateLocation(prod_id);

                }
            }
        };

        /**
         * description:
         * This function will be called for undefine time. It's call be will be 
         * repeat every 5 seconds. If it reaches at last item then gets first item
         * and keeps on moving to next item
         * 
         * @returns {undefined}
         */

        $scope.initAnimation = function() {

            // keep setTimeout reference to stop it
            autoAnim = setTimeout(function() {

                // get next item id and animate to next item
                var prod_index = getProductIndex($scope, $scope.activeProdId);
                if (prod_index != -1 &&
                        (typeof $scope.productsBasicData[prod_index
                                + 1] != 'undefined')) {
                    shouldResetAnim = false;
                    // move to next item
                    $scope.next_slide();
                    $scope.$digest();
                    $scope.initAnimation();
                    shouldResetAnim = true;
                }
                else {
                    // reach at last item. Fetch first one
                    ProductsService.getFirstProduct($scope.catId, function(
                            product) {

                        if (product != null) {
                            var prod_id = parseInt(product.entity_id);

                            if (!isNaN(prod_id)) {
                                shouldResetAnim = false;
                                // set first item as active
                                $scope.activeProdId = prod_id;
                                updateLocation(prod_id);


                                $scope.$digest();

                                shouldResetAnim = true;
                            }
                        }

                        $scope.initAnimation();

                    });

                }
            }, 5000);
        };

        /**
         * description:
         * Stop animation if it is being played. This method will be called when we want to stop animation
         * 
         * @returns {undefined}
         */
        $scope.unInitAnimation = function() {
            if (autoAnim != null) {
                clearTimeout(autoAnim);
                autoAnim = null;
            }
        };

        /**
         * description:
         * When user change category this method will be called. We stop existing
         * animation and schedule new animation. We need to stop and restart animation
         * to display new category first item for 5 seconds otherwise it will be displayed
         * for less time.
         * 
         * @returns {undefined}
         */

        $scope.scheduleAnimation = function() {
            if ($scope.autoPlay == true) {
                $scope.unInitAnimation();
                $scope.initAnimation();
            }
        };

        if ($scope.autoPlay == true) {
            $scope.initAnimation();
        }

    }]);
