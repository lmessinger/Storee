/**
 * dynamic content retriever: 
 * use for cases when the data block contains directives
 */
angular.module('st.app').controller("dynamicBlockCtrl", ['$scope', '$element',
    '$log', 'APP_CONFIG', '$compile', '$injector', '$attrs',function($scope, $element, 
    console, APP_CONFIG, $compile,$injector,$attrs) {

    /**
     * observe the scope attribute 
     * (dont use watch cause that would mean an isolated scope)
     */
    $attrs.$observe('blockId',function(n,o) {
       if (n == APP_CONFIG.noBlock || typeof n == 'undefined') {
                //noop
            } else{ 
                var blockId = n;
                // get the right content model
                var contentModel = $injector.get(APP_CONFIG.dataProvider+'ContentModel');
                // get the data
                contentModel.getBlockHtml(blockId,function(data) {
                   // compile the content
                   $compile(data.html)($scope,function(clone){
                       // put it on the element
                       $element.html(clone);
                   });

                });
            }
            
    });
    

}]);