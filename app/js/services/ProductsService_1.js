'use strict';

myApp.factory('ProductsService', function($cacheFactory, ProductModel, $q, $rootScope) {
    var productsCache = $cacheFactory('productsService');
    var productIdsCache = $cacheFactory('productIdsService');
    
    return {
        getProductIds: function(category_id, prod_id) {
            var deferred = $q.defer();
        
            if ( !productIdsCache.get(category_id) ) {
            
                if(prod_id){
                    ProductModel.getProductPrevNext(category_id, prod_id, 25, function(productIds){
                        productIdsCache.put(category_id,productIds);
                        deferred.resolve(productIds);
                    });
                }else{
                    ProductModel.getProductIdsByCategory(category_id, function(productIds){
                        productIdsCache.put(category_id,productIds);
                        deferred.resolve(productIds);
                    });
                }
                
                return deferred.promise.then(function(data){
                    return data.slice(0,3);
                });
            
            } else {
                var _productIds = productIdsCache.get(category_id);
                var current = 1;
                
                if(prod_id){
                    if(_productIds.indexOf(prod_id) == -1){
                        ProductModel.getProductPrevNext(category_id, prod_id, 25, function(productIds){
                        
                            for(var prodIndex in productIds){
                                var prodId = productIds[prodIndex];
                                
                                if(_productIds.indexOf(prodId) == -1){
                                    _productIds.push(prodId);
                                }
                            }
                        
                            current = _productIds.indexOf(prod_id);
                        
                            productIdsCache.put(category_id,_productIds);
                            deferred.resolve(_productIds);
                        });
                    }
                }
            
                return _productIds.slice(current - 1,current + 2);
            }
        },
        get: function (prod_id){
            var deferred = $q.defer();
        
            if ( !productsCache.get(prod_id) ) {
                ProductModel.getProduct(prod_id, function(product){
                    productsCache.put(prod_id,product);
                    deferred.resolve(product);
                });
            
                return deferred.promise.then(function(data){
                    return data;
                });
                
            } else {
                return productsCache.get(prod_id);
            }
        }
    };
});