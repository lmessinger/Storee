'use strict';

/* Product Thumb List Controller */

angular.module('st.app').controller("ProductThumbListController", ['$rootScope', '$scope', 'ProductModel',
    'ProductsService','$location','$log','$element','$window','APP_CONFIG',
    function($rootScope, $scope, ProductModel, ProductsService,
    $location,$log,$element,$window,APP_CONFIG) {

        $scope.thumbsDatasource = [];
        $scope.thumbnailItemWidth = 0;
        $scope.thumbnailItemMinWidth = 80;
     
        var TAG = "ProductThumbListController";
  
        /**
         * description:
         * Initiate thumbnails data fetching from ProductsService
         *
         * @returns {undefined}
         */
        
        $scope.initController = function(){
     
            $scope.fetchProductImages();
                 
        };
       
       $scope.$watch('activeProd',function(n,o){
             
            if(n != null){
                $scope.initController();
            }
        });
       
        /**
         *  description:
         *  Fetch items for bookmarked url from ProductsService and load into
         *  thumbnails list
         *  
         * @returns {undefined}
         */
        
        $scope.fetchProductImages = function() {
            var productId = (typeof $scope.activeProd == 'undefined') ? null : $scope.activeProd.entity_id;
            
            if(productId != null){
                var minH = $scope.getPDPImageMinHeight();
                console.log("PDP Image Min Height : "+minH);
                ProductsService.getProductImages(productId,minH,function(images) {
                
                if (images != null) {
                    // save first and last thumbnails to move prev and next
                    $scope.thumbsDatasource = images;   
                }
                else{
                    $scope.thumbsDatasource = [];
                }
                
              });
            }
            
        };
        
         /**
         * 
         * @returns {undefined}
         */
        
        $scope.getPDPImageMinHeight = function(){
            var minH = 960;   
            return minH;
        };
        
         /**
         * description:
         * onItemClicked method will be called when thumbnail is clicked. Location
         * will be changed and full product will show current active item
         * 
         * @param {type} itemId
         * @returns {undefined}
         */
        
        $scope.onItemClicked = function(item){
          $rootScope.$broadcast('product_image_selected',item);
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
        
         $scope.buildHREFForItem = function(item){
            return "#/productdetails/"+$scope.activeProd.entity_id+"/"+$scope.activeProd.slug;
        };
        
         /**
         * description:
         * This method will be called by GeneralThumbListController. It makes unique id and return
         * 
         * @param {type} item
         * @returns {String}
         */
        $scope.buildFQIdForItem = function(item){
            return "thumb_"+$scope.activeProd.entity_id+"_"+item.id;
        };
        
        /**
         * 
         * @returns {Boolean}
         */
        
        $scope.shouldHideThumbList = function(){
            return false;
        };
        
    }]);