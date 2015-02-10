'use strict';

/* Main app Controller */

angular.module('st.app').controller("cartIconCtrl", ['$scope','$element','$timeout', 
    '$log', '$location', '$injector','APP_CONFIG',function($scope,element, $timeout,console, location,$injector,APP_CONFIG) {

    $scope.itemCount = 0;
    $scope.showDescription = false;
    
    // initial data load
    var cartModel = $injector.get(APP_CONFIG.dataProvider + 'CartModel');
    console.log('cart ctrl',cartModel);
    cartModel.getCartDetails(function(itemCount) {
        console.log('cart loaded',itemCount);
        $scope.itemCount = parseInt(itemCount); 
    })
    
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
     $scope.$on('st-app-mousemove', function() {
            $scope.makeDescriptionVisible();
        });
    /**
     * an item was added to the cart
     */
    $scope.$on('st-item-added',function(ev) {
        $scope.itemCount++;
        var icon = element.find('img');
        var orig_width = icon.width(),
            orig_height = icon.height();
            
        // pulse
        icon.animate({
            height: orig_height*1.1
          }, 250, function() {
                // back to normal
                icon.animate({
                height: orig_height
              })
          });
    });
    
    $scope.itemCountText = function() {
        if ($scope.itemCount) 
            return '' + $scope.itemCount + '';
        else return '';
    }
}])


