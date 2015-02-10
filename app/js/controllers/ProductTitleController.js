'use strict';

/* Product Title Controller */

angular.module('st.app').controller("ProductTitleController", ['$rootScope',
    '$scope', '$element', '$document', '$window', 'APP_CONFIG', '$timeout',
    function($rootScope, $scope, $element, $document, $window, APP_CONFIG,
            $timeout) {

        $scope.isPosAdjusted = false;
        $scope.thumbOffset = "";

        var THUMB_LIST_HEIGHT = 60;
        var adjustingTitle = false;
        var shouldAdjustTitle = false;

        /**
         * Sets the bottom offset of product-title on the basis of category-thumblist
         * 
         * @param {type} blnShow
         * @param {type} bottomOffset
         * @param {type} bottomOffsetNum
         * @returns {undefined}
         */
        $scope.setTitleOffset = function(blnShow, bottomOffset,
                bottomOffsetNum) {
            if (blnShow) {

                $scope.isPosAdjusted = true;

                // bottom offset is in percentage 
                if (bottomOffset.indexOf("%") != -1) {
                    $element.css("bottom", bottomOffsetNum + 1 + "%");
                }
                else if (bottomOffset.indexOf("px") !=
                        -1) { // bottom offset is in pixels
                    $element.css("bottom", bottomOffsetNum +
                            THUMB_LIST_HEIGHT + "px");
                }
                else {
                    $element.css("bottom", bottomOffsetNum +
                            THUMB_LIST_HEIGHT + "px");
                }

            }
            else {

                $scope.isPosAdjusted = false;

                // bottom offset is in percentage
                if (bottomOffset.indexOf("%") != -1) {
                    $element.css("bottom", bottomOffsetNum - 1 + "%");
                }
                else if (bottomOffset.indexOf("px") !=
                        -1) { // bottom offset is in pixels
                    $element.css("bottom", bottomOffsetNum -
                            THUMB_LIST_HEIGHT + "px");
                }
                else { // Assume bottom offset is pixels
                    $element.css("bottom", bottomOffsetNum -
                            THUMB_LIST_HEIGHT + "px");
                }
            }
        }

        /**
         * description:
         * This method will be called when there need to displace description div.
         * When thumb list will be shown, description shall be moved above and wisevres.
         * If thumb list bottom offset is in % then we add 1% in its bottom offset.
         * If it is set in pixels then we add THUMB_LIST_HEIGHT pixcels in its bottom offset.
         * 
         * @param {type} blnShow
         * @returns {undefined}
         */

        $scope.adjustTitlePos = function(blnShow) {

            if (adjustingTitle)
            {
                shouldAdjustTitle = true;
                return;
            }

            var bottomOffset = $element.css('bottom');
            var bottomOffsetNum = parseInt(bottomOffset);

            adjustingTitle = true;
            $scope.setTitleOffset(blnShow, bottomOffset, bottomOffsetNum);

            $timeout(function() {
                if (bottomOffset.indexOf("%") === -1) {
                    adjustingTitle = false;
                    var beforeTimout = bottomOffsetNum;

                    bottomOffset = $element.css('bottom');
                    bottomOffsetNum = parseInt(bottomOffset);

                    if (Math.abs(beforeTimout - bottomOffsetNum) > 5) {
                        if (shouldAdjustTitle === true) {
                            $scope.setTitleOffset(!blnShow, bottomOffset,
                                    bottomOffsetNum);
                            shouldAdjustTitle = false;
                        }
                    }
                }

            }, 1500);

        };

        /**
         * descroption:
         * Watch thumbState value. If values was changed check if there is need to
         * displace description div. If thumb list and description not overlaping 
         * then no need to displace description div.
         */
        $scope.$watch('thumbState', function(n, o) {
            // For the time being stop title movement
            /*if ($scope.isOverlapped(n) == true || $scope.isPosAdjusted)
                $scope.adjustTitlePos(n);
            */
        });

        $scope.$watch('offset', function(n, o) {

            if (n != null)
                $scope.thumbOffset = n;

        });

        /**
         * description:
         * If thumb list and description have equal bottom offset it mean thumblist and 
         * descriptoin div are overlaying.
         * 
         * @param {type} blnShow
         * @returns {Boolean}
         */

        $scope.isOverlapped = function(blnShow) {

            //var thumbBottomOffset = angular.element('category-thumb-list').css('bottom');
            //var elm  = angular.element($document[0].querySelector('st_category_thumb'));
            var thumbBottomOffset = $scope.thumbOffset;

            var bottomOffset = $element.css('bottom');

            var thumbPos = $scope.getPosition(thumbBottomOffset);
            if (isNaN(thumbPos))
                thumbPos = $scope.getPosition("10%");
            var descPos = $scope.getPosition(bottomOffset);

            if (blnShow == true) {
                if (thumbPos + THUMB_LIST_HEIGHT > descPos)
                    return true;
                else
                    return false;
            }
            else
            {
                if (thumbPos - THUMB_LIST_HEIGHT > descPos)
                    return true;
                else
                    return false;
            }

        };

        /**
         * 
         * @returns {undefined}
         */

        $scope.getWindowHeight = function() {
            return $window.innerHeight;
        };

        /**
         * description:
         * 
         * If offset is in percentage then calcualte its absolute position wrt to 
         * screen height.
         * 
         * @param {type} offset
         * @returns {Number|@var;winHeight}
         */

        $scope.getPosition = function(offset) {

            var winHeight = $scope.getWindowHeight();

            if (offset.indexOf("%") != -1) {
                var h = (winHeight * parseInt(offset)) / 100;
                return h;
            }
            else {
                return parseInt(offset);
            }
        };

    }]);