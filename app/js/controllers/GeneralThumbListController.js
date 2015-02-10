
'use strict';

/* General Thumb List Controller */

angular.module('st.app').controller("GeneralThumbListController", ['$rootScope', '$scope', '$timeout' ,'ProductModel',
    'ProductsService','$location','$log','$element','APP_CONFIG','$window','$document',
    function($rootScope, $scope, $timeout, ProductModel, ProductsService,
    $location,$log,$element,APP_CONFIG,$window,$document) {
        

        $scope.isMouseUpOnNav = true;
        $scope.isItemLoaded = false;
        $scope.thumbActiveItemId = null;
        
        $scope.showThumbnails = true;
        $scope.showNavCtrls = true;
        // $scope.thumbHideAnim is used controll thumbnail hide animation
        $scope.thumbHideAnim = null;
        $scope.mouseMovePosX;
        $scope.mouseMovePosY;
        
        // Constants
        
        $scope.SCROLL_DIRECTION_LEFT = "left";
        $scope.SCROLL_DIRECTION_RIGHT = "right";
        $scope.THUMBNAIL_LIST_TAG = 'thumbnail-list';
        $scope.THUMBNAIL_WRAPPER_CLASS = '.st_thumbs_wrapper';
        $scope.ALBUM_CLASS = '.album';
        $scope.THUMBS_CLASS = '.st_thumbs';
        
        
        var TAG = "GeneralThumbListController";
        var scrollFactor = 10;
        var scrollDuration = 30;
        
        $scope.$watch('datasource',function(n,o){
            
           // if(n != null && n.length  == 0)
           //     $scope.showThumbnails = false;
            
            $scope.buildThumbs();
        });
        
        /**
         * description:
         * Upon product change we need to select active item in thumbnail list. 
         * We need to identify user has pressed left or right button on main screen
         */
        $scope.$watch('activeItemId', function(n, o) {
            
            /*
             * get rank from product id. If new product rank is greater than old product rank
             * it means user is moving towards right. If new proudct rank is less than old
             * porduct rank it means user is moving towards left
             */
            
            var oldProdRank = ProductsService.getProductRank($scope.uniqueId,o);
            var newProdRank = ProductsService.getProductRank($scope.uniqueId,n);
            
            if(newProdRank > oldProdRank){
                $scope.selectNextItem(n);
            }
            else if(newProdRank < oldProdRank){
                $scope.selectPrevItem(n);
            }

        });

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
            var wrapper = $scope.getThumbWrapper(); 
                
            // make item id
            var id = "#thumb_" + $scope.uniqueId + "_" + item_id;
            var elm = $scope.searchElementById(id);
            var pos = elm.position();

            var winWidth = $scope.getWindowWidth();
            var itemWidth = elm.width();

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
                
                if($scope.$parent.loadPrev == null)
                    return;
                
                $scope.$parent.loadPrev(false, function(newWidth) {
                    $scope.highlightActiveItem(id);
                });
            }

            $scope.isItemLoaded = true;
                
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
            
            var wrapper = $scope.getThumbWrapper(); 
                
            var id = "#thumb_" + $scope.uniqueId + "_" + item_id;
            
            var elm = $scope.searchElementById(id);
            var pos = elm.position();

            var winWidth = $scope.getWindowWidth();

            var itemWidth = elm.width();

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
                if($scope.$parent.loadNext == null)
                    return;
                
                $scope.$parent.loadNext(true);
     
                $scope.highlightActiveItem(id);
            }

            $scope.isItemLoaded = true;
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
          
            var elm = $scope.searchElementById(itemId);
            elm.addClass("st_thumbs_active");
                    
            if($scope.thumbActiveItemId != null && itemId != $scope.thumbActiveItemId){
                var activeElm = $scope.searchElementById($scope.thumbActiveItemId);
                activeElm.removeClass("st_thumbs_active");
            }

            $scope.thumbActiveItemId = itemId;
        };
        
        /**
         * description:
         * Adjust width of thumbnails container so that items can be displayed in a single row.
         * If item is not loaded yet, take minimum thumbnail width and adjust container width
         * 
         * @returns {undefined}
         */
        
        $scope.buildThumbs = function() {
            
            var wrapper = $scope.getThumbWrapper(); 

            var width = 0;

            $scope.$parent.thumbnailItemWidth = $scope.$parent.thumbnailItemMinWidth;

            if($scope.datasource == null)
                return;
            //if(width < $scope.datasource.length * $scope.$parent.thumbnailItemMinWidth){
                width = ($scope.datasource.length * $scope.$parent.thumbnailItemMinWidth);
                // Adjust width with margin 6 px: 3px left + 3px right
                
                width +=  $scope.datasource.length * 6;
            //}

            width = width + $scope.$parent.thumbnailItemWidth;
            
            var thumbs = wrapper.children($scope.THUMBS_CLASS);
            thumbs.css('width', width  + 'px');
               
        };
        
        /**
         * 
         * @param {type} oldWidth
         * @returns {undefined}
         * 
         * 
         */
        
        $scope.addThumbs = function(oldWidth) {
            var wrapper = $scope.getThumbWrapper(); 
                
            var thumbs = wrapper.children($scope.THUMBS_CLASS);

            $scope.buildThumbs();

            var newItemsWidth = ($scope.datasource.length + 2)  * $scope.$parent.thumbnailItemMinWidth - oldWidth;
            return newItemsWidth;
        };
        
        /**
         * description:
         * It returns width of thumbs container
         * 
         * @returns {undefined}
         */
        $scope.thumbsContainerWidth = function(){

             var wrapper = $scope.getThumbWrapper(); 
                
            var thumbs = wrapper.children($scope.THUMBS_CLASS);
            return thumbs.width();    
        };
        
        /*
         * description:
         * scrollLeft will be called when user press left thumbnail navigation button.
         *
         * @returns {undefined}
         *  
         */
        $scope.scrollLeft = function() {
            var wrapper = $scope.getThumbWrapper(); 
                
            var xPos = wrapper.scrollLeft();
            if (xPos == 0) {
                
                if($scope.$parent.loadPrev == null)
                    return;
                
                $scope.$parent.loadPrev(false, function(newWidth) {   

                });
                $timeout(function() {
                    $scope.scrollLeft();
                }, scrollDuration);
            } else {
                wrapper.scrollLeft(xPos - scrollFactor);
                $timeout(function() {
                    if ($scope.isMouseUpOnNav == false)
                        $scope.scrollLeft();
                }, scrollDuration);
            }
            
        };
        
        /*
         * description:
         * scrollRight will be called when user press right thumbnail navigation button.
         * 
         * @returns {undefined}
         *
         */
        $scope.scrollRight = function() {
            
            var wrapper = $scope.getThumbWrapper(); 
            var wrapperWidth = wrapper.width();

            var thumbsWidth = wrapper.children($scope.THUMBS_CLASS).width();

            var xPos = wrapper.scrollLeft();
            if ((xPos + (2 * wrapperWidth)) >= thumbsWidth) { 
                if($scope.$parent.loadNext != null)
                  $scope.$parent.loadNext(true);
            }

            var winWidth = $scope.getWindowWidth();
            // if reached at last item. No need to scroll more.
            
            if($scope.$parent.loadNext != null){
                if ((xPos + $scope.$parent.thumbnailItemWidth <= thumbsWidth - winWidth) || (wrapperWidth < winWidth))
                    wrapper.scrollLeft(xPos + scrollFactor);
            }
            else{
                   var calculatedWidth = ($scope.datasource.length * $scope.$parent.thumbnailItemWidth)
                   + ($scope.datasource.length * 6) - $scope.$parent.thumbnailItemWidth;
                    
                    if((xPos + $scope.$parent.thumbnailItemWidth) < calculatedWidth)
                        wrapper.scrollLeft(xPos + scrollFactor);

            }
            
            $timeout(function() {
                if ($scope.isMouseUpOnNav == false)
                    $scope.scrollRight();
            }, scrollDuration);
        };
        
        /*
         * description:
         * getThumbWrapper return wrapper element which is children of thumbnail-list element
         * 
         * @returns {undefined}
         * 
         */
        // extract thumbnail wrapper binded with current controller
        $scope.getThumbWrapper = function() {
            
            var div = $element.children('div');
            // extract thumbnail wrapper element
            var album = div.children($scope.ALBUM_CLASS);
            var wrapper = album.children($scope.THUMBNAIL_WRAPPER_CLASS);
            return wrapper;
        };
        
        /**
         * 
         * @returns {undefined}
         */
        
        $scope.getWindowWidth = function(){
            return $window.innerWidth;
        };
        
        /**
         * 
         * @param {type} id
         * @returns {unresolved}
         */
        
        $scope.searchElementById = function(id){
           return angular.element($document[0].querySelector(id));  
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
            
            var mouseXPos = $event.screenX;
            var screenWidth = $event.view.outerWidth;

            if($scope.$parent.showHideThumbs != null && $scope.showThumbnails)
               $scope.$parent.showHideThumbs(false);
           
            if (mouseXPos > 0 && mouseXPos < screenWidth){
                
                if($scope.$parent.shouldHideThumbList != null && $scope.$parent.shouldHideThumbList() == true)
                    $scope.showThumbnails = false;
            }
        };
        // handle mouse enter event on thumnails-list 
        $scope.onMouseEnter = function($event) {
           
           if($scope.$parent.showHideThumbs != null && !$scope.showThumbnails)
               $scope.$parent.showHideThumbs(true);
           
           $scope.showThumbnails = true;           
           $scope.showHideNavigationCtrls();
           
           if ($scope.isItemLoaded) {
               $scope.scrollToActiveItem();
               $scope.isItemLoaded = false;
           }
        };      
        // handle mouse move on thumbnails-list
        $scope.onMouseMove = function($event){
                
            /**
             * Issue work around: 
             * Issue : When  mouse is still on thumb list Mouse move event is still be fired 
             * Solution:  Save mouse xPosition and yPosition when moved last time. If mouse
             *            xPosition and yPosition is same then no need to proceed.
             */
            if($event.screenX == $scope.mouseMovePosX && $event.screenY == $scope.mouseMovePosY)
                return;


            if ($scope.thumbHideAnim != null) {

                // save mouse position and canel already registered timeout event
                $scope.mouseMovePosX = $event.screenX;
                $scope.mouseMovePosY = $event.screenY;
                $timeout.cancel($scope.thumbHideAnim);
                $scope.thumbHideAnim = null;
            }

            // hide thumblist after 5 seconds
            $scope.thumbHideAnim = $timeout(function() {

                // check if thumb list was shown and can hide.
                if($scope.$parent.shouldHideThumbList != null && $scope.$parent.shouldHideThumbList() == true){
                    $scope.showThumbnails = false;
                    if($scope.$parent.showHideThumbs != null)
                        $scope.$parent.showHideThumbs(false);
                    $scope.$digest();
                }

            }, 5000);
        };
        
        $scope.showHideNavigationCtrls = function(){
            var wrapper = $scope.getThumbWrapper();
            var elm = wrapper.find('.st_thumbs a');
            var width = wrapper.width();
            var expectedWidth = elm.length * $scope.$parent.thumbnailItemMinWidth;
            
            if(expectedWidth < wrapper.width())
                $scope.showNavCtrls = false;
            else
                $scope.showNavCtrls = true;
            
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
            
            $timeout(function() {
               
               if($scope.activeProdId == null)
                   return;
               
                // fetch thumb wrapper associated with current controller
                var wrapper = $scope.getThumbWrapper();
                    
                // make thumbitem id and get its position 
                var id = "#thumb_" + $scope.uniqueId + "_" + $scope.activeProdId;
                var elm = $scope.searchElementById(id);
                var pos = elm.position();

                var winWidth = $scope.getWindowWidth();
                var itemWidth = elm.width();

                if (pos != null) {

                    // item found and it is off the screen on write side
                    if (pos.left > 0 && pos.left > winWidth) {

                        // scroll to main product active item
                        var xPos = pos.left - winWidth + itemWidth + wrapper.scrollLeft();
                        wrapper.scrollLeft(xPos);
                    }
                    else if(pos.left > 0 && pos.left < $scope.$parent.thumbnailItemMinWidth){
                                   // scroll to required position
                        var xPos = $scope.$parent.thumbnailItemMinWidth + wrapper.scrollLeft();
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
                    
            }, 30);
        };
        
         /**
         * description: Thumbnail list is being show at the start. We hide thumbnails list 
         * after 5 seconds
         * 
         * @returns {undefined}
         */
        
        $scope.showHideThumbnails = function(){
          
          $timeout(function() {
            if($scope.$parent.shouldHideThumbList != null && $scope.$parent.shouldHideThumbList() == true)
                $scope.showThumbnails = false;
            else
                $scope.showThumbnails = true;
            
            $scope.$digest();
          },2000);
            
        };
        
        /**
         * description:
         * onThumbnailClick method will be called when thumbnail is clicked. Location
         * will be changed and full product will show current active item
         * 
         * @param {type} itemId
         * @returns {undefined}
         */
        
        $scope.onThumbnailClick = function(item){
      
          var id = $scope.makeItemFQId(item);
          $scope.highlightActiveItem(id);
          
          if($scope.$parent.onItemClicked != null)
              $scope.$parent.onItemClicked(item);
        };
        
        /**
         * 
         * @returns {undefined}
         */
        
        $scope.getHREFValue = function(item){
          
          if($scope.$parent.buildHREFForItem != null)
             return $scope.$parent.buildHREFForItem(item);
        };
        
        $scope.makeItemFQId = function(item){
          
          if($scope.$parent.buildFQIdForItem != null)
             return $scope.$parent.buildFQIdForItem(item);
        };
        
        $scope.showHideThumbnails();
        
    }]);