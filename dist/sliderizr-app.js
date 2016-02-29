System.register(['angular', 'core-js/fn/array/find-index', 'core-js/fn/array/find', 'core-js/fn/array/from', 'core-js/fn/array/includes', 'core-js/fn/object/assign', 'core-js/fn/set', 'core-js/fn/string/includes', 'core-js/fn/string/starts-with', './providers/panelRoute.provider', './services/panel.service', './services/panelUrl.service', './directives/panel.directive', './directives/panelContainer.directive'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var angular_1, panelRoute_provider_1, panel_service_1, panelUrl_service_1, panel_directive_1, panelContainer_directive_1;
    return {
        setters:[
            function (angular_1_1) {
                angular_1 = angular_1_1;
            },
            function (_1) {},
            function (_2) {},
            function (_3) {},
            function (_4) {},
            function (_5) {},
            function (_6) {},
            function (_7) {},
            function (_8) {},
            function (panelRoute_provider_1_1) {
                panelRoute_provider_1 = panelRoute_provider_1_1;
            },
            function (panel_service_1_1) {
                panel_service_1 = panel_service_1_1;
            },
            function (panelUrl_service_1_1) {
                panelUrl_service_1 = panelUrl_service_1_1;
            },
            function (panel_directive_1_1) {
                panel_directive_1 = panel_directive_1_1;
            },
            function (panelContainer_directive_1_1) {
                panelContainer_directive_1 = panelContainer_directive_1_1;
            }],
        execute: function() {
            exports_1("default",angular_1.default.module('sliderizr', [
                'ngAnimate',
                panelRoute_provider_1.default.name,
                panel_service_1.default.name,
                panelUrl_service_1.default.name,
                panel_directive_1.default.name,
                panelContainer_directive_1.default.name
            ]));
        }
    }
});
