'use strict';

/* Thumbnail Controller */

angular.module('st.app').controller("ThumbnailController", ['$rootScope', '$scope', 'ProductModel',
    'ProductsService','$location','$log','$element','APP_CONFIG',
    function($rootScope, $scope, ProductModel, ProductsService,
    $location,$log,$element,APP_CONFIG) {
        
        $scope.thumbnailsDatasource = [];
        $scope.thumbnailItemWidth = 0;
        $scope.thumbnailItemMinWidth = 200;
        $scope.isMouseUpOnNav = true;
        $scope.thumbFirstItem = null;
        $scope.thumbLastItem = null;
        $scope.prevCatId = -1;
        $scope.thumbnailsCatId = -1;
        $scope.isItemLoaded = false;
        $scope.thumbActiveItemId = null;
        $scope.categoryName = "";
        $scope.showThumbnails = false;

        
        
        // Constants
        
        $scope.SCROLL_DIRECTION_LEFT = "left";
        $scope.SCROLL_DIRECTION_RIGHT = "right";
        $scope.THUMBNAIL_LIST_TAG = 'thumbnail-list';
        $scope.THUMBNAIL_WRAPPER_CLASS = '.st_thumbs_wrapper';
        $scope.ALBUM_CLASS = '.album';
        $scope.THUMBS_CLASS = '.st_thumbs';
        
        
        var TAG = "ThumbnailController";
        var scrollFactor = 10;
        var scrollDuration = 30;

        /**
         * description:
         * If item is already loaded in thumbnail list and is not visible on the screen
         * (currently item is off the screen),just set its position so that user can view it. 
         * It should be displayed at left side. Also apply active item class.
         * Otherwise fetch it from ProductsService and load into thumbnail lis
         * 
         */
        $scope.selectPrevItem = function(item_id) {

            if($scope.isMouseUpOnNav == false) // scrolling thumbnails list. No need to set position
                return;
            $scope.getThumbWrapper(function(wrapper) {
                
                // make item id
                var id = "#thumb_" + $scope.thumbnailsCatId + "_" + item_id;
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
                        wrapper.scrollLeft(xPos - scrollFactor);
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
                        
                        $scope.highlightActiveItem(id);
                    });
                }
                
                $scope.isItemLoaded = true;
                
            });
        };
        
        /**
         * description:
         * If item is already loaded in thumbnail list and is not visible on the screen
         * just set is position so that user can view it. It should be displayed 
         * at right side. Also apply active item class.
         * Otherwise fetch it from ProductsService and load into thumbnail list
         * 
         * @param {type} item_id
         * @returns {undefined}
         */
        
        $scope.selectNextItem = function(item_id) {
            
           
            if($scope.isMouseUpOnNav == false) // scrolling thumbnails list. No need to set position
               return;
            
            $scope.getThumbWrapper(function(wrapper) {
                
                var id = "#thumb_" + $scope.thumbnailsCatId + "_" + item_id;
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
                    
                    $scope.highlightActiveItem(id);
                }
                
                $scope.isItemLoaded = true;
            });
        };
        
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
            
            if(n == null)
                $scope.thumbnailsCatId = APP_CONFIG.defaultCategory.id;
            else
                $scope.thumbnailsCatId = n;
            
            $scope.initController();

        });

        /**
         * description:
         * Upon product change we need to select active item in thumbnail list. 
         * We need to identify user has pressed left or right button on main screen
         */
        $scope.$watch('activeProdId', function(n, o) {
            
            /*
             * get rank from product id. If new product rank is greater than old product rank
             * it means user is moving towards right. If new proudct rank is less than old
             * porduct rank it means user is moving towards left
             */
            
            var oldProdRank = ProductsService.getProductRank($scope.thumbnailsCatId,o);
            var newProdRank = ProductsService.getProductRank($scope.thumbnailsCatId,n);
            
            if(newProdRank > oldProdRank){
                $scope.selectNextItem(n);
            }
            else if(newProdRank < oldProdRank){
                $scope.selectPrevItem(n);
            }

        });
        
        /**
         * description:
         * categoryName is binded span. It will display category name as soon as its
         * value is changed
         */

        $scope.$watch('selectedCategory', function(n, o) {
            if(n != null){
                 $scope.categoryName = n.name;
            }
        });
        
        /**
         * description:
         * Initiate thumbnails data fetching from ProductsService
         *
         * @returns {undefined}
         */
        
        $scope.initController = function(){
                        // check if thumbnails items are already loaded and displayed
            if ($scope.thumbFirstItem == null && $scope.thumbLastItem == null) {
            
                // fetch and load items for book marked url
                $scope.prevCatId = $scope.thumbnailsCatId;
     
                $log.debug(TAG + ':initController: --- fetching bookmarks');
                $scope.fetchThumbnailsForBookmarks();
                 
                $scope.hideThumbnails();
            }
            else {
                // category changed from category menu
                if ($scope.prevCatId != $scope.thumbnailsCatId) {
                    
                    $log.debug(TAG + ':initController: --- cateogry changed');
                    // category changed. Need to refresh thumbnails items
                    $scope.thumbFirstItem = null;
                    $scope.thumbLastItem = null;
                    
                    $scope.prevCatId = $scope.thumbnailsCatId;
                    
                    // remove thumbnails associate with previous cateogry as we need to load thumbs for new category
                    $scope.getThumbWrapper(function(wrapper) {
                        
                        wrapper.find('.st_thumbs a').each(function() {
                            $(this).remove();
                        });
                        
                        $scope.thumbnailsDatasource = $scope.thumbnailsDatasource.splice(0,$scope.thumbnailsDatasource.length);
                        
                        wrapper.scrollLeft(0);
                       
                        $log.debug(TAG + ':initController: --- fetching thumbnails');
                        // fetch and load items for normal site open
                        $scope.fetchThumbnails($scope.thumbnailsCatId);
                        
                        $scope.hideThumbnails();
                    });
                }
            }
        };
        
        /**
         * description: 
         * Apply class on required item. Also remove class from previous
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
         *  description:
         *  Fetch items for bookmarked url from ProductsService and load into
         *  thumbnails list
         *  
         * @returns {undefined}
         */
        
        
        $scope.fetchThumbnailsForBookmarks = function() {
            
            
            var productId = (typeof $scope.activeProdId == 'undefined') ? null : $scope.activeProdId;
            var rank = ProductsService.getProductRank($scope.thumbnailsCatId, productId);
            
            var size = parseInt($(window).width()/$scope.thumbnailItemMinWidth) * 2;
            
            //retrieve the 3 product ids from the service on the basis of cateogry and productId
            ProductsService.getProductsBasicData($scope.thumbnailsCatId,
            productId, rank, size, 'created_at', 'desc', 'prevnext', true, true,
            function(thumbnails) {
                
                if (thumbnails != null) {
                    // save first and last thumbnails to move prev and next
                    $scope.thumbFirstItem = thumbnails[0];
                    $scope.thumbLastItem = thumbnails[thumbnails.length - 1];
                    $scope.thumbnailsDatasource = thumbnails;
                    
                    setTimeout(function(){
                    
                        // load fetched thumbnails
                        $scope.loadThumbs(function(newWidth){
                            $scope.scrollToActiveItem();
                        });
                    },150);
                    
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
            
            var size = parseInt($(window).width()/$scope.thumbnailItemMinWidth) * 2;
            
            // fetch thumbnails from cache
            ProductsService.getProductsBasicData(categoryId, 0, 0, size,
            'created_at', 'desc', 'prevnext', true, true,
            function(thumbnails) {
                if (thumbnails != null) {
                    // save first and last thumbnails data to move prev and next
                    $scope.thumbFirstItem = thumbnails[0];
                    $scope.thumbLastItem = thumbnails[thumbnails.length - 1];
                    $scope.thumbnailsDatasource = thumbnails;
                    // load fetched thumbnails
                    setTimeout(function(){
                    
                        // load fetched thumbnails
                        $scope.loadThumbs(function(newWidth){
                            $scope.scrollToActiveItem();
                        });
                    },150);
                }
            });
            
        };
        
        /**
         * description:
         * Adjust width of thumbnails container so that items can be displayed in a single row.
         * If item is not loaded yet, take minimum thumbnail width and adjust container width
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
                        width += $scope.thumbnailItemMinWidth + 6 ; // margin 6 px: 3px left + 3px right
                });
                
                $scope.thumbnailItemWidth = $scope.thumbnailItemMinWidth;
                
                if(width < $scope.thumbnailsDatasource.length * $scope.thumbnailItemMinWidth){
                    width = ($scope.thumbnailsDatasource.length * $scope.thumbnailItemMinWidth);
                    // Adjust width with margin 6 px: 3px left + 3px right
                    width +=  $scope.thumbnailsDatasource.length * 6;
                }
                
                width = width + $scope.thumbnailItemWidth;
                
                var thumbs = $(wrapper).children($scope.THUMBS_CLASS);
                thumbs.css('width', width  + 'px');
               
            });
        };
        
        /**
         * 
         * @param {type} callback
         * @returns {undefined}
         */
        $scope.loadThumbs = function(callback) {
            
            $scope.getThumbWrapper(function(wrapper) {
                
                var thumbs = $(wrapper).children($scope.THUMBS_CLASS);
                var newItemsWidth = thumbs.width();
                
                var newItemsWidth = thumbs.width();
                
                $scope.buildThumbs();
                
                newItemsWidth = thumbs.width() - newItemsWidth;
                
                if (callback != null)
                    callback(newItemsWidth);
            });
        };
        
        /**
         * description:
         * onThumbnailClick method will be called when thumbnail is clicked. Location
         * will be changed and full product will show current active item
         * 
         * @param {type} itemId
         * @returns {undefined}
         */
        
        $scope.onThumbnailClick = function(itemId){
          
          $scope.activeProdId = itemId;
          $location.search('c', $scope.thumbnailsCatId);
          $location.search('p', itemId);
          
          var id = "#thumb_" + $scope.thumbnailsCatId + "_" + itemId;
          $scope.highlightActiveItem(id);
        };
        
        /**
         * 
         * @param {type} oldWidth
         * @param {type} callback
         * @returns {undefined}
         * 
         * 
         */
        
        $scope.addThumbs = function(oldWidth,callback) {
            $scope.getThumbWrapper(function(wrapper) {
                
                var thumbs = $(wrapper).children($scope.THUMBS_CLASS);
                
                $scope.buildThumbs();
                
                var newItemsWidth = ($scope.thumbnailsDatasource.length + 2)  * $scope.thumbnailItemMinWidth - oldWidth;
                
                if (callback != null)
                    callback(newItemsWidth);
                
            });
        };
        
        /**
         * description:
         * It returns width of thumbs container
         * 
         * @param {type} callback
         * @returns {undefined}
         */
        $scope.thumbsContainerWidth = function(callback){

             $scope.getThumbWrapper(function(wrapper) {
                
                var thumbs = $(wrapper).children($scope.THUMBS_CLASS);
                var newItemsWidth = thumbs.width();    
                if (callback != null)
                    callback(newItemsWidth);
                
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
        $scope.loadNextThumbnails = function(isAppend) {
            
            if($scope.thumbLastItem == null)
                return;
            // fetch thumbnails for rank
            ProductsService.getProductsBasicData($scope.thumbnailsCatId,
            $scope.thumbLastItem.entity_id, $scope.thumbLastItem.rank, 10,
            'created_at', 'desc', 'next', false, false, function(thumbnails) {
                
                // No item found. 
                if (thumbnails == null || thumbnails.length == 0)
                    return;
                
                var tempItem = thumbnails[thumbnails.length - 1];
                
                if(tempItem == null)
                    return;
                
                // item already fetched. No need to add. Just ignore it
                if ($scope.thumbLastItem != null && $scope.thumbLastItem.rank == tempItem.rank)
                    return;
                
                $scope.thumbnailsDatasource = $scope.thumbnailsDatasource.concat(thumbnails);
                
                
                // load newly fetched items
                $scope.thumbLastItem = tempItem;
                
                setTimeout(function(){
                    $scope.addThumbs();
                    $scope.$digest();
                },10);
           
            });
            
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
        
        $scope.loadPrevThumbnails = function(isAppend, callback) {
            
            if($scope.thumbFirstItem == null)
                return;
            
            // check if more items are avaiable. Previous to current first item
            if ($scope.thumbFirstItem.rank > 1)
            {   
                ProductsService.getProductsBasicData($scope.thumbnailsCatId,
                $scope.thumbFirstItem.entity_id, $scope.thumbFirstItem.rank,
                10, 'created_at', 'desc', 'prev', false, false,
                function(thumbnails) {
                    
                    // No item found
                    if (thumbnails == null || thumbnails.length == 0)
                        return;
                    
                    for(var i = 0 ; i < thumbnails.length; ++i)
                    {
                        $scope.thumbFirstItem = thumbnails[i];
                        if($scope.thumbFirstItem != null)
                            break;
                    }
                   
                   $scope.thumbsContainerWidth(function(thumbsWidth){
                   
                        var thumbs = $.map(thumbnails, function (value, key) { return value; });
                        $scope.thumbnailsDatasource = thumbs.concat($scope.thumbnailsDatasource);
                        
                        // Load fetched items
                        $scope.addThumbs(thumbsWidth,function(newPos) {
                            $scope.$digest();
                            if (callback != null)
                                callback(newPos);
                        });
                       
                   });
                   
                });
            }
            
        };
        
        /*
         * description:
         * scrollLeft will be called when user press left thumbnail navigation button.
         *
         * @returns {undefined}
         *  
         */
        $scope.scrollLeft = function() {
            $scope.getThumbWrapper(function(wrapper) {
                
                var xPos = wrapper.scrollLeft();
                if (xPos == 0) {
                    $scope.loadPrevThumbnails(false, function(newWidth) {
                        xPos += newWidth;
                       
                        wrapper.scrollLeft(xPos);
                        setTimeout(function() {
                            $scope.scrollLeft();
                        }, scrollDuration);
                    });
                } else {
                    wrapper.scrollLeft(xPos - scrollFactor);
                    setTimeout(function() {
                        if ($scope.isMouseUpOnNav == false)
                            $scope.scrollLeft();
                    }, scrollDuration);
                }
            });
            
        };
        
        /*
         * description:
         * scrollRight will be called when user press right thumbnail navigation button.
         * 
         * @returns {undefined}
         *
         */
        $scope.scrollRight = function() {
            
            $scope.getThumbWrapper(function(wrapper) {
                var wrapperWidth = wrapper.width();
                
                var thumbsWidth = $(wrapper).children($scope.THUMBS_CLASS).width();
                
                var xPos = wrapper.scrollLeft();
                if ((xPos + (2 * wrapperWidth)) >= thumbsWidth) {
                    $scope.loadNextThumbnails(true);
                }
                
                var tempWidth = $(window).width();
                // if reached at last item. No need to scroll more.
                if (xPos + $scope.thumbnailItemWidth <= thumbsWidth - tempWidth)
                    wrapper.scrollLeft(xPos + scrollFactor);
                setTimeout(function() {
                    if ($scope.isMouseUpOnNav == false)
                        $scope.scrollRight();
                }, scrollDuration);
            });
        };
        
        /*
         * description:
         * getThumbWrapper return wrapper element which is children of thumbnail-list element
         * 
         * @param {type} callback
         * @returns {undefined}
         * 
         */
        // extract thumbnail wrapper binded with current controller
        $scope.getThumbWrapper = function(callback) {
            
            var div = $element.children('div');
            // extract thumbnail wrapper element
            var album = $(div).children($scope.ALBUM_CLASS);
            var wrapper = $(album).children($scope.THUMBNAIL_WRAPPER_CLASS);

            callback(wrapper);
        };
        
        // handle mouse down event on thumbnnails left navigation bar
        $scope.onMouseDownOnNavLeft = function($event) {
            $scope.isMouseUpOnNav = false;
            $scope.scrollLeft();
        };
        
        // handle mouse up event on thumbnails left navigation bar
        $scope.onMouseUpOnLeftNav = function($event) {
            $scope.isMouseUpOnNav = true;
        };
        
        // handle mouse leave event on thumnails left navigation bar
        $scope.onMouseLeftLeftNav = function($event) {
            $scope.isMouseUpOnNav = true;
        };
        
        // handle mouse down event on thumbnnails right navigation bar
        $scope.onMouseDownOnNavRight = function($event) {
            
            $scope.isMouseUpOnNav = false;
            $scope.scrollRight();
        };
        
        // handle mouse up event on thumbnails right navigation bar
        $scope.onMouseUpOnRightNav = function($event) {
            $scope.isMouseUpOnNav = true;
        };
        
        // handle mouse leave event on thumnails right navigation bar
        $scope.onMouseLeftRightNav = function($event) {
            $scope.isMouseUpOnNav = true;
        };
        
        // handle mouse leave event on thumbnails-list
        $scope.onMouseLeft = function($event) {
           //console.log('mouselef TC');return; 
            var mouseXPos = $event.screenX;
            var screenWidth = $event.view.outerWidth;
            
            if (mouseXPos > 0 && mouseXPos < screenWidth){
                $scope.showThumbnails = false;
                $scope.getThumbWrapper(function(wrapper) {                     
                    
                    $(wrapper).stop();
                    wrapper.hide("0.25");
                 });
            }
        };
        // handle mouse enter event on thumnails-list 
        $scope.onMouseEnter = function($event) {
                       //console.log('mosueenter TC');return;
            $scope.showThumbnails = true;
            $scope.getThumbWrapper(function(wrapper) {

                 var elm = wrapper.find('.st_thumbs a');
                 // no item is loaded for current category. Try to reload items
                 if(elm.length == 0){
                     $scope.initController();
                 }  
                 
                $(wrapper).stop(); 
                wrapper.show("0.25");
                 
                 if ($scope.isItemLoaded) {
                    $scope.scrollToActiveItem();
                    $scope.isItemLoaded = false;
                }
             });
        };
        
        /**
         * description: Thumbnail list is being show at the start. We hide thumbnails list 
         * after 5 seconds
         * 
         * @returns {undefined}
         */
        
        $scope.hideThumbnails = function(){
          
          setTimeout(function() {
            $scope.getThumbWrapper(function(wrapper) {
                if($scope.showThumbnails == false){
                    wrapper.stop();
                    wrapper.hide("0.5");
                }
            });  
          },1000);
            
        };
        
        /*
         * description: 
         * scrollToActiveItem will be called when thumbnails state change from hidden to visible
         * When user click on prev/next button we cannot scroll to item as these are hidden.
         * When user moves on thumbnails-list we find active item and scroll to that item.
         * 
         * @returns {undefined}
         * 
         */
        
        $scope.scrollToActiveItem = function() {
            
            setTimeout(function() {
               
                // fetch thumb wrapper associated with current controller
                $scope.getThumbWrapper(function(wrapper) {
                    
                    // make thumbitem id and get its position 
                    var id = "#thumb_" + $scope.thumbnailsCatId + "_" + $scope.activeProdId;
                    var pos = $(id).position();
                    
                    var winWidth = $(window).width();
                    var itemWidth = $(id).width();
                    
                    if (pos != null) {
                        
                        // item found and it is off the screen on write side
                        if (pos.left > 0 && pos.left > winWidth) {
                            
                            // scroll to main product active item
                            var xPos = pos.left - winWidth + itemWidth + wrapper.scrollLeft();
                            wrapper.scrollLeft(xPos);
                        }
                        else if(pos.left > 0 && pos.left < $scope.thumbnailItemMinWidth){
                                       // scroll to required position
                            var xPos = $scope.thumbnailItemMinWidth + wrapper.scrollLeft();
                            wrapper.scrollLeft(xPos);
                        }
                        // item found and its off the screen on left side
                        else if (pos.left < 0) {
                            
                            // scroll to required position
                            var xPos = pos.left + wrapper.scrollLeft();
                            wrapper.scrollLeft(xPos - scrollFactor);
                        }
                        
                        $scope.highlightActiveItem(id);
                    }
                    
                });
            }, 30);
        };
        
    }]);
