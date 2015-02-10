'use strict';

/* Product Model */

angular.module('st.app').service("ProductModel", ['$http', 'APP_CONFIG',
    '$log', function($http, APP_CONFIG, $log) {
        /**
         * 
         * @param {type} id
         * @param {type} callback
         * @returns {undefined}
         */
        this.getProduct = function(id, callback) {
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                url: APP_CONFIG.magentoApiRest + 'product/' + id,
                cache: true
            }).
                    success(function(product, status, headers, config) {
                        $log.debug(product);
                        callback(product);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });
        };

        /**
         * 
         * @param {type} callback
         * @returns {undefined}
         */
        this.getProducts = function(callback) {
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                url: APP_CONFIG.magentoApiRest + 'products?limit=10'
            }).
                    success(function(products, status, headers, config) {
                        $log.debug(products);
                        callback(products);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });
        };

        /**
         * 
         * @param {type} category_id
         * @param {type} callback
         * @returns {undefined}
         */
        this.getProductsByCategory = function(category_id, callback) {
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                params: {
                    category_id: category_id,
                    limit: 10
                },
                url: APP_CONFIG.magentoApiRest + 'products'
            }).
                    success(function(products, status, headers, config) {
                        $log.debug(products);
                        callback(products);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });
        };

        /**
         * 
         * @param {type} prod_id
         * @param {type} callback
         * @returns {undefined}
         */
        this.getProductImages = function(prod_id,minHeight, callback) {

            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                params: {
                    width: 90,
                    height: 70,
                    minmumHeight: minHeight
                },
                url: APP_CONFIG.magentoApiRest + 'products/' + prod_id +
                        '/gallery_images'
            }).
                    success(function(product_images, status, headers,
                            config) {
                        callback(product_images);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });

        };

        /**
         * 
         * @param {type} category_id
         * @param {type} last_thumb_id
         * @param {type} callback
         * @returns {undefined}
         */
        this.getProductNextThumb = function(category_id, last_thumb_id,
                callback) {
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                url: APP_CONFIG.magentoApiRest + 'product_thumbs/next/' +
                        category_id + '/' + last_thumb_id
            }).
                    success(function(product_thumb, status, headers, config) {
                        var thumbnail = $.map(product_thumb, function(value,
                                key) {
                            return value;
                        });
                        callback(thumbnail);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });
        };

        /**
         * 
         * @param {type} categoryId
         * @param {type} orderby
         * @param {type} order
         * @param {type} callback
         * @returns {undefined}
         */
        this.getProductsBasicDataByCategory = function(categoryId, orderby,
                order, callback) {
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                params: {
                    orderby: orderby,
                    order: order,
                    limit: APP_CONFIG.productBasicDataLimit
                },
                url: APP_CONFIG.magentoApiRest + 'product_ids/' + categoryId
            }).
                    success(function(products, status, headers, config) {
                        $log.debug(products);
                        callback(products);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });
        };

        /**
         * 
         * @param {type} categoryId
         * @param {type} prodId
         * @param {type} rank
         * @param {type} orderby
         * @param {type} order
         * @param {type} prevnext
         * @param {type} limit
         * @param {type} callback
         * @returns {undefined}
         */
        this.getProductPrevNext = function(categoryId, prodId, rank, orderby,
                order, prevnext, limit, callback) {
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                params: {
                    orderby: orderby,
                    //coma separated orderby fields e.g created_at, price, etc Default: created_at
                    order: order, //ASC or DESC Default: DESC
                    prevnext: prevnext,
                    //fetch prev/next/prevnext items from the current item's rank
                    limit: limit        //limit of items, response (prev limited items)current(next limited items)
                },
                url: APP_CONFIG.magentoApiRest + 'products/prev_next/' +
                        categoryId + '/' + prodId + '/' + rank,
                cache: true
            }).
                    success(function(products, status, headers, config) {
                        $log.debug(products);
                        callback(products);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });
        };

        /**
         * 
         * @param {type} prodId
         * @param {type} callback
         * @returns {undefined}
         */
        this.getProductAttributes = function(prodId, callback) {
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                url: APP_CONFIG.magentoApiRest + 'products/attributes/' +
                        prodId,
                cache: true
            }).
                    success(function(attributes, status, headers, config) {
                        $log.debug(attributes);
                        callback(attributes);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });
        };

        /**
         * This function returns the product options, required for displaying
         * on product details page
         * 
         * @param {type} prodId
         * @param {type} callback
         * @returns {undefined}
         */
        this.getProductOptions = function(prodId, callback) {
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                url: APP_CONFIG.magentoApiRest + 'products/' +
                        prodId + '/options',
                cache: true
            }).
                    success(function(options, status, headers, config) {
                        $log.debug(options);
                        callback(options);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });
        };
    }]);