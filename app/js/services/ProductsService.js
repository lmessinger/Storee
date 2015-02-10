'use strict';
angular.module('st.app').factory('ProductsService', function($cacheFactory,
        APP_CONFIG, $log, $injector) {
    var productsCache = $cacheFactory(
            'productsService'); //cache to store info related to product
    var productBasicDataCache = $cacheFactory(
            'productBasicDataService');// cache to store products' basic data categorised by category ids
    var TAG = 'ProductsService'; //used for log
    var ProductModel = $injector.get(APP_CONFIG.dataProvider + 'ProductModel');

    /**
     * helper function to get the index of product on the basis of product id from the dataset
     * 
     * @param {type} dataset
     * @param {Number} prodId
     * @returns {Number}
     */
    function getProductIndex(dataset, prodId) {
        var retIndex = -1;
        try {
            for (var index in dataset) {
                if (prodId == dataset[index].entity_id) {
                    retIndex = parseInt(index);
                    break;
                }
            }
        }
        catch (e) {
            $log.error(TAG + ':getProductIndex: ' + e);
        }

        return retIndex;
    }

    /**
     * 
     * @param {type} dataset
     * @returns {undefined}
     */
    function loadProductsInCache(dataset) {
        try {
            for (var index in dataset) {
                var product = dataset[index];

                if (product != null && !productsCache.get(product.entity_id)) {
                    productsCache.put(product.entity_id, product);
                }
            }
        } catch (e) {
            $log.error(TAG + ':loadProductsInCache: ' + e);
        }
    }

    /**
     * used to allow slicing associative arrays
     * 
     * @param {type} fakeArray
     * @param {Number} start
     * @param {Number} end
     * @returns {unresolved}
     */
    function slice(fakeArray, start, end) {
        var realArray = $.makeArray(fakeArray);
        return realArray.slice(start, end);
    }

    /**
     * used to return sliced products dataset
     * 
     * @param {Number} current
     * @param {Number} size
     * @param {String} direction
     * @param {type} dataset
     * @param {Boolean} inclCurrent
     * @param {Function} callback
     * @returns {undefined}
     */
    function getSlicedProducts(current, size, direction, dataset, inclCurrent,
            callback) {
        var start = 0, end = 0;
        try {
            switch (direction) {
                case 'prev':
                    if (current - size < 0) {
                        start = 0;
                        end = current + 1;
                    } else if (size <= APP_CONFIG.prevNextLimit) {
                        start = current - size;
                        end = current + 1;
                    } else {
                        start = current - APP_CONFIG.prevNextLimit;
                        end = current + 1;
                    }
                    break;
                case 'next':
                    if (current + size >= dataset.length) {
                        start = current;
                        end = dataset.length;
                    } else if (size <= APP_CONFIG.prevNextLimit) {
                        start = current;
                        end = current + size;
                    } else {
                        start = current;
                        end = current + APP_CONFIG.prevNextLimit;
                    }
                    break;
                default:    //prev and next data
                    size = Math.floor(size / 2);
                    // dividing size in two parts for prev / next
                    if (current - size < 0) {
                        start = 0;
                    } else if (size <= APP_CONFIG.prevNextLimit) {
                        start = current - size;
                    } else {
                        start = current - APP_CONFIG.prevNextLimit;
                    }

                    if (current + size >= dataset.length) {
                        end = dataset.length;
                    } else if (size <= APP_CONFIG.prevNextLimit) {
                        end = current + size + 1;
                    } else {
                        end = current + APP_CONFIG.prevNextLimit;
                    }
                    break;
            }

            if (!inclCurrent) {
                start = (direction == 'next') ? (start + 1) : start;
                end = (direction == 'prev') ? (end - 1) : end;
            }

            //handling null pointer at the end of list, used to identify we're at the end of list.
            if (dataset[end - 1] == null)
                end--;

            if (callback != null && typeof callback != 'undefined')
                callback(dataset.slice(start, end));
        } catch (e) {
            $log.error(TAG + ':getSlicedProducts: ' + e);

            if (callback != null && typeof callback != 'undefined')
                callback(null);
        }

        loadProductsInCache(dataset);
    }

    var ProductService =
            {
                /**
                 * 
                 * @param {Number} current
                 * @param {type} productsBasicData
                 * @param {Number} category_id
                 * @param {Number} size
                 * @param {String} orderby
                 * @param {String} order
                 * @param {String} prevnext
                 * @param {Boolean} inclCurrent
                 * @param {Boolean} currentInMiddle
                 * @returns {undefined}
                 */
                checkThreshold: function(current, productsBasicData,
                        category_id, size,
                        orderby, order, prevnext, inclCurrent,
                        currentInMiddle) {
                    if (prevnext == 'next' && current + 5 >=
                            productsBasicData.length) {
                        var lastProduct =
                                productsBasicData[productsBasicData.length
                                        - 1];
                        if (typeof lastProduct != 'undefined'
                                && lastProduct != null
                                && (lastProduct.rank - 1
                                        != current)) {

                            this.getProductsBasicData(category_id,
                                    lastProduct.entity_id,
                                    lastProduct.rank, size,
                                    orderby, order, 'next',
                                    inclCurrent, currentInMiddle);
                        }
                    } else if (prevnext == 'prev' && current > 0) {
                        //find first product and see if it comes in the threshold
                        var firstProduct = null;
                        var lastIndex = null;

                        for (var index in productsBasicData) {
                            if (typeof productsBasicData[index]
                                    != 'undefined') {
                                lastIndex = index - 1;
                                if (lastIndex >= 0
                                        && (typeof productsBasicData[lastIndex]
                                                == 'undefined')) {
                                    firstProduct = productsBasicData[index];
                                    break;
                                }
                            }
                        }

                        if (firstProduct != null && (current - 5
                                <= lastIndex) && (firstProduct.rank - 1 !=
                                current)) {

                            this.getProductsBasicData(category_id,
                                    firstProduct.entity_id,
                                    firstProduct.rank, size,
                                    orderby, order, 'prev',
                                    inclCurrent, currentInMiddle);
                        }

                    }
                },
                /**
                 * helper function for returning product rank from the cache
                 * 
                 * @param {Number} category_id
                 * @param {Number} prod_id
                 * @returns {Number}
                 */
                getProductRank: function(category_id, prod_id) {
                    //This function finds the rank of product from the cache and returns it

                    try {
                        var productsBasicData = productBasicDataCache.get(
                                category_id);
                        if (productsBasicData) {
                            for (var index in productsBasicData) {
                                if (productsBasicData[index] != null && prod_id
                                        == productsBasicData[index].entity_id)
                                    return productsBasicData[index].rank;
                            }
                        }
                    } catch (e) {
                        $log.error(TAG + ":getProductRank: " + e);
                    }

                    return 0;
                },
                /**
                 * This function is used to fetch products' basic data from data provider
                 * 
                 * @param {Number} category_id
                 * @param {Number} prod_id
                 * @param {Number} rank
                 * @param {Number} size
                 * @param {String} orderby
                 * @param {String} order
                 * @param {String} prevnext
                 * @param {Boolean} inclCurrent
                 * @param {Boolean} currentInMiddle
                 * @param {Function} callback
                 * @returns {undefined}
                 */
                getProductsBasicData: function(category_id, prod_id, rank,
                        size, orderby, order, prevnext, inclCurrent,
                        currentInMiddle, callback) {

                    //Looking if the cache has the basic data of products w.r.t category
                    if (!productBasicDataCache.get(category_id)) {
                        //no basic data found w.r.t category id but we have product id to fetch data,
                        //this happens when we enter bookmark url of a product
                        if (prod_id) {
                            //fetching the previous and next items w.r.t given product id, here we don't know the rank of product w.r.t order criteria
                            // but api will find the rank itself and returns the ranked data.
                            ProductModel.getProductPrevNext(category_id,
                                    prod_id, 0, orderby, order, 'prevnext',
                                    APP_CONFIG.prevNextLimit, function(
                                            productsBasicData) {
                                        if (productsBasicData.length == 0) {
                                            callback([]);
                                            return;
                                        }

                                        //defining an array with the length of rank number, e.g if our rank is 25 then it will define an array with
                                        // 25 elements 0-24 and make the elements undefined.
                                        var maxRank =
                                                productsBasicData[productsBasicData.length
                                                        - 1].rank;
                                        var dataset = [];
                                        dataset[maxRank - 1] = 'undefined';

                                        //setting the elements w.r.t to its rank (Here ranks are actually starting from 1 that's why subtracting -1 to make it
                                        //0 starting array)
                                        for (var index in productsBasicData) {
                                            dataset[productsBasicData[index].rank
                                                    - 1] =
                                                    productsBasicData[index];
                                        }

                                        //Now all data is set in array saving it in the cache for future retreival
                                        productBasicDataCache.put(category_id,
                                                dataset);

                                        //finding the current index of product and returning the sliced dataset to callback
                                        current = getProductIndex(dataset,
                                                prod_id);
                                        getSlicedProducts(current, size,
                                                prevnext, dataset, inclCurrent,
                                                callback);
                                    });
                        } else {
                            //getting the products' basic data w.r.t to category id and storing in the cache
                            ProductModel.getProductsBasicDataByCategory(
                                    category_id, orderby, order, function(
                                            productsBasicData) {
                                        productBasicDataCache.put(category_id,
                                                productsBasicData);
                                        //loading products in cache
                                        loadProductsInCache(productsBasicData);
                                        getSlicedProducts(0, size, prevnext,
                                                productsBasicData, inclCurrent,
                                                callback);
                                    });
                        }

                    } else {
                        //Now we have data in our cache but we need to check if we need more data in case of prev/next navigation
                        var _productsBasicData = productBasicDataCache.get(
                                category_id);
                        var current = 1;

                        if (prod_id) {
                            //We have the product id, have to see if it's available in cache or not, if not then fetch from API
                            if (getProductIndex(_productsBasicData, prod_id)
                                    == -1) {
                                //Fetching previous and next products from API and storing in cache
                                ProductModel.getProductPrevNext(category_id,
                                        prod_id, rank, orderby, order,
                                        prevnext, APP_CONFIG.prevNextLimit,
                                        function(productsBasicData) {
                                            if (productsBasicData.length
                                                    == 0) {
                                                callback([]);
                                                return;
                                            }

                                            for (var prodIndex in productsBasicData) {
                                                var product =
                                                        productsBasicData[prodIndex];
                                                _productsBasicData[product.rank
                                                        - 1] =
                                                        product;
                                            }

                                            current = getProductIndex(
                                                    _productsBasicData,
                                                    prod_id);

                                            productBasicDataCache.put(
                                                    category_id,
                                                    _productsBasicData);
                                            if (currentInMiddle)
                                                prevnext = 'prevnext';
                                            getSlicedProducts(current,
                                                    size, prevnext,
                                                    _productsBasicData,
                                                    inclCurrent,
                                                    callback);
                                        });
                            } else {
                                current = getProductIndex(_productsBasicData,
                                        prod_id);

                                //fetch products if threshold reached
                                this.checkThreshold(current,
                                        _productsBasicData,
                                        category_id, size, orderby, order,
                                        prevnext, inclCurrent, currentInMiddle)

                                if (prevnext == 'prev') {
                                    //We're navigating on left using previous navigation, have to see if we have to fetch more records or we are
                                    // at the boundary.
                                    var shouldGetData = false;
                                    if (size > rank) {
                                        var index = size - rank;

                                        if (index - 1 >= 0
                                                &&
                                                typeof _productsBasicData[index
                                                        - 1]
                                                == 'undefined') {
                                            shouldGetData = true;
                                        }
                                    }

                                    if (typeof _productsBasicData[current - 1]
                                            == 'undefined'
                                            && _productsBasicData[current].rank
                                            != 1 || shouldGetData) {

                                        ProductModel.getProductPrevNext(
                                                category_id, prod_id, rank,
                                                orderby, order, prevnext,
                                                APP_CONFIG.prevNextLimit,
                                                function(
                                                        productsBasicData) {

                                                    for (var prodIndex in productsBasicData) {
                                                        var product =
                                                                productsBasicData[prodIndex];
                                                        _productsBasicData[product.rank
                                                                - 1] =
                                                                product;
                                                    }

                                                    productBasicDataCache.put(
                                                            category_id,
                                                            _productsBasicData);

                                                    if (currentInMiddle) {
                                                        prevnext = 'prevnext';
                                                    }

                                                    getSlicedProducts(
                                                            current,
                                                            size,
                                                            prevnext,
                                                            _productsBasicData,
                                                            inclCurrent,
                                                            callback);
                                                });
                                    } else {
                                        if (currentInMiddle)
                                            prevnext = 'prevnext';
                                        //We're at the boundary upon previous navigation, now just return the sliced products
                                        getSlicedProducts(current, size,
                                                prevnext, _productsBasicData,
                                                inclCurrent, callback);
                                    }
                                } else if (prevnext == 'next') {
                                    //We're navigating on right using next navigation, have to see if we have to fetch more records or we are
                                    // at the boundary.
                                    if (typeof _productsBasicData[current + 1]
                                            == 'undefined'
                                            && _productsBasicData[current]
                                            != null) {

                                        ProductModel.getProductPrevNext(
                                                category_id, prod_id, rank,
                                                orderby, order, prevnext,
                                                APP_CONFIG.prevNextLimit,
                                                function(
                                                        productsBasicData) {

                                                    if (productsBasicData.length
                                                            == 0) {
                                                        //If no more data is returned from API then it looks to be the end of list, now just push a null
                                                        // at the end of our cache, so that we can identify we're at the end of list.
                                                        if (_productsBasicData.length !=
                                                                0 &&
                                                                _productsBasicData[_productsBasicData.length -
                                                                        1] !=
                                                                null) {
                                                            _productsBasicData.push(
                                                                    null);
                                                        }
                                                    } else {

                                                        for (var prodIndex in productsBasicData) {
                                                            var product =
                                                                    productsBasicData[prodIndex];
                                                            _productsBasicData[product.rank
                                                                    - 1] =
                                                                    product;
                                                        }

                                                    }

                                                    productBasicDataCache.put(
                                                            category_id,
                                                            _productsBasicData);
                                                    if (currentInMiddle)
                                                        prevnext =
                                                                'prevnext';
                                                    getSlicedProducts(
                                                            current,
                                                            size,
                                                            prevnext,
                                                            _productsBasicData,
                                                            inclCurrent,
                                                            callback);
                                                });
                                    } else {
                                        if (currentInMiddle)
                                            prevnext = 'prevnext';

                                        getSlicedProducts(current, size,
                                                prevnext, _productsBasicData,
                                                inclCurrent, callback);
                                    }
                                } else {
                                    if (currentInMiddle)
                                        prevnext = 'prevnext';

                                    getSlicedProducts(current, size, prevnext,
                                            _productsBasicData, inclCurrent,
                                            callback);
                                }

                            }
                        } else {
                            if (currentInMiddle)
                                prevnext = 'prevnext';
                            getSlicedProducts(current - 1, size, prevnext,
                                    _productsBasicData, inclCurrent, callback);
                        }
                    }
                },
                /**
                 * It is used to fetch cached product from the productBasicDataCache
                 * 
                 * @param {Number} category_id
                 * @param {Number} prod_id
                 * @param {Function} callback
                 * @returns {undefined}
                 */
                getCachedBasicProduct: function(category_id, prod_id,
                        callback) {
                    if (productBasicDataCache.get(category_id)) {
                        var productBasicData = productBasicDataCache.get(
                                category_id);
                        for (var index in productBasicData) {
                            if (prod_id == productBasicData[index].entity_id) {
                                callback(productBasicData[index]);
                                return;
                            }
                        }
                        callback(null);
                    } else {
                        callback(null);
                    }
                },
                /**
                 * 
                 * @param {Number} category_id
                 * @param {Function} callback
                 * @returns {undefined}
                 */
                getFirstProduct: function(category_id, callback) {
                    if (productBasicDataCache.get(category_id)) {
                        var productBasicData = productBasicDataCache.get(
                                category_id);

                        if (productBasicData != null &&
                                productBasicData.length > 0) {
                            for (var i = 0; i < productBasicData.length; ++i) {
                                if (productBasicData[i] != null) {
                                    callback(productBasicData[i]);
                                    break;
                                }
                            }
                        }
                        else
                            callback(null);
                    } else {
                        callback(null);
                    }
                },
                /**
                 * 
                 * @param {Number} prod_id
                 * @param {Function} callback
                 * @returns {undefined}
                 */
                get: function(prod_id, callback) {

                    if (!productsCache.get(prod_id)) {
                        ProductModel.getProduct(prod_id, function(product) {
                            productsCache.put(prod_id, product);
                            callback(product);
                        });

                    } else {
                        callback(productsCache.get(prod_id));
                    }
                },
                /**
                 * 
                 * @param {type} prod_id
                 * @param {type} callback
                 * @returns {undefined}
                 */
                getProductAttributes: function(prod_id, callback) {
                    var _product = productsCache.get(prod_id);
                    if (!_product) {
                        ProductModel.getProduct(prod_id, function(product) {
                            ProductModel.getProductAttributes(prod_id,
                                    function(attributes) {
                                        product.attributes = attributes;
                                        productsCache.put(prod_id, product);
                                        callback(attributes);
                                    });
                        });

                    } else if (typeof _product.attributes == 'undefined') {
                        ProductModel.getProductAttributes(prod_id,
                                function(attributes) {
                                    _product.attributes = attributes;
                                    productsCache.put(prod_id, _product);
                                    callback(attributes);
                                });
                    }
                    else {
                        callback(_product.attributes);
                    }
                },
                /**
                 * 
                 * @param {type} prod_id
                 * @param {type} callback
                 * @returns {undefined}
                 */
                getProductOptions: function(prod_id, callback) {
                    var _product = productsCache.get(prod_id);
                    if (!_product) {
                        ProductModel.getProduct(prod_id, function(product) {
                            ProductModel.getProductOptions(prod_id,
                                    function(options) {
                                        product.options = options;
                                        productsCache.put(prod_id, product);
                                        callback(options);
                                    });
                        });

                    } else if (typeof _product.options == 'undefined') {
                        ProductModel.getProductOptions(prod_id,
                                function(options) {
                                    _product.options = options;
                                    productsCache.put(prod_id, _product);
                                    callback(options);
                                });
                    }
                    else {
                        callback(_product.options);
                    }
                },
                /**
                 * 
                 * @param {type} prod_id
                 * @param {type} callback
                 * @returns {undefined}
                 */
                getProductImages: function(prod_id, minHeight, callback) {
                    var _product = productsCache.get(prod_id);
                    if (!_product) {

                        ProductModel.getProduct(prod_id, function(product) {
                            ProductModel.getProductImages(prod_id, minHeight,
                                    function(images) {
                                        if (product != null) {
                                            product.images = images;
                                            productsCache.put(prod_id,
                                                    product);
                                            callback(images);
                                        }
                                        else
                                            callback(null);
                                    });
                        });

                    } else if (typeof _product.images == 'undefined') {

                        ProductModel.getProductImages(prod_id, minHeight,
                                function(images) {
                                    _product.images = images;
                                    productsCache.put(prod_id, _product);
                                    callback(images);
                                });
                    }
                    else {
                        callback(_product.images);
                    }
                }

            };

    return ProductService;
});