'use strict';

/* Main app Controller */

angular.module('st.app').controller("MainCtrl", ['$scope', '$rootScope',
    '$log', 'APP_CONFIG', '$location', '$injector', '$sce', '$animate',
    '$timeout', function($scope, $rootScope, $log, APP_CONFIG, $location,
            $injector, $sce, $animate, $timeout) {
        $scope.showNav = true;
        $scope.bodyClass = '';
        $scope.pageType = 'catalog';
        $rootScope.pageTitle = 'Home';
        $scope.currentProdId = 0;
        $scope.currentCategory = APP_CONFIG.defaultCategory;
        $scope.displayCurrentBlock = false;
        $scope.topLinks = '';
        $scope.showCtrls = true;
        $scope.showFooter = false;
        $scope.state = false;
        $scope.offset = null;
        $scope.headerHtml = '';
        $scope.footerHtml = '';
        $scope.blockId = APP_CONFIG.noBlock;
        $scope.baseUrl = APP_CONFIG.baseUrl;

        var TAG = 'MainCtrl';        
              
        //disables animation of first load and then enable it after 1s
        $animate.enabled(false);
        $timeout(function() {
            $animate.enabled(true);
        }, 3000);

        var ContentModel = $injector.get(APP_CONFIG.dataProvider +
                'ContentModel');

        ContentModel.getBlockHtml('header', function(header) {
            if (typeof header.html != 'undefined' && header.html != null &&
                    header.html.length > 0) {
                $scope.headerHtml = $sce.trustAsHtml(header.html);
            }
        });

        ContentModel.getBlockHtml('footer', function(footer) {
            if (typeof footer.html != 'undefined' && footer.html != null &&
                    footer.html.length > 0) {
                $scope.footerHtml = $sce.trustAsHtml(footer.html);
            }
        });

        /**
         * listener to angular's event for location change
         * extract the params 
         */
        $scope.$on('$locationChangeSuccess', function(event, n, o) {

            try {
                $scope.showFooter = false;
                var url = $location.path(); //new url
                $log.debug(TAG, "locationChange: " + url);

                var categoryPattern = new RegExp(
                        '^/(\\d+)+/([a-zA-Z0-9\\-_]+)+$');
                var productPattern = new RegExp(
                        '^/(\\d+)+/([a-zA-Z0-9\\-_]+)+/(\\d+)+/([a-zA-Z0-9\\-_]+)+$');
                var productDetailsPattern = new RegExp(
                        '^/productdetails/(\\d+)+/([a-zA-Z0-9\\-_]+)+$');
                var pagePattern = new RegExp('^/page/(\\d+)+$');
                var cmsPagePattern = new RegExp('^/cmspage/(\\d+)+/([a-zA-Z0-9\\-_]+)+$');

                var categoryParams = categoryPattern.exec(url);
                var productParams = productPattern.exec(url);
                var productDetailsParams = productDetailsPattern.exec(url);
                var pageParams = pagePattern.exec(url);
                var cmsPageParams = cmsPagePattern.exec(url);
                
                // $scope.currentProdId = 0; Lior remarked: dont change, it creates unncessary loadProducts, and we also need the id for static blocks
                if (categoryParams != null) {
                    //category
                    $scope.bodyClass = 'catalog-page';
                    $scope.pageType = 'catalog';
                    $scope.currentCategory.id = categoryParams[1];
                    $scope.currentCategory.slug = categoryParams[2];
                    $scope.showCtrls = true;
                } else if (productParams != null) {
                    //product
                    $scope.bodyClass = 'catalog-page';
                    $scope.pageType = 'catalog';
                    $scope.currentCategory.id = productParams[1];
                    $scope.currentCategory.slug = productParams[2];
                    $scope.currentProdId = productParams[3];
                    $scope.showCtrls = true;
                } else if (productDetailsParams != null) {
                    //product / cms page
                    $scope.bodyClass = 'pdp-page';
                    $scope.pageType = 'pdp';
                    $scope.currentProdId = productDetailsParams[1];
                    $scope.showFooter = true;
                }
                else if  (cmsPageParams!=null) {
                    //product / cms page
                    $scope.bodyClass = 'cmspage-page';
                    $scope.pageType = 'cmspage';
                    $scope.currentCmsPageId = cmsPageParams[1];
                    $scope.showFooter = true;
                }else if (pageParams != null) {
                    //block
                    $scope.blockId = pageParams[1];
                    $scope.showCtrls = true;
                } else if (url == '/') {
                    $location.path($scope.currentCategory.id + '/' +
                            $scope.currentCategory.slug);
                }

            } catch (e) {
                $log.error(e);
            }
        });

        /**
         * block hidden, go back to previous or default path
         */
        $scope.$on('staticBlockExit', function(event, n, o) {

            var restoredPath = $scope.currentCategory.id + '/' +
                    $scope.currentCategory.slug;
            if ($scope.currentProdId)
                restoredPath += '/' + $scope.currentProdId;

            $location.path(restoredPath);

        })

        $scope.$watch('currentProdId', function(n, o) {
            // no op
        });


        $scope.$watch('currentCategory', function(n, o) {
            /**
             * if the current and old categories aren't same then it means that 
             * we need to get new product list for new category so we have to 
             * set active product id to 0
             */
            if (n.id !== o.id)
                $scope.currentProdId = 0;
        },true);

        /**
         * 
         * @param {type} $event
         */
        $scope.onMouseMove = function($event){
             if(!($event.screenX == $scope.mouseMovePosX && $event.screenY == $scope.mouseMovePosY)) {
                $scope.$broadcast('st-app-mousemove');
             }
             // save mouse position and canel already registered timeout event
            $scope.mouseMovePosX = $event.screenX;
            $scope.mouseMovePosY = $event.screenY;
        }
        
        $scope.onTouch= function() {
            $scope.$broadcast('st-app-mousemove');
        }

        /*
         * Hide the navigation [+]
         */
        $scope.hideNav = function() {
            setTimeout(function(callback) {
                if ($scope.showNav != true) {
                    callback(false);
                }
            }, 100);

            return callback;
        };

    }]);
