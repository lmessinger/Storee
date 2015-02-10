'use strict'

angular.module('st.app').service('ContentModel', ['$http', 'APP_CONFIG',
    '$log', function($http, APP_CONFIG, $log) {
        this.getStaticBlock = function(blockId, callback) {
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                url: APP_CONFIG.magentoApiRest + 'cms/static-block/' + blockId,
                cache: true
            }).
                    success(function(block, status, headers, config) {
                        callback(block);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });
        };
        this.getTopLinks = function(callback) {
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                url: APP_CONFIG.magentoApiRest + 'page/toplinks',
                cache: true
            }).
                    success(function(toplinks, status, headers, config) {
                        callback(toplinks);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });
        };
        this.getBlockHtmlUrl = function() {
            return APP_CONFIG.magentoApiRest + 'page/html/block/';
        };
        this.getBlockHtml = function(blockName, callback) {
            $http({
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                url: APP_CONFIG.magentoApiRest + 'page/html/block/' +
                        blockName,
                cache: true
            }).
                    success(function(block, status, headers, config) {
                        callback(block);
                    }).
                    error(function(data, status, headers, config) {
                        $log.error(data);
                        callback(null);
                    });
        };
    }]);