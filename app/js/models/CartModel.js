'use strict';

angular.module('st.app').service("CartModel", ['$http', 'APP_CONFIG', '$log','$timeout', function(
            $http, APP_CONFIG,console,timeout) {
        this.addToCart = function(prodId, options, qty, callback) {
            $http({
                method: 'POST',
                headers: {
                    Accept: 'application/json'
                },
                data: {
                    entity_id: prodId,
                    options: options,
                    qty: qty
                },
                dataType: 'json',
                url: APP_CONFIG.magentoApiRest + 'checkout/carts/',
                cache: true
            }).
                    success(function(response, status, headers, config) {
                        callback(response);
                    }).
                    error(function(data, status, headers, config) {
                        console.log(data);
                        callback(null);
                    });
        };
        
        this.getCartDetails = function(callback) {
            
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                
                url: APP_CONFIG.magentoApiRest + 'checkout/cartcount/'
            }).
            success(function(response, status, headers, config) {
                callback(response);
            }).
            error(function(data, status, headers, config) {
                console.log('error in fetching cart data',data,status,headers,config);
                callback(null);
            });
        }
        
 }]);
