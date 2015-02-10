'use strict';

/* CategoryList Controller */
angular.module('st.app').controller("CategoryListCtrl", ['$scope',
    '$injector', '$location', '$log', 'APP_CONFIG', function($scope, $injector,
            $location, $log, APP_CONFIG) {
        $scope.catgories = [];
        $scope.loading = true;
        $scope.showCategories = false;
        var TAG = 'CategoryListCtrl';

        var CategoryModel = $injector.get(APP_CONFIG.dataProvider +
                'CategoryModel');

        /**
         * Getting categories from API w.r.t root category
         */
        CategoryModel.getCategories($scope.rootCat, function(categories) {
            // convert blockId to type and add one cms page
            var addCmsPage = function() {
                for(var i=0;i<categories.length;i++) {
                    if (categories[i].blockId)
                        categories[i].type = APP_CONFIG.block;
                    else categories[i].type = APP_CONFIG.category;
                }
                // add by hand (oy vey)
                categories.push({
                    type: "cmsPage",children: Array[0],blockId: 9,name: "Stockists",slug: "stockists"
                })
            }
            $scope.loading = false;

            addCmsPage();
            $scope.categories = categories;

            /**
             * In case of bookmarked URL category name will not be available 
             * in selected category. Just update selected category information
             * after fetching is from server.
             */
            if ($scope.selectedCategory != null &&
                ($scope.selectedCategory.name == null ||
                 $scope.selectedCategory.name == "")) {
                    for (var i = 0; i < categories.length; ++i) {
                        var category = categories[i];
                        if (category.id == $scope.selectedCategory.id) {
                            $scope.selectedCategory = category;
                            break;
                        }
                    }
            }
           
            // build URL for the link
            for (var i = 0; i < categories.length; ++i) {
                var category = categories[i];
                category.href = $scope.baseUrl + "#/";
                if (category.type===APP_CONFIG.block) 
                    category.href += "page/" + category.blockId;
                else if (category.type===APP_CONFIG.cmsPage) 
                    category.href += "cmspage/" + category.blockId+ '/' + category.slug;
                else category.href += category.id + '/' + category.slug;
            }
        });
        
        /**
         * called upon click on an item
         * @param {type} category
         */
        $scope.selectCategory = function(category) {
            // close menu on click
            $scope.showCategories = false;
        }
                
                 


    }]);