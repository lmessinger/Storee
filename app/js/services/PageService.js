'use strict';

myApp.factory('Page', function() {
    var title = 'My App';
    return {
        title: function() {
            return title;
        },
        setTitle: function(newTitle) {
            title = newTitle
        }
    };
});