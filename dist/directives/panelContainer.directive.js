System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    /*@ngInject*/
    function factory() {
        var directive = {
            restrict: 'C',
            link: link
        };
        function link() {
        }
        return directive;
    }
    return {
        setters:[],
        execute: function() {
            exports_1("default",angular.module('sliderizr.panelContainer', [])
                .directive('panelContainer', factory));
        }
    }
});
