System.register(['angular', '../models/PanelSize'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var angular_1, PanelSize_1;
    var PanelService;
    return {
        setters:[
            function (angular_1_1) {
                angular_1 = angular_1_1;
            },
            function (PanelSize_1_1) {
                PanelSize_1 = PanelSize_1_1;
            }],
        execute: function() {
            PanelService = (function () {
                function PanelService($rootScope, $controller, $compile, panelRoute, $q, $animate, $timeout, panelUrlService, $injector, $sce, $templateRequest) {
                    var _this = this;
                    this.$rootScope = $rootScope;
                    this.$controller = $controller;
                    this.$compile = $compile;
                    this.panelRoute = panelRoute;
                    this.$q = $q;
                    this.$animate = $animate;
                    this.$timeout = $timeout;
                    this.panelUrlService = panelUrlService;
                    this.$injector = $injector;
                    this.$sce = $sce;
                    this.$templateRequest = $templateRequest;
                    this.openPanels = [];
                    this.loadPanelsFromPath();
                    $(window).on('hashchange', function (ev) {
                        $rootScope.$apply(function () {
                            _this.onLocationChanged();
                        });
                    });
                }
                PanelService.prototype.getActivePanel = function () {
                    var panel = this.openPanels.find(function (p) { return p.panelScope.$active; });
                    return panel.instance;
                };
                PanelService.prototype.getAllOpenPanels = function () {
                    return this.openPanels.map(function (p) { return p.instance; });
                };
                PanelService.prototype.close = function (panelInstance, result) {
                    var _this = this;
                    var panel = this.getPanelByInstance(panelInstance);
                    this.closeBranch(panel).then(function () {
                        _this.updateUrl();
                        _this.setActive();
                        panel.deferred.resolve(result);
                        return null;
                    });
                };
                PanelService.prototype.open = function (a, b, c) {
                    var _this = this;
                    var parent;
                    var panelOptions = typeof a === 'object' ? a : { name: a };
                    if (b && b.result) {
                        parent = b;
                    }
                    else {
                        panelOptions.params = b;
                        parent = c;
                    }
                    var existing = this.findExistingPanel(panelOptions, parent);
                    if (existing) {
                        this.setActive(existing.panelScope);
                        return existing.instance;
                    }
                    var instance = this.createPanel(panelOptions, parent);
                    instance.opened.then(function () {
                        _this.$animate.enabled(true);
                        _this.updateUrl();
                        return null;
                    });
                    return instance;
                };
                PanelService.prototype.createPanelScope = function (panelInstance, panelRoute, title, parent) {
                    var _this = this;
                    var panelScope = this.$rootScope.$new();
                    panelScope.$close = function (result) { _this.close(panelInstance, result); };
                    panelScope.$dismiss = function (reason) { _this.dismiss(panelInstance, reason); };
                    panelScope.$setActive = function () { _this.setActive(panelScope, true); };
                    panelScope.$title = title || 'No Title';
                    panelScope.$active = false;
                    panelScope.$openChildPanel = function (name, routeParams) { _this.open(name, routeParams, panelInstance); };
                    panelScope.$panelSize = panelRoute.size || PanelSize_1.default.Large;
                    panelInstance.setTitle = function (title, allowHtml) {
                        if (allowHtml) {
                            panelScope.$title = _this.$sce.trustAsHtml(title);
                        }
                        else {
                            panelScope.$title = title;
                        }
                    };
                    return panelScope;
                };
                PanelService.prototype.createPanelInstance = function (options, openedPromise, resultPromise) {
                    var _this = this;
                    var panelInstance = {
                        opened: openedPromise,
                        result: resultPromise,
                        options: options,
                        close: function (result) { _this.close(panelInstance, result); },
                        dismiss: function (reason) { _this.dismiss(panelInstance, reason); },
                        setActive: function () { _this.setActive(panelInstance); },
                        setTitle: function () { },
                        openChild: function (a, b) { return _this.open(a, b || panelInstance, panelInstance); },
                        beforeClose: function () { return _this.$q.when(); }
                    };
                    return panelInstance;
                };
                PanelService.prototype.createController = function (panelRoute, panelInstance, panelScope, resolvedLocals) {
                    var controllerLocals = angular_1.default.extend({
                        $panelInstance: panelInstance,
                        $scope: panelScope
                    }, resolvedLocals);
                    var controller = this.$controller(panelRoute.controller, controllerLocals);
                    if (panelRoute.controllerAs) {
                        panelScope[panelRoute.controllerAs] = controller;
                    }
                    return controller;
                };
                PanelService.prototype.createPanelElement = function (contentTemplateUrl, panelScope) {
                    var _this = this;
                    var templateUrl = this.$sce.getTrustedResourceUrl(contentTemplateUrl);
                    var panelTemplateUrl = this.$sce.getTrustedResourceUrl(this.panelRoute.config.panelTemplateUrl);
                    return this.$q.all([this.$templateRequest(panelTemplateUrl), this.$templateRequest(templateUrl)]).then(function (values) {
                        var panelElement = angular_1.default
                            .element(values[0])
                            .html(values[1]);
                        return _this.$compile(panelElement)(panelScope);
                    });
                };
                PanelService.prototype.createPanel = function (options, parent) {
                    var _this = this;
                    var resultDeferred = this.$q.defer();
                    var openedDeferred = this.$q.defer();
                    var route;
                    if (options.name) {
                        route = this.panelRoute.routes[options.name] || this.panelRoute.routes['null'];
                        if (route && route.redirectTo) {
                            options = typeof route.redirectTo === 'string' ? { name: route.redirectTo } : route.redirectTo;
                            route = this.panelRoute.routes[options.name];
                        }
                        if (!route) {
                            throw new Error('No route found with the name "' + options.name + '"');
                        }
                    }
                    else {
                        route = options;
                    }
                    var panelInstance = this.createPanelInstance(options, openedDeferred.promise, resultDeferred.promise);
                    this.prepareToOpenPanel(route, options, parent).then(function (resolvedLocals) {
                        var panelScope = _this.createPanelScope(panelInstance, route, (options.title || route.title), parent);
                        _this.setActive(panelScope);
                        _this.createPanelElement(route.templateUrl, panelScope).then(function (panelElement) {
                            if (route.controller) {
                                var ctrl = _this.createController(route, panelInstance, panelScope, resolvedLocals);
                                panelElement.data('$' + route.controller + 'Controller', ctrl);
                            }
                            var openPanel = {
                                deferred: resultDeferred,
                                instance: panelInstance,
                                panelScope: panelScope,
                                element: panelElement,
                                parent: _this.getPanelByInstance(parent)
                            };
                            _this.openPanels.push(openPanel);
                            angular_1.default.element('.panel-container').append(panelElement);
                            _this.$animate.addClass(panelElement, 'open').then(function () {
                                openedDeferred.resolve(panelInstance);
                            });
                        });
                    });
                    return panelInstance;
                };
                PanelService.prototype.dismiss = function (panelInstance, reason) {
                    var panel = this.getPanelByInstance(panelInstance);
                    this.closeBranch(panel).then(function () {
                        panel.deferred.reject(reason);
                    });
                };
                PanelService.prototype.setActive = function (panelScope, immediate) {
                    var _this = this;
                    if (this.setActivePromise) {
                        if (immediate) {
                            return;
                        }
                        this.$timeout.cancel(this.setActivePromise);
                        this.setActivePromise = null;
                    }
                    if (!panelScope) {
                        panelScope = this.openPanels[this.openPanels.length - 1].panelScope;
                    }
                    var innerSetActive = function () {
                        _this.setActivePromise = null;
                        _this.openPanels.forEach(function (panel) { return panel.panelScope.$active = false; });
                        if (panelScope && !panelScope.$openChildPanel) {
                            var p = _this.getPanelByInstance(panelScope);
                            panelScope = p ? p.panelScope : null;
                        }
                        if (panelScope) {
                            panelScope.$active = true;
                        }
                    };
                    if (immediate) {
                        innerSetActive();
                    }
                    else {
                        this.setActivePromise = this.$timeout(innerSetActive, 100);
                    }
                };
                PanelService.prototype.closeAll = function () {
                    var deferred = this.$q.defer();
                    if (this.openPanels.length > 0) {
                        var panel = this.openPanels[0];
                        this.closeBranch(panel).then(function () {
                            panel.deferred.reject();
                            deferred.resolve();
                        }, deferred.reject);
                    }
                    else {
                        deferred.resolve();
                    }
                    return deferred.promise;
                };
                PanelService.prototype.prepareToOpenPanel = function (panelRoute, options, parent) {
                    var _this = this;
                    var promises = [];
                    var resolve = {};
                    if (panelRoute.resolve || options.resolve) {
                        resolve = angular_1.default.extend({}, panelRoute.resolve || {}, options.resolve || {});
                        angular_1.default.forEach(resolve, function (value, key) {
                            promises.push(angular_1.default.isString(value) ? _this.$injector.get(value) : _this.$injector.invoke(value, null, key));
                        });
                    }
                    if (parent) {
                        promises.push(this.closeChildren(this.openPanels.find(function (p) { return p.instance === parent; }), false));
                    }
                    else {
                        promises.push(this.closeAll());
                    }
                    return this.$q.all(promises).then(function (values) {
                        var locals = {};
                        var ix = 0;
                        angular_1.default.forEach(resolve, function (value, key) {
                            locals[key] = values[ix++];
                        });
                        return locals;
                    });
                };
                PanelService.prototype.findExistingPanel = function (options, parent) {
                    var _this = this;
                    if (!options.name) {
                        return null;
                    }
                    var parentPanel = this.getPanelByInstance(parent);
                    return this.openPanels.find(function (p) {
                        return ((options === p.instance.options || _this.compareOptions(options, p.instance.options)) && p.parent == parentPanel);
                    });
                };
                PanelService.prototype.compareOptions = function (o1, o2) {
                    var key;
                    if (o1.name !== o2.name) {
                        return false;
                    }
                    for (key in o1.params) {
                        if (o1.params.hasOwnProperty(key) && o1.params[key] !== o2.params[key]) {
                            return false;
                        }
                    }
                    for (key in o2.params) {
                        if (o2.params.hasOwnProperty(key) && o1.params[key] !== o2.params[key]) {
                            return false;
                        }
                    }
                    return true;
                };
                PanelService.prototype.onLocationChanged = function () {
                    var _this = this;
                    if (!this.panelUrlService.isUrlCurrent(this.currentUrl)) {
                        this.closeAll().then(function () {
                            _this.loadPanelsFromPath();
                        }, function () {
                            _this.updateUrl();
                        });
                    }
                };
                PanelService.prototype.loadPanelsFromPath = function () {
                    var _this = this;
                    this.$animate.enabled(false);
                    var panels = this.panelUrlService.deserializeUrl();
                    var load = function (index, last) {
                        var panel = panels[index];
                        _this.createPanel({ name: panel.name, params: panel.params }, last).opened.then(function (instance) {
                            if (index + 1 < panels.length) {
                                load(index + 1, instance);
                            }
                            else {
                                _this.$animate.enabled(true);
                                _this.setActive();
                                _this.updateUrl();
                            }
                        });
                    };
                    load(0, null);
                };
                PanelService.prototype.closeChildren = function (panel, animate) {
                    var _this = this;
                    var deferred = this.$q.defer();
                    var children = this.getChildPanels(panel);
                    var closeChild = function (panel) {
                        children.splice(0, 1);
                        _this.closeBranch(panel).then(function () {
                            panel.deferred.reject();
                            if (children.length > 0) {
                                closeChild(children[0]);
                            }
                            else {
                                deferred.resolve();
                            }
                        }, function () {
                            deferred.reject();
                        });
                    };
                    if (children.length > 0) {
                        if (!animate) {
                        }
                        closeChild(children[0]);
                    }
                    else {
                        deferred.resolve();
                    }
                    return deferred.promise;
                };
                PanelService.prototype.closeBranch = function (panel) {
                    var _this = this;
                    var deferred = this.$q.defer();
                    this.closeChildren(panel).then(function () {
                        panel.instance.beforeClose().then(function () {
                            _this.removePanel(panel).then(function () {
                                deferred.resolve();
                            });
                        }, function () {
                            deferred.reject();
                        });
                    }, function () {
                        deferred.reject();
                    });
                    return deferred.promise;
                };
                PanelService.prototype.getChildPanels = function (panel) {
                    return this.openPanels.filter(function (p) { return p.parent === panel; });
                };
                PanelService.prototype.getPanelByInstance = function (panelInstance) {
                    return this.openPanels.find(function (p) { return p.instance === panelInstance; });
                };
                PanelService.prototype.removePanel = function (panel) {
                    var _this = this;
                    var deferred = this.$q.defer();
                    this.$animate.removeClass(panel.element, 'open').then(function () {
                        var index = _this.openPanels.indexOf(panel);
                        panel.element.remove();
                        _this.openPanels.splice(index, 1);
                        deferred.resolve();
                        panel.panelScope.$destroy();
                    });
                    return deferred.promise;
                };
                PanelService.prototype.updateUrl = function () {
                    this.currentUrl = this.getOpenPanelUrl();
                    window.location.hash = this.currentUrl;
                };
                PanelService.prototype.getOpenPanelUrl = function () {
                    return this.panelUrlService.createUrl(this.openPanels.map(function (panel) { return panel.instance; }));
                };
                return PanelService;
            }());
            exports_1("PanelService", PanelService);
            exports_1("default",angular_1.default
                .module('sliderizr.panelService', [])
                .service('panelService', PanelService));
        }
    }
});
