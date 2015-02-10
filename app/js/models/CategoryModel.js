'use strict';

/* Category Model */
angular.module('st.app').service("CategoryModel", ['$http', 'APP_CONFIG', function($http, APP_CONFIG) {
    
    /**
     * get categories from server
     * @param {type} id
     * @param {type} callback
     * @returns {categoy list callback}
     */
    this.getCategories = function(id, callback){
        // if pre-rendered category data loaded already by index.html
        if (typeof jsonPData != 'undefined' && jsonPData['categories/' + id]) {
            
           callback (jsonPData['categories/' + id])
        }
        else // call the server
            $http({
            method: 'GET',
            headers: {
                Accept: 'application/json'
            },
            url: APP_CONFIG.magentoApiRest + 'categories/' + id,
            cache: true
        }).
        success(function(categories, status, headers, config) {
            callback(categories);
        }).
        error(function(data, status, headers, config) {
            console.log(data);
            callback(null);
        });  
    };
}]);