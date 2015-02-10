'use strict';

/* Directives */


angular.module('st.app').directive('productFull', ['APP_CONFIG', function(APP_CONFIG) {
        return {
            restrict: 'AE',
            controller: 'ProductFullCtrl',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/product-full.html',
            scope: {
                prodId: '=',
                fitToSize: '=',
                showCtrls: '=',
                thumbState: '=',
                offset: '='
            }
        };
    }]);

angular.module('st.app').directive('productTitle', ['APP_CONFIG', function(APP_CONFIG) {
        return {
            restrict: 'AE',
            controller: 'ProductTitleController',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/product-title.html',
            scope: {
                product: '=',
                thumbState: '=',
                offset: '='
            }
        };
    }]);

angular.module('st.app').directive('cmsPage', ['APP_CONFIG', function(APP_CONFIG) {
        return {
            restrict: 'AE',
            controller: 'CMSPageCtrl',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/cms-page.html',
            scope: {
                cmsPageId: '='
            }
        };
    }]);

angular.module('st.app').directive('productDetails', ['APP_CONFIG', function(APP_CONFIG) {
        return {
            restrict: 'AE',
            controller: 'ProductDetailsCtrl',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/product-details.html',
            scope: {
                prodId: '=',
                showCtrls: '=showCtrls'
            }
        };
    }]);

angular.module('st.app').directive('stAccordion', ['APP_CONFIG', function(APP_CONFIG) {
        return {
            restrict: 'AE',
            controller: 'AccordionCtrl',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/st-accordion.html',
            scope: {
                attrSrc: '=',
                fields: '='
            }
        };
    }]);

angular.module('st.app').directive('categorylist', ['APP_CONFIG', function(APP_CONFIG) {
        return {
            restrict: 'AE',
            controller: 'CategoryListCtrl',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/category-list.html',
            scope: {
                rootCat: '=',
                selectedCategory: '=',
                blockId: '=',
                baseUrl: '='
            }
        };
    }]);

angular.module('st.app').directive('productFullList', ['APP_CONFIG', function(APP_CONFIG) {
        return {
            scope: {
                fitToSize: '=',
                catId: '=',
                activeProdId: '=',
                animate: '=',
                animationInterval: '=',
                autoPlay: '=',
                showCtrls: '=',
                thumbState: '=',
                offset: '='
            },
            restrict: 'AE',
            controller: 'ProductFullListCtrl',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/product-full-list.html'
        };
    }]);

angular.module('st.app').directive('categoryThumbList', ['APP_CONFIG', function(APP_CONFIG) {
        return {
            restrict: 'AE',
            controller: 'CategoryThumbListController',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/category-thumb-list.html',
            scope: {
                catId: '=',
                slug: '=',
                activeProdId: '=',
                selectedCategory: '=',
                thumbState: '=',
                offset: '='
            },
            link: function($scope, element, attrs) {

                var topOffset = attrs.bottomOffset;

                if (typeof topOffset != 'undefined') {
                    if (topOffset.indexOf("%") != -1) {
                        element.css("bottom", topOffset);
                    }
                    else if (topOffset.indexOf("px") != -1) {
                        element.css("bottom", topOffset);
                    }
                    else {
                        element.css("bottom", topOffset + "px");
                    }
                }
                element.css("width", "100%");
                element.css("max-width", "100%");
                element.css("position", "absolute");
                element.css("zIndex", "50");

            }

        };

    }]);

angular.module('st.app').directive('productThumbList', ['APP_CONFIG', function(APP_CONFIG) {
        return {
            restrict: 'AE',
            controller: 'ProductThumbListController',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/product-thumb-list.html',
            scope: {
                catId: '=',
                slug: '=',
                activeProd: '=',
                selectedCategory: '='
            },
            link: function($scope, element, attrs) {

            }

        };

    }]);

angular.module('st.app').directive('genThumbList', ['APP_CONFIG', function(APP_CONFIG) {
        return {
            restrict: 'AE',
            controller: 'GeneralThumbListController',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/gen-thumb-list.html',
            scope: {
                showTopBar: '=',
                topBarTitle: '=',
                datasource: '=',
                activeItemId: '=',
                uniqueId: '='
            }

        };

    }]);

angular.module('st.app').directive('ajaxLoader', ['APP_CONFIG', function(APP_CONFIG) {
        return {
            restrict: 'E',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/ajax-loader.html'
        };
    }]);

angular.module('st.app').directive('staticBlock', ['APP_CONFIG', function(APP_CONFIG) {
    return {
        restrict: 'E',
        controller: 'StaticBlockCtrl',
        templateUrl: APP_CONFIG.baseUrl + 'partials/directives/static-block.html',
        scope: {
            blockId: '='
        }
    };
}]);

angular.module('st.app').directive('bgImg', function() {
    return{
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            $element.css("background-image", "url('" + $attrs.bgImg + "')");
        }
    };
});

angular.module('st.app').directive('productOption', ['APP_CONFIG', function(APP_CONFIG) {
    return{
        restrict: 'E',
        controller: 'ProductOptionCtrl',
        templateUrl: APP_CONFIG.baseUrl + 'partials/directives/product-option.html',
        scope: {
            prodId: '@prodId',
            optionLabel: '@optionLabel',
            option: '=option'
        }
    };
}]);

/**
 * product zoom directive
 */
angular.module('st.app').directive('ngElevateZoom', ['$timeout', function(
            $timeout) {
        return {
            restrict: 'A',
            link: function($scope, $element, $attrs) {
                /**
                 * It watch for the zoomImage to load so that it can
                 * initialize elevateZoom
                 * 
                 * @param {type} s
                 * @param {type} e
                 * @param {type} a
                 * @returns {undefined}
                 */
                var imgLoader = function(s, e, a) {
                    if (a.zoomImage) {
                        
                        $.removeData(e, 'elevateZoom');//remove zoom instance from image
                        $('.zoomContainer').remove();// remove zoom container from DOM
                        
                        e.attr('data-zoom-image', a.zoomImage);
                        $(e).elevateZoom({scrollZoom: true, easing: true});
                        //setting up ez object in scope for later use in controller
                        s.ez = $(e).data('elevateZoom');
                    } else {
                        $timeout(function() {
                            imgLoader(s, e, a);
                        }, 300);
                    }
                };
                
                imgLoader($scope, $element, $attrs);
            }
        };
    }]); 

/**
 * dynamic cart icon
 */
angular.module('st.app').directive('cartIcon', ['APP_CONFIG',function(APP_CONFIG
            ) {
        return {
            restrict: 'AE',
            controller: 'cartIconCtrl',
            templateUrl: APP_CONFIG.baseUrl + 'partials/directives/cart-icon.html',
            
        };
    }]);
    
/**
 * Storee site header
 * mainly abstracts the dynamic-content retrieval of the header
 */
angular.module('st.app').directive('storeeHeader', ['APP_CONFIG',function(APP_CONFIG
        ) {
    return {
        restrict: 'AE',
        template: '<div class="st-header"><dynamic-block block-id="header"></dynamic-block></div>'

    };
}]);

/**
 * dynamic content retriever: 
 * use for cases when the data block contains directives
 */
angular.module('st.app').directive('dynamicBlock', function(
        ) {
    return {
        restrict: 'AE',
        controller: 'dynamicBlockCtrl',
        scope: false
    };
});

angular.module('st.app').directive('onTouch', function() {
  return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            var ontouchFn = scope.$eval(attrs.onTouch);
            elm.bind('touchstart', function(evt) {
                scope.$apply(function() {
                    ontouchFn.call(scope, evt.which);
                });
            });
        }
    };
});