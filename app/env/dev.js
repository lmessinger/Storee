angular.module('st.app').constant('APP_CONFIG',{
    baseUrl: '//www.mayameirav.com/',
    defaultCategory: {id: 38, slug: 'collection', name: 'Collection'},
    magentoApiRest: '//www.mayameirav.com/magento/api/rest/',
    prevNextLimit: 25,
    productBasicDataLimit: 50,
    dataProvider: '',
    noBlock: 0,
    block:'block',
    cmsPage:'cmsPage',
    category:'category'
});

angular.module('st.app').config(['$logProvider', function($logProvider){
    $logProvider.debugEnabled(false);
}]);