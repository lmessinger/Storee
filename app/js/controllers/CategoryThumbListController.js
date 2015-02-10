'use strict';

/* Category Thumb List Controller */

angular.module('st.app').controller("CategoryThumbListController", [
    '$rootScope', '$scope', 'ProductModel', 'ProductsService', '$location',
    '$log', '$element', '$window', 'APP_CONFIG',
    function($rootScope, $scope, ProductModel, ProductsService,
            $location, $log, $element, $window, APP_CONFIG) {

        $scope.thumbsDatasource = [];
        $scope.thumbnailItemWidth = 0;
        $scope.thumbnailItemMinWidth = 200;
        $scope.prevCatId = -1;
        $scope.thumbnailsCatId = -1;

        var TAG = "CategoryThumbListController";

        /**
         * Monitory any change in the category id from the parent upon which 
         * new items will be loaded in the thumbnail list
         */
        $scope.$watch('catId', function(n, o) {
            /**
             * if the current and old categories aren't same then it means that 
             * we need to get new product list for new category so we have to 
             * set active product id to 0
             */

            if (n == null)
                $scope.thumbnailsCatId = APP_CONFIG.defaultCategory.id;
            else
                $scope.thumbnailsCatId = n;

            $scope.initController();

        });


        /**
         * description:
         * Initiate thumbnails data fetching from ProductsService
         *
         * @returns {undefined}
         */

        $scope.initController = function() {
            // check if thumbnails items are already loaded and displayed
            if ($scope.thumbsDatasource == null ||
                    $scope.thumbsDatasource.length == 0) {

                // fetch and load items for book marked url
                $scope.prevCatId = $scope.thumbnailsCatId;
                $scope.fetchThumbnailsForBookmarks();
            }
            else {
                // category changed from category menu
                if ($scope.prevCatId != $scope.thumbnailsCatId) {

                    $scope.prevCatId = $scope.thumbnailsCatId;

                    $scope.thumbsDatasource = $scope.thumbsDatasource.splice(0,
                            $scope.thumbsDatasource.length);

                    // fetch and load items for normal site open
                    $scope.fetchThumbnails($scope.thumbnailsCatId);
                }
            }
        };
        /**
         *  description:
         *  Fetch items for bookmarked url from ProductsService and load into
         *  thumbnails list
         *  
         * @returns {undefined}
         */


        $scope.fetchThumbnailsForBookmarks = function() {


            var productId = (typeof $scope.activeProdId == 'undefined') ?
                    null : $scope.activeProdId;
            var rank = ProductsService.getProductRank($scope.thumbnailsCatId,
                    productId);

            var size = parseInt($scope.getWindowWidth() /
                    $scope.thumbnailItemMinWidth) * 2;

            //retrieve the 3 product ids from the service on the basis of cateogry and productId
            ProductsService.getProductsBasicData($scope.thumbnailsCatId,
                    productId, rank, size, 'created_at', 'desc', 'prevnext',
                    true, true,
                    function(thumbnails) {

                        if (thumbnails != null) {
                            $scope.thumbsDatasource = thumbnails;
                        }
                    });

        };

        /**
         * description:
         * Fetch data from ProductsService and load into thumbnails list
         *  
         * @param {type} categoryId
         * @returns {undefined}
         */
        $scope.fetchThumbnails = function(categoryId) {

            var size = parseInt($scope.getWindowWidth() /
                    $scope.thumbnailItemMinWidth) * 2;

            // fetch thumbnails from cache
            ProductsService.getProductsBasicData(categoryId, 0, 0, size,
                    'created_at', 'desc', 'prevnext', true, true,
                    function(thumbnails) {
                        if (thumbnails != null) {
                            $scope.thumbsDatasource = thumbnails;
                        }
                    });

        };

        /*
         * description:
         * loadNextThumbnails will be called when there is need to fetch and add thumbnails in thumbnails list
         * It will fetch items next to last fetched item
         * 
         * @param {type} isAppend
         * @returns {undefined}
         * 
         * 
         */
        $scope.loadNext = function(isAppend) {

            if ($scope.thumbsDatasource != null &&
                    $scope.thumbsDatasource.length > 0)
            {
                var thumbLastItem =
                        $scope.thumbsDatasource[$scope.thumbsDatasource.length -
                                1];

                if (thumbLastItem == null)
                    return;
                // fetch thumbnails for rank
                ProductsService.getProductsBasicData($scope.thumbnailsCatId,
                        thumbLastItem.entity_id, thumbLastItem.rank, 10,
                        'created_at', 'desc', 'next', false, false, function(
                                thumbnails) {

                            // No item found. 
                            if (thumbnails == null || thumbnails.length == 0)
                                return;

                            var tempItem = thumbnails[thumbnails.length - 1];

                            if (tempItem == null)
                                return;

                            // item already fetched. No need to add. Just ignore it
                            if (thumbLastItem != null && thumbLastItem.rank ==
                                    tempItem.rank)
                                return;

                            // concatinate newly fetched data in datasource
                            $scope.thumbsDatasource =
                                    $scope.thumbsDatasource.concat(thumbnails);

                        });
            }

        };
        /*
         * description: 
         * loadPrevThumbnails will be called when user open bookmarked url and press prev button to scroll towards
         * left. It will fetch previous items.
         * 
         * @param {type} isAppend
         * @param {type} callback
         * @returns {undefined}
         * 
         */

        $scope.loadPrev = function(isAppend, callback) {

            if ($scope.thumbsDatasource != null &&
                    $scope.thumbsDatasource.length > 0)
            {
                var thumbFirstItem = $scope.getFirstNonNullItem(
                        $scope.thumbsDatasource);
                if (thumbFirstItem == null)
                    return;

                // check if more items are avaiable. Previous to current first item
                if (thumbFirstItem.rank > 1)
                {
                    ProductsService.getProductsBasicData(
                            $scope.thumbnailsCatId,
                            thumbFirstItem.entity_id, thumbFirstItem.rank,
                            10, 'created_at', 'desc', 'prev', false, false,
                            function(thumbnails) {

                                // No item found
                                if (thumbnails == null || thumbnails.length ==
                                        0)
                                    return;

                                var thumbs = $.map(thumbnails, function(value,
                                        key) {
                                    return value;
                                });
                                // concatinate prevous item at the start
                                $scope.thumbsDatasource = thumbs.concat(
                                        $scope.thumbsDatasource);
                            });
                }
            }

        };

        /**
         * Description: 
         * We need to check valid items exist in datasource. So we find first non null item in
         * datasource and return.
         * 
         * @param {type} sourceArr
         * @returns {unresolved}
         * 
         */

        $scope.getFirstNonNullItem = function(sourceArr) {

            for (var i = 0; i < sourceArr.length; ++i)
            {
                var item = sourceArr[i];
                if (item != null)
                    return item;
            }

            return null;
        };

        /**
         * 
         * @returns {undefined}
         */

        $scope.getWindowWidth = function() {
            return $window.innerWidth;
        };

        /**
         * description:
         * onItemClicked method will be called when thumbnail item is clicked. Location
         * will be changed and full product will show current active item
         * 
         * @param {type} itemId
         * @returns {undefined}
         */

        $scope.onItemClicked = function(item) {
            $scope.activeProdId = item.entity_id;
        };

        /**
         * description:
         * This method will be called by GenralThumbListController at the time of item creation.
         * Current controller knows about its datasource structure. It extracts data from item, build 
         * path and return.
         * 
         * @param {type} item
         * @returns {String}
         */

        $scope.buildHREFForItem = function(item) {
            return "#" + $scope.catId + "/" + $scope.selectedCategory.slug +
                    "/" + item.entity_id + "/" + item.slug;
        };


        /**
         * description:
         * This method will be called by GeneralThumbListController. It makes unique id and return
         * 
         * @param {type} item
         * @returns {String}
         */

        $scope.buildFQIdForItem = function(item) {
            return "thumb_" + $scope.catId + "_" + item.entity_id;
        };

        /**
         * 
         * @returns {Boolean}
         */

        $scope.shouldHideThumbList = function() {
            return true;
        };

        /**
         * 
         * @param {type} blnFlag
         * @returns {undefined}
         */

        $scope.showHideThumbs = function(blnFlag) {
            //$scope.$parent.$parent.state = blnFlag;
            $scope.offset = $element.css('bottom');
            $scope.thumbState = blnFlag;
        };


    }]);