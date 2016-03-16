System.register([], function(exports_1, context_1) {
    "use strict";
    panelFactory.$inject = ["$timeout", "panelRoute"];
    var __moduleName = context_1 && context_1.id;
    function panelFactory($timeout, panelRoute) {
        var activeAnimationElement;
        var directive = {
            restrict: 'C',
            transclude: true,
            templateUrl: panelRoute.config.panelInnerTemplateUrl,
            link: link
        };
        function link(scope, element) {
            var parent = element.parent();
            scope.$watch('$active', function (newValue) {
                if (newValue) {
                    scrollVisible();
                }
            });
            function scrollVisible() {
                if (activeAnimationElement) {
                    activeAnimationElement.stop(true, false);
                }
                activeAnimationElement = parent;
                parent.animate({ scrollLeft: getScrollAmmount() }, 200, function () {
                    activeAnimationElement = null;
                });
            }
            function getScrollAmmount() {
                var scrollLeft = parent.scrollLeft();
                var parentWidth = parent.outerWidth();
                var panelWidth = claculateWidth();
                var prevSibling = element.prev();
                var offsetLeft = prevSibling.length === 0 ? 0 : (prevSibling.offset().left + prevSibling.outerWidth() - parent.offset().left) + scrollLeft;
                var visibleRight = offsetLeft + panelWidth;
                var scroll;
                if (scrollLeft > offsetLeft) {
                    scroll = offsetLeft;
                }
                else if (scrollLeft < (visibleRight - parentWidth)) {
                    scroll = visibleRight - parentWidth + 50;
                }
                else {
                    return;
                }
                return scroll;
            }
            function claculateWidth() {
                if (!element.is('.open-add')) {
                    return element.outerWidth();
                }
                var tmp = $('<div />')
                    .attr('class', element.attr('class'))
                    .removeClass('open-add')
                    .removeClass('open-add-active')
                    .appendTo(element.parent());
                var width = tmp.outerWidth();
                tmp.remove();
                return width;
            }
        }
        return directive;
    }
    return {
        setters:[],
        execute: function() {
            exports_1("default",angular.module('sliderizr.sitePanel', []).directive('sitePanel', panelFactory));
        }
    }
});
