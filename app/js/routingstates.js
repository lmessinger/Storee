angular.module('st.app').config(
        ['$stateProvider', '$urlRouterProvider', 'APP_CONFIG',
            function($stateProvider, $urlRouterProvider, APP_CONFIG) {

                // For any unmatched url, send to /route1
                $urlRouterProvider.otherwise('/');

                //////////////////////////
                // State Configurations //
                //////////////////////////

                // Use $stateProvider to configure your states.
                $stateProvider
                        .state("home", {
                            url: "/",
                            reloadOnSearch: false,
                            views: {
                                'contentView': {
                                    templateUrl: APP_CONFIG.baseUrl +
                                            'partials/layouts/home.html'},
                                'categoryThumbList': {
                                    templateUrl: APP_CONFIG.baseUrl +
                                            'partials/layouts/category-thumb-list.html'
                                }
                            }
                        })
                        .state("home.category", {
                            url: ":catId/:catslug",
                            reloadOnSearch: false,
                            onEnter: function(){
                                setTimeout(function(){
                                    window.scrollTo(0,0);
                                },100);
                            },
                            onExit: function(){
                                setTimeout(function(){
                                    window.scrollTo(0,0);
                                },100);
                            }
                        })
                        .state("home.product", {
                            url: ":catId/:catslug/:prodId/:productSlug",
                            reloadOnSearch: false
                        })
                        .state("productDetails", {
                            url: "/productdetails/:prodId/:productSlug",
                            reloadOnSearch: false,
                            onEnter: function(){
                                setTimeout(function(){
                                    window.scrollTo(0,0);
                                },100);
                            },
                            onExit: function(){
                                setTimeout(function(){
                                    window.scrollTo(0,0);
                                },100);
                            },
                            views: {
                                'contentView': {
                                    templateUrl: APP_CONFIG.baseUrl +
                                            'partials/layouts/product-details.html'
                                },
                                'categoryThumbList': ''
                            }
                        })
                        .state('cmspage', {
                            url: '/cmspage/:cmsPageId/:cmsSlug',
                            views: {
                                'contentView': {
                                    templateUrl: APP_CONFIG.baseUrl +
                                            'partials/layouts/cms-page.html'
                                },
                                'categoryThumbList': ''
                            }
                        })

            }]);