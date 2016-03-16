/// <reference path="../../../typings/main.d.ts" />
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
                /*@ngInject*/
                PanelService.$inject = ["$rootScope", "$controller", "$compile", "panelRoute", "$q", "$animate", "$timeout", "panelUrlService", "$injector", "$sce", "$templateRequest"];
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
                    //immediately load all panels from the # path
                    this.loadPanelsFromPath();
                    //Listen to hash changes to update the panel layout
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
                /**
                 * Close a given panel and resolve the 'result' promise
                 * @param panelInstance Instance Instance of the panel to close
                 * @param result Optional result object to return with the 'result' promise
                 */
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
                    //Reconstruct arguments based on overloads
                    var panelOptions = typeof a === 'object' ? a : { name: a };
                    if (b && b.result) {
                        parent = b;
                    }
                    else {
                        panelOptions.params = b;
                        parent = c;
                    }
                    //If the panel is already open, set it to active
                    var existing = this.findExistingPanel(panelOptions, parent);
                    if (existing) {
                        this.setActive(existing.panelScope);
                        return existing.instance;
                    }
                    //Create the panel
                    var instance = this.createPanel(panelOptions, parent);
                    //When the panel is open, update the page's url
                    instance.opened.then(function () {
                        //Re enable animation in case it was disabled prior to opening (if there was already a child open to the given parent)
                        _this.$animate.enabled(true);
                        _this.updateUrl();
                        return null;
                    });
                    return instance;
                };
                /**
                 * Create a scope for a panel, this scope gives us some functions for interacting with the panel from our view
                 * @param panelInstance The instance object of the panel
                 * @param panelRoute The route that defines the panel
                 * @param title The initial title of the panel
                 * @param parent The panel's parent instance
                 * @returns {}
                 */
                PanelService.prototype.createPanelScope = function (panelInstance, panelRoute, title, parent) {
                    var _this = this;
                    //Create Scope (from parent scope if there is a parent)
                    var panelScope = this.$rootScope.$new();
                    panelScope.$close = function (result) { _this.close(panelInstance, result); };
                    panelScope.$dismiss = function (reason) { _this.dismiss(panelInstance, reason); };
                    panelScope.$setActive = function () { _this.setActive(panelScope, true); };
                    panelScope.$title = title || 'No Title';
                    panelScope.$active = false;
                    panelScope.$openChildPanel = function (name, routeParams) { _this.open(name, routeParams, panelInstance); };
                    panelScope.$panelSize = panelRoute.size || PanelSize_1.default.Large;
                    //Add the setTitle method to the instance now that we have a scope
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
                /**
                 * Create a panel instance.
                 * Panel instances are for use in the panel's controller and allow us to interact with the panel
                 * @param options Options defining the panel
                 * @param openedPromise A promise that is resolved when a panel has finished opening
                 * @param resultPromise A promise that is resolved when a panel is closed
                 */
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
                /**
                 * Create a panel controller
                 * @param panelRoute The panel route that defines the controller to be created
                 * @param panelInstance The instance of the panel to be used in the controller
                 * @param panelScope The scope of the panel
                 * @param resolvedLocals An object with local values that can be injected into the constructor of the controller
                 */
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
                /**
                 * Create a panel's DOM element
                 * @param contentTemplateUrl url to the template to be used for the content of the panel
                 * @param panelScope Panel's scope object
                 */
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
                /**
                 * Create and open a new panel
                 */
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
                    //Create panel instance (for injection into controllers)
                    var panelInstance = this.createPanelInstance(options, openedDeferred.promise, resultDeferred.promise);
                    //wait for all promises to complete
                    this.prepareToOpenPanel(route, options, parent).then(function (resolvedLocals) {
                        var panelScope = _this.createPanelScope(panelInstance, route, (options.title || route.title), parent);
                        //Set active immediately so the scroll animation happens in time with the panel slide animation
                        _this.setActive(panelScope);
                        //Create panel DOM element
                        _this.createPanelElement(route.templateUrl, panelScope).then(function (panelElement) {
                            //Create and set up controller if defined
                            if (route.controller) {
                                var ctrl = _this.createController(route, panelInstance, panelScope, resolvedLocals);
                                //In order for directives to be able to find the controller using the require attribute, we need to bind the controller to its respective element
                                panelElement.data('$' + route.controller + 'Controller', ctrl);
                            }
                            //Create an open panel object for managing the panel internally
                            var openPanel = {
                                deferred: resultDeferred,
                                instance: panelInstance,
                                panelScope: panelScope,
                                element: panelElement,
                                parent: _this.getPanelByInstance(parent)
                            };
                            _this.openPanels.push(openPanel);
                            //Add the panel to the DOM
                            angular_1.default.element('.panel-container').append(panelElement);
                            //Add the class 'open' with an animation to display the panel
                            _this.$animate.addClass(panelElement, 'open').then(function () {
                                openedDeferred.resolve(panelInstance);
                            });
                        });
                    });
                    return panelInstance;
                };
                /**
                 * Close a given panel and reject its 'result' promise
                 * @param panelInstance Instance of the panel to close
                 * @param reason Optional reason for dismissing the panel
                 */
                PanelService.prototype.dismiss = function (panelInstance, reason) {
                    var panel = this.getPanelByInstance(panelInstance);
                    this.closeBranch(panel).then(function () {
                        panel.deferred.reject(reason);
                    });
                };
                /**
                 * Set a given panel as active
                 * @param panelInstance Instance of the panel to set as active (defaults to the last panel if none is supplied
                 * @param immediate Set active immediately or set it in a timeout
                 */
                PanelService.prototype.setActive = function (panelScope, immediate) {
                    var _this = this;
                    if (this.setActivePromise) {
                        //Immediates should not be processed if a promise is in play
                        if (immediate) {
                            return;
                        }
                        //Cancel the current 'setActive' promise
                        this.$timeout.cancel(this.setActivePromise);
                        this.setActivePromise = null;
                    }
                    //Default to the last panel if none is supplied
                    if (!panelScope) {
                        panelScope = this.openPanels[this.openPanels.length - 1].panelScope;
                    }
                    var innerSetActive = function () {
                        _this.setActivePromise = null;
                        //Mark all panels as inactive
                        _this.openPanels.forEach(function (panel) { return panel.panelScope.$active = false; });
                        //Find the given panel and mark it as active
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
                        //Set active in a timeout to ensure it occurs after any 'onclick' event that occurs on the panel that may call setActive as well
                        this.setActivePromise = this.$timeout(innerSetActive, 100);
                    }
                };
                /**
                 * Close all open panels
                 */
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
                /**
                 * Resolves te route's resolve field and closes appropriate children
                 * Returns any locals loaded by the resolve function
                 * @param panelRoute The route to the panel to open
                 * @param parent The parent panel that is opening the new panel
                 * @returns {}
                 */
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
                    //If a parent is supplied, close its children, otherwise close all panels
                    if (parent) {
                        promises.push(this.closeChildren(this.openPanels.find(function (p) { return p.instance === parent; }), false));
                    }
                    else {
                        promises.push(this.closeAll());
                    }
                    return this.$q.all(promises).then(function (values) {
                        //Create a dictionary of resolved local values
                        var locals = {};
                        var ix = 0;
                        angular_1.default.forEach(resolve, function (value, key) {
                            locals[key] = values[ix++];
                        });
                        return locals;
                    });
                };
                /**
                 * Find an open panel that has the same name and params as a given panelOptions object
                 * @param options Options to search by
                 * @returns {}
                 */
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
                /**
                 * Compare two options objects to see if their names and params are equal
                 * @param o1 Options 1
                 * @param o2 Options 2
                 */
                PanelService.prototype.compareOptions = function (o1, o2) {
                    var key;
                    //Compare names
                    if (o1.name !== o2.name) {
                        return false;
                    }
                    //Compare params from options 1
                    for (key in o1.params) {
                        if (o1.params.hasOwnProperty(key) && o1.params[key] !== o2.params[key]) {
                            return false;
                        }
                    }
                    //Compare params from options 2
                    for (key in o2.params) {
                        if (o2.params.hasOwnProperty(key) && o1.params[key] !== o2.params[key]) {
                            return false;
                        }
                    }
                    return true;
                };
                /**
                 * Event handler for the window's hash change event
                 */
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
                /**
                 * De-serialize the url int panel options and create panels based on these options
                 */
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
                /**
                 * Close all child panels belonging to a given panel
                 * @param panel parent panel who's child panels are to be closed
                 * @param animate Allow animations or not (Usefull to prevent a double animation when closing one panel and opening another
                 */
                PanelService.prototype.closeChildren = function (panel, animate) {
                    var _this = this;
                    var deferred = this.$q.defer();
                    var children = this.getChildPanels(panel);
                    //A self executing function that will close all children until there are none left
                    var closeChild = function (panel) {
                        children.splice(0, 1);
                        _this.closeBranch(panel).then(function () {
                            //The child wasn't closed explicitly so we need to reject its promise
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
                    //Check that there are children first
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
                /**
                 * Close a panel and all of its child panels
                 * @param panel Panel to close
                 */
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
                /**
                 * Get all children of a given panel
                 * @param panel Panel to get children of
                 */
                PanelService.prototype.getChildPanels = function (panel) {
                    return this.openPanels.filter(function (p) { return p.parent === panel; });
                };
                /**
                 * Find a panel by its instance object
                 * @param panelInstance Panel instance to search by
                 */
                PanelService.prototype.getPanelByInstance = function (panelInstance) {
                    return this.openPanels.find(function (p) { return p.instance === panelInstance; });
                };
                /**
                 * Remove a panel from the dom and the open panel list
                 * @param panel
                 * @returns {}
                 */
                PanelService.prototype.removePanel = function (panel) {
                    var _this = this;
                    var deferred = this.$q.defer();
                    //need to investigate if there is any memory leak here
                    this.$animate.removeClass(panel.element, 'open').then(function () {
                        var index = _this.openPanels.indexOf(panel);
                        panel.element.remove();
                        _this.openPanels.splice(index, 1);
                        deferred.resolve();
                        panel.panelScope.$destroy();
                    });
                    return deferred.promise;
                };
                /**
                 * Update the window's hash with a serialized version of the current open panel's options
                 */
                PanelService.prototype.updateUrl = function () {
                    this.currentUrl = this.getOpenPanelUrl();
                    window.location.hash = this.currentUrl;
                };
                /**
                 * Serialize all the panel's options objects into a string for use in the url
                 */
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
