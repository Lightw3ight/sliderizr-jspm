System.register(['angular'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var angular_1;
    var PanelUrlService;
    return {
        setters:[
            function (angular_1_1) {
                angular_1 = angular_1_1;
            }],
        execute: function() {
            PanelUrlService = (function () {
                function PanelUrlService() {
                    this.pageDividerChar = '/';
                    this.queryIndicatorChar = ';';
                    this.queryDividerChar = ',';
                    this.queryEqualityChar = '=';
                }
                PanelUrlService.prototype.createUrl = function (panels) {
                    var _this = this;
                    var queryIndicatorAdded = false;
                    var url = '';
                    panels.forEach(function (panel) {
                        if (!panel.options.name) {
                            return;
                        }
                        url += _this.pageDividerChar;
                        url += panel.options.name;
                        queryIndicatorAdded = false;
                        for (var key in panel.options.params) {
                            if (panel.options.params.hasOwnProperty(key)) {
                                if (!queryIndicatorAdded) {
                                    url += _this.queryIndicatorChar;
                                    queryIndicatorAdded = true;
                                }
                                else {
                                    url += _this.queryDividerChar;
                                }
                                url += key + _this.queryEqualityChar + panel.options.params[key];
                            }
                        }
                    });
                    return url;
                };
                PanelUrlService.prototype.deserializeUrl = function (url) {
                    var _this = this;
                    var result = [];
                    var path = (url || this.getWindowLocation() || '').replace(/\\/g, this.pageDividerChar);
                    if (path.indexOf('/') === 0) {
                        path = path.substr(1);
                    }
                    if (!path) {
                        path = 'dashboard';
                    }
                    var pages = path.split(this.pageDividerChar);
                    var lastPage;
                    pages.forEach(function (pageString) {
                        var queryIndex = pageString.indexOf(_this.queryIndicatorChar);
                        var templatePath = pageString;
                        var params;
                        if (queryIndex > 0) {
                            templatePath = pageString.substr(0, queryIndex);
                            var paramPairs = pageString.substr(queryIndex + 1).split(_this.queryDividerChar);
                            params = _this.parseRouteParams(paramPairs);
                        }
                        var page = {
                            name: templatePath,
                            params: params || {}
                        };
                        result.push(page);
                        lastPage = page;
                    });
                    return result;
                };
                PanelUrlService.prototype.parseRouteParams = function (params) {
                    var _this = this;
                    var result = {};
                    params.forEach(function (paramString) {
                        var paramSplit = paramString.split(_this.queryEqualityChar);
                        result[paramSplit[0]] = paramSplit[1];
                    });
                    return result;
                };
                PanelUrlService.prototype.isUrlCurrent = function (url) {
                    return (this.getWindowLocation() === url);
                };
                PanelUrlService.prototype.getWindowLocation = function () {
                    var hash = window.location.hash;
                    if (hash.indexOf('#') >= 0) {
                        return hash.substr(1);
                    }
                    return hash;
                };
                return PanelUrlService;
            }());
            exports_1("default",angular_1.default
                .module('sliderizr.panelUrlService', [])
                .service('panelUrlService', PanelUrlService));
        }
    }
});
