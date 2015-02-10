'use strict';

/* Thumbnail Controller */

myApp.controller("ThumbnailController", ['$rootScope', '$scope', 'ProductModel',
    'ProductsService', '$stateParams', '$location', '$window','$log',
    function($rootScope, $scope, ProductModel, ProductsService, $stateParams,
    $location, $window,$log) {
        
        $scope.thumbnailItemWidth = 0;
        $scope.thumbnailItemMinWidth = 200;
        $scope.isMouseUpOnNav = false;
        $scope.showThumbnails = false;
        $scope.thumbFirstItem = null;
        $scope.thumbLastItem = null;
        $scope.prevCatId = -1;
        $scope.thumbnailsCatId = -1;
        $scope.isItemLoaded = false;
        $scope.thumbActiveItemId = null;
        
        // Constants
        
        $scope.SCROLL_DIRECTION_LEFT = "left";
        $scope.SCROLL_DIRECTION_RIGHT = "right";
        $scope.THUMBNAIL_LIST_TAG = 'thumbnail-list';
        $scope.THUMBNAIL_WRAPPER_CLASS = '.st_thumbs_wrapper';
        $scope.ALBUM_CLASS = '.album';
        $scope.THUMBS_CLASS = '.st_thumbs';
        
        
        var TAG = "ThumbnailController";
        
        // handle event move to previous proudct
        $scope.$on('moveToPreviousProduct', function(event, cat_id, item_id) {
            
            // check controller context
            if (cat_id != $scope.thumbnailsCatId)
                return;
            
            /* if thumbnaisl are hidden we cannot scroll thumbnails item. To move on next item we show it  
             * and set its opacity 0. So user will not be able to see. When user move curson on thumbnails 
             * item we set its opacity 1
             */
            if ($scope.showThumbnails == false) {
                $scope.showThumbnails = true;
                $scope.updateThumbsOpacity(0);
            }
            
            // get thumbnail-list wrapper bined with current cat-id/controller
            $scope.getThumbWrapper(function(wrapper) {
                
                // make item id
                var id = "#thumb_" + cat_id + "_" + item_id;
                var pos = $(id).position();
                var winWidth = $(window).width();
                var itemWidth = $(id).width();
                
                if (pos != null)
                {
                    // if pos.left is less than 0 it mean item is off the screen on left side
                    if (pos.left < 0) {
                        
                        // scroll to main product active item so that it should be visible
                        var xPos = wrapper.scrollLeft();
                        xPos = xPos - itemWidth;
                        wrapper.scrollLeft(xPos - 5);
                    }
                    // if pos.left > screenWidth it mean item is off the screen on right side
                    else if (pos.left > 0 && pos.left > winWidth) {
                        // set xPos so that item is visible
                        var xPos = pos.left - winWidth + itemWidth + wrapper.scrollLeft();
                        wrapper.scrollLeft(xPos);
                    }
                    
                    $scope.highlightActiveItem(id);
                    
                }
                else {
                    // item does not exist in thumbnail list. So load it from cache
                    $scope.loadPrevThumbnails(false, function(newWidth) {
                        var xPos = newWidth;
                        wrapper.scrollLeft(xPos - $scope.thumbnailItemWidth);
                        $scope.isItemLoaded = true;
                        
                        $scope.highlightActiveItem(id);
                    });
                }
                
            });
        });
        
        // hanlde event move to next product
        
        $scope.$on('moveToNextProduct', function(event, cat_id, item_id) {
            
            if (cat_id != $scope.thumbnailsCatId)
                return;
            
            /* if thumbnaisl are hidden we cannot scroll thumbnails item. To move on next item we show it  
             * and set its opacity 0. So user will not be able to see. When user move curson on thumbnails 
             * item we set its opacity 1
             */
            if ($scope.showThumbnails == false) {
                $scope.showThumbnails = true;
                $scope.updateThumbsOpacity(0);
            }
            // fetch thumber wrapper associated with this controller
            $scope.getThumbWrapper(function(wrapper) {
                
                var id = "#thumb_" + cat_id + "_" + item_id;
                var pos = $(id).position();
                
                var winWidth = $(window).width();
                var itemWidth = $(id).width();
                
                if (pos != null) {
                    
                    // if left > screen width it mean item is off the screen on right side
                    if (pos.left > 0 && pos.left > winWidth) {
                        
                        // scroll to main product active item
                        var xPos = pos.left - winWidth + itemWidth + wrapper.scrollLeft();
                        wrapper.scrollLeft(xPos);
                    }
                    // if left < 0 it mean item is off the screen on left side
                    else if (pos.left < 0) {
                        var xPos = pos.left + wrapper.scrollLeft();
                        wrapper.scrollLeft(xPos);
                    }
                    
                    $scope.highlightActiveItem(id);
                }
                else {
                    // item not exist in thumbnail list. Fetch it from cache
                    $scope.loadNextThumbnails(true);
                    var xPos = wrapper.scrollLeft();
                    wrapper.scrollLeft(xPos + $scope.thumbnailItemWidth);
                    $scope.isItemLoaded = true;
                    
                    $scope.highlightActiveItem(id);
                }
            });
        });
        
        // fetch thumbnails if category is changed
        $rootScope.$on('$viewContentLoaded', function() {
            
            $log.debug(TAG + ':$viewContentLoaded: --- ');
            
            $scope.initController();
        });
        
        /**
         * description: initiate thumbnails fetching process
         * 
         * 
         * @returns {undefined}
         */
        
        $scope.initController = function(){
                        // check if thumbnails items are already loaded and displayed
            if ($scope.thumbFirstItem == null && $scope.thumbLastItem == null) {
            
                // fetch and load items for book marked url
                //if($scope.catId == $stateParams.categoryId){
                $scope.prevCatId = $stateParams.categoryId;
                $scope.thumbnailsCatId = $stateParams.categoryId;
                $scope.updateThumbWrapper($stateParams.categoryId);
                $log.debug(TAG + ':initController: --- fetching bookmarks');
                $scope.fetchThumbnailsForBookmarks();
                /*}
                 else // fetch and load items for normal site open
                 $scope.fetchThumbnails($scope.catId);
                 */
            }
            else {
                // category changed from category menu
                if ($scope.prevCatId != $stateParams.categoryId) {
                    
                    $log.debug(TAG + ':initController: --- cateogry changed');
                    // category changed. Need to refresh thumbnails items
                    $scope.thumbFirstItem = null;
                    $scope.thumbLastItem = null;
                    
                    // update cateogry id 
                    $scope.updateThumbWrapper($stateParams.categoryId);
                    $scope.thumbnailsCatId = $stateParams.categoryId;
                    $scope.prevCatId = $stateParams.categoryId;
                    
                    // remove thumbnails associate with previous cateogry as we need to load thumbs for new category
                    $scope.getThumbWrapper(function(wrapper) {
                        
                        wrapper.find('.st_thumbs a').each(function() {
                            $(this).remove();
                        });
                        $log.debug(TAG + ':initController: --- fetching thumbnails');
                        // fetch and load items for normal site open
                        $scope.fetchThumbnails($scope.thumbnailsCatId);
                    });
                }
                else{
                    
                    $log.debug(TAG + ':initController: --- highlighting item');
                    // get cateogry and product id
                    var cat_id = $stateParams.categoryId;
                    var item_id = $stateParams.prodId;

                    // make thumbitem id and get its position 
                    var id = "#thumb_" + cat_id + "_" + item_id;
                    
                    $scope.highlightActiveItem(id);
                }
            }
        };
        
        /**
         * description: apply class on required item. Also remove class from previous
         * selected item.
         * 
         * @param {type} itemId
         * @returns {undefined}
         * 
         * 
         */
        
        $scope.highlightActiveItem = function(itemId){
          
            $(itemId).addClass("st_thumbs_active");
                    
            if($scope.thumbActiveItemId != null && itemId != $scope.thumbActiveItemId){
                $($scope.thumbActiveItemId).removeClass("st_thumbs_active");
            }

            $scope.thumbActiveItemId = itemId;
        };
        
        /**
         *  fetch items for bookmarked url
         * @returns {undefined}
         */
        
        
        $scope.fetchThumbnailsForBookmarks = function() {
            
            
            var productId = (typeof $stateParams.prodId == 'undefined') ? null : $stateParams.prodId;
            var rank = ProductsService.getProductRank($stateParams.categoryId, productId);
            
            //retrieve the 3 product ids from the service on the basis of cateogry and productId
            ProductsService.getProductsBasicData($stateParams.categoryId,
            productId, rank, 14, 'created_at', 'desc', 'prevnext', true, true,
            function(thumbnails) {
                
                if (thumbnails != null) {
                    // save first and last thumbnails to move prev and next
                    $scope.thumbFirstItem = thumbnails[0];
                    $scope.thumbLastItem = thumbnails[thumbnails.length - 1];
                    // load fetched thumbnails
                    $scope.loadThumbs(0, thumbnails, true, function(newWidth){
                        $scope.scrollToActiveItem();
                    });
                }
                //              });
            });
            
        };
        
        /**
         * 
         * @param {type} categoryId
         * @returns {undefined}
         */
        $scope.fetchThumbnails = function(categoryId) {
            
            // fetch thumbnails from cache
            ProductsService.getProductsBasicData(categoryId, 0, 0, 14,
            'created_at', 'desc', 'prevnext', true, true,
            function(thumbnails) {
                if (thumbnails != null) {
                    // save first and last thumbnails data to move prev and next
                    $scope.thumbFirstItem = thumbnails[0];
                    $scope.thumbLastItem = thumbnails[thumbnails.length - 1];
                    // load fetched thumbnails
                    $scope.loadThumbs(0, thumbnails, true, function(w) {
                        $scope.scrollToActiveItem();
                    });
                }
            });
            
        };
        
        $scope.bindEvents = function() {
            
            $scope.thumbnailsCatId = $scope.catId;
            $($scope.THUMBNAIL_WRAPPER_CLASS).animate({
                scrollLeft: 0
            });
            
        };
        
        /**
         * 
         * @returns {undefined}
         */
        
        $scope.buildThumbs = function() {
            
            $scope.getThumbWrapper(function(wrapper) {
                
                var width = 0;
                
                var tempWidth = -1;
                wrapper.find('.st_thumbs a').each(function() {
                    if ($(this).outerWidth(true) >= $scope.thumbnailItemMinWidth)
                        width += $(this).outerWidth(true);
                    else
                        width += $scope.thumbnailItemMinWidth;
                });
                
                var winWidth = $(window).width();
                
                $scope.thumbnailItemWidth = $scope.thumbnailItemMinWidth;
                
                var thumbs = $(wrapper).children($scope.THUMBS_CLASS);
                thumbs.css('width', width + $scope.thumbnailItemWidth + 'px');
                
            });
        };
        
        /**
         * 
         * @param {type} offset
         * @param {type} thumbnails
         * @param {type} isAppend
         * @param {type} callback
         * @returns {undefined}
         */
        $scope.loadThumbs = function(offset, thumbnails, isAppend, callback) {
            
            $scope.getThumbWrapper(function(wrapper) {
                
                var thumbs = $(wrapper).children($scope.THUMBS_CLASS);
                var newItemsWidth = thumbs.width();
                
                var newItemsWidth = thumbs.width();
                
                var slug = $scope.slug;
                
                if (slug == null)
                    slug = "category";
                
                // append items 
                while (offset < thumbnails.length) {
                    
                    var thumbnailItem = thumbnails[offset];
                    var thumbId = "thumb_" + $scope.thumbnailsCatId + "_" +
                            thumbnailItem.entity_id;
                    if (isAppend)
                        thumbs.append('<a id="'+ thumbId + '"' + 
                            '" href="#/' + slug + "/" +
                            $scope.thumbnailsCatId + "?prodId=" +
                            thumbnailItem.entity_id + '" ><img src="' + 
                            thumbnailItem.thumb_url + '" /></a>');
                    else
                        thumbs.prepend('<a id="'+ thumbId + '"' +
                            '" href="#/' + slug + "/" +
                            $scope.thumbnailsCatId + "?prodId=" +
                            thumbnailItem.entity_id + '"><img src="' +
                            thumbnailItem.thumb_url + '" /></a>');
                    offset++;
                }
                
                $scope.buildThumbs();
                
                newItemsWidth = thumbs.width() - newItemsWidth;
                
                if (callback != null)
                    callback(newItemsWidth);
            });
        };
        
        /**
         * 
         * @param {type} isAppend
         * @param {type} thumbnails
         * @param {type} callback
         * @returns {undefined}
         * 
         * 
         */
        
        $scope.addThumbs = function(isAppend, thumbnails, callback) {
            $scope.getThumbWrapper(function(wrapper) {
                
                var thumbs = $(wrapper).children($scope.THUMBS_CLASS);
                var newItemsWidth = thumbs.width();
                
                var slug = $scope.slug;
                
                if (slug == null)
                    slug = "category";
                
                var index = 0;
                if (isAppend) {
                    while (index < thumbnails.length) {
                        var thumbnailItem = thumbnails[index];
                        var thumbId = "thumb_" + $scope.thumbnailsCatId + "_" +
                            thumbnailItem.entity_id;
                        thumbs.append('<a id="'+ thumbId + '"' +
                                '" href="#/' + slug + "/" +
                                $scope.thumbnailsCatId +
                                