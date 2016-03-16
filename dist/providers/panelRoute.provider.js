System.register(['angular'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var angular_1;
    var PanelRouteProvider, PanelRouteService;
    function factory() {
        return new PanelRouteProvider();
    }
    return {
        setters:[
            function (angular_1_1) {
                angular_1 = angular_1_1;
            }],
        execute: function() {
            PanelRouteProvider = (function () {
                function PanelRouteProvider() {
                    this.routes = {};
                    this.config = {
                        panelTemplateUrl: 'templates/sliderizr/panel.html',
                        panelInnerTemplateUrl: 'templates/sliderizr/panel-inner.html' };
                }
                PanelRouteProvider.prototype.when = function (name, route) {
                    this.routes[name] = angular_1.default.copy(route);
                    return this;
                };
                PanelRouteProvider.prototype.otherwise = function (a) {
                    var route = typeof a === 'string' ? { redirectTo: a } : a;
                    return this.when(null, route);
                };
                PanelRouteProvider.prototype.$get = function () {
                    return new PanelRouteService(this.routes, this.config);
                };
                return PanelRouteProvider;
            }());
            PanelRouteService = (function () {
                function PanelRouteService(routes, config) {
                    this.routes = routes;
                    this.config = config;
                }
                return PanelRouteService;
            }());
            exports_1("default",angular_1.default.module('sliderizr.panelRouteProvider', []).provider('panelRoute', function () { return new PanelRouteProvider(); }));
        }
    }
});
