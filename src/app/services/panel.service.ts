/// <reference path="../../../typings/main.d.ts" />

import angular from 'angular';

import IPanelService from 'IPanelService';
import IOpenPanel from '../models/IOpenPanel';
import IPanelRouteService from '../providers/IPanelRouteService';
import IPanelUrlService from 'IPanelUrlService';
import {IPanelInstance} from '../models/IPanelInstance';
import IRouteParams from '../models/IRouteParams';
import {IPanelOptions} from '../models/IPanelOptions';
import IPanelRoute from '../models/IPanelRoute';
import IPanelScope from '../models/IPanelScope';
import PanelSize from '../models/PanelSize';

export class PanelService implements IPanelService {
	private openPanels: IOpenPanel[];
	private currentUrl: string;
	private setActivePromise: ng.IPromise<void>;
	
	/*@ngInject*/
	constructor(private $rootScope: ng.IRootScopeService,
		private $controller: ng.IControllerService,
		private $compile: ng.ICompileService,
		private panelRoute: IPanelRouteService,
		private $q: ng.IQService,
		private $animate: ng.animate.IAnimateService,
		private $timeout: ng.ITimeoutService,
		private panelUrlService: IPanelUrlService,
		private $injector: ng.auto.IInjectorService, private $sce: ng.ISCEService, private $templateRequest: ng.ITemplateRequestService) {
		this.openPanels = [];

		//immediately load all panels from the # path
		this.loadPanelsFromPath();

		//Listen to hash changes to update the panel layout
		$(window).on('hashchange', (ev: any) => {
			$rootScope.$apply(() => {
				this.onLocationChanged();
			});
		});
	}

	getActivePanel(): IPanelInstance<IRouteParams> {
		var panel = this.openPanels.find(p => p.panelScope.$active);

		return panel.instance;
	}

	getAllOpenPanels(): IPanelInstance<IRouteParams>[] {
		return this.openPanels.map(p => p.instance);
	}

	/**
	 * Close a given panel and resolve the 'result' promise
	 * @param panelInstance Instance Instance of the panel to close
	 * @param result Optional result object to return with the 'result' promise
	 */
	close(panelInstance: IPanelInstance<IRouteParams>, result: any) {
		var panel = this.getPanelByInstance(panelInstance);

		this.closeBranch(panel).then(() => {
			this.updateUrl();
			this.setActive();
			panel.deferred.resolve(result);
			return null;
		});
	}

	/**
	 * Open a new panel
	 * @param name Name of the panel to open (Must match a route)
	 * @param parent The parent panel that is opening the new panel (Optional)
	 * @returns {}
	 */
	open(name: string, parent?: IPanelInstance<IRouteParams>): IPanelInstance<IRouteParams>;

	/**
	 * Open a new panel
	 * @param name Name of the panel to open (Must match a route)
	 * @param parent The parent panel that is opening the new panel (Optional)
	 * @returns {}
	 */
	open<T extends IRouteParams>(name: string, parent?: IPanelInstance<IRouteParams>): IPanelInstance<T>;

	/**
	 * Open a new panel
	 * @param name Name of the panel to open (Must match a route)
	 * @param routeParams Optional parameters to load the panel with (think querystring)
	 * @param parent The parent panel that is opening the new panel (Optional)
	 * @returns {}
	 */
	open(name: string, routeParams: IRouteParams, parent?: IPanelInstance<IRouteParams>): IPanelInstance<IRouteParams>;

	/**
	 * Open a new panel
	 * @param name Name of the panel to open (Must match a route)
	 * @param routeParams Optional parameters to load the panel with (think querystring)
	 * @param parent The parent panel that is opening the new panel (Optional)
	 * @returns {}
	 */
	open<T extends IRouteParams>(name: string, routeParams: IRouteParams, parent?: IPanelInstance<IRouteParams>): IPanelInstance<T>;

	/**
	 * Open a new panel
	 * @param options Options to use to configure the panel
	 * @param parent The parent panel that is opening the new panel (Optional)
	 * @returns {} 
	 */
	open(options: IPanelOptions<IRouteParams>, parent?: IPanelInstance<IRouteParams>): IPanelInstance<IRouteParams>;

	/**
	 * Open a new panel
	 * @param options Options to use to configure the panel
	 * @param parent The parent panel that is opening the new panel (Optional)
	 * @returns {} 
	 */
	open<T extends IRouteParams>(options: IPanelOptions<IRouteParams>, parent?: IPanelInstance<IRouteParams>): IPanelInstance<T>;

	open(a: any, b?: any, c?: any): any {
		var parent: IPanelInstance<IRouteParams>;

		//Reconstruct arguments based on overloads
		var panelOptions = typeof a === 'object' ? <IPanelOptions<IRouteParams>>a : <IPanelOptions<IRouteParams>>{ name: a };

		if (b && (<IPanelInstance<IRouteParams>>b).result) { //Check for a well known property on b to determine if its a panelInstance or not
			parent = b;
		} else {
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
		instance.opened.then(() => {
			//Re enable animation in case it was disabled prior to opening (if there was already a child open to the given parent)
			this.$animate.enabled(true);
			this.updateUrl();
			return null;
		});

		return instance;
	}

	/**
	 * Create a scope for a panel, this scope gives us some functions for interacting with the panel from our view
	 * @param panelInstance The instance object of the panel
	 * @param panelRoute The route that defines the panel
	 * @param title The initial title of the panel
	 * @param parent The panel's parent instance
	 * @returns {}
	 */
	private createPanelScope(panelInstance: IPanelInstance<IRouteParams>, panelRoute: IPanelRoute, title: string, parent?: IPanelInstance<IRouteParams>): IPanelScope {
		//Create Scope (from parent scope if there is a parent)
		var panelScope = <IPanelScope>this.$rootScope.$new();
		panelScope.$close = result => { this.close(panelInstance, result); };
		panelScope.$dismiss = reason => { this.dismiss(panelInstance, reason); };
		panelScope.$setActive = () => { this.setActive(panelScope, true); };
		panelScope.$title = title || 'No Title';
		panelScope.$active = false;
		panelScope.$openChildPanel = (name: string, routeParams?: IRouteParams) => { this.open(name, routeParams, panelInstance); };
		panelScope.$panelSize = panelRoute.size || PanelSize.Large;

		//Add the setTitle method to the instance now that we have a scope
		panelInstance.setTitle = (title, allowHtml) => {
			if (allowHtml) {
				panelScope.$title = this.$sce.trustAsHtml(title);
			} else {
				panelScope.$title = title;
			}
		};

		return panelScope;
	}

	/**
	 * Create a panel instance.
	 * Panel instances are for use in the panel's controller and allow us to interact with the panel
	 * @param options Options defining the panel
	 * @param openedPromise A promise that is resolved when a panel has finished opening
	 * @param resultPromise A promise that is resolved when a panel is closed
	 */
	private createPanelInstance(options: IPanelOptions<IRouteParams>, openedPromise: ng.IPromise<IPanelInstance<IRouteParams>>, resultPromise: ng.IPromise<any>): IPanelInstance<IRouteParams> {
		var panelInstance = <IPanelInstance<IRouteParams>>{
			opened: openedPromise,
			result: resultPromise,
			options: options,
			close: (result: any) => { this.close(panelInstance, result); },
			dismiss: (reason: any) => { this.dismiss(panelInstance, reason); },
			setActive: () => { this.setActive(panelInstance); },
			setTitle: () => { },
			openChild: (a: any, b?: any) => { return this.open(a, b || panelInstance, panelInstance); },
			beforeClose: () => { return this.$q.when(); }
		};

		return panelInstance;
	}

	/**
	 * Create a panel controller
	 * @param panelRoute The panel route that defines the controller to be created
	 * @param panelInstance The instance of the panel to be used in the controller
	 * @param panelScope The scope of the panel
	 * @param resolvedLocals An object with local values that can be injected into the constructor of the controller
	 */
	private createController(panelRoute: IPanelRoute, panelInstance: IPanelInstance<IRouteParams>, panelScope: IPanelScope, resolvedLocals: any): any {
		var controllerLocals = angular.extend(
			{
				$panelInstance: panelInstance,
				$scope: panelScope
			}, resolvedLocals);

		var controller = this.$controller(panelRoute.controller, controllerLocals);
		if (panelRoute.controllerAs) {
			panelScope[panelRoute.controllerAs] = controller;
		}
		return controller;
	}

	/**
	 * Create a panel's DOM element
	 * @param contentTemplateUrl url to the template to be used for the content of the panel
	 * @param panelScope Panel's scope object
	 */
	private createPanelElement(contentTemplateUrl: string, panelScope: IPanelScope): ng.IPromise<ng.IAugmentedJQuery> {
		var templateUrl = this.$sce.getTrustedResourceUrl(contentTemplateUrl);
		var panelTemplateUrl = this.$sce.getTrustedResourceUrl(this.panelRoute.config.panelTemplateUrl);

		return this.$q.all([this.$templateRequest(panelTemplateUrl), this.$templateRequest(templateUrl)]).then((values: string[]) => {
			var panelElement = angular
				.element(values[0])
				.html(values[1]);

			return this.$compile(panelElement)(panelScope);
		});
	}

	/**
	 * Create and open a new panel
	 */
	private createPanel(options: IPanelOptions<IRouteParams>, parent?: IPanelInstance<IRouteParams>): IPanelInstance<IRouteParams> {
		var resultDeferred = this.$q.defer();
		var openedDeferred = this.$q.defer<IPanelInstance<IRouteParams>>();
		var route;

		if (options.name) {
			route = this.panelRoute.routes[options.name] || this.panelRoute.routes['null'];

			if (route && route.redirectTo) {
				options = typeof route.redirectTo === 'string' ? <IPanelOptions<IRouteParams>>{ name: route.redirectTo } : <IPanelOptions<IRouteParams>>route.redirectTo;
				route = this.panelRoute.routes[options.name];
			}

			if (!route) {
				throw new Error('No route found with the name "' + options.name + '"');
			}
		} else {
			route = options;
		}

		//Create panel instance (for injection into controllers)
		var panelInstance = this.createPanelInstance(options, openedDeferred.promise, resultDeferred.promise);

		//wait for all promises to complete
		this.prepareToOpenPanel(route, options, parent).then((resolvedLocals) => {
			var panelScope = this.createPanelScope(panelInstance, route, (options.title || route.title), parent);

			//Set active immediately so the scroll animation happens in time with the panel slide animation
			this.setActive(panelScope);

			//Create panel DOM element
			this.createPanelElement(route.templateUrl, panelScope).then((panelElement) => {
				//Create and set up controller if defined
				if (route.controller) {
					var ctrl = this.createController(route, panelInstance, panelScope, resolvedLocals);

					//In order for directives to be able to find the controller using the require attribute, we need to bind the controller to its respective element
					panelElement.data('$' + route.controller + 'Controller', ctrl)
				}

				//Create an open panel object for managing the panel internally
				var openPanel = <IOpenPanel>{
					deferred: resultDeferred,
					instance: panelInstance,
					panelScope: panelScope,
					element: panelElement,
					parent: this.getPanelByInstance(parent)
				};
				this.openPanels.push(openPanel);

				//Add the panel to the DOM
				angular.element('.panel-container').append(panelElement);

				//Add the class 'open' with an animation to display the panel
				this.$animate.addClass(panelElement, 'open').then(() => {
					openedDeferred.resolve(panelInstance);
				});
			});
		});

		return panelInstance;
	}

	/**
	 * Close a given panel and reject its 'result' promise
	 * @param panelInstance Instance of the panel to close
	 * @param reason Optional reason for dismissing the panel
	 */
	private dismiss(panelInstance: IPanelInstance<IRouteParams>, reason?: any) {
		var panel = this.getPanelByInstance(panelInstance);

		this.closeBranch(panel).then(() => {
			panel.deferred.reject(reason);
		});
	}

	/**
	 * Set a given panel as active
	 * @param panelInstance Instance of the panel to set as active (defaults to the last panel if none is supplied
	 * @param immediate Set active immediately or set it in a timeout
	 */
	private setActive(panelScope?: IPanelInstance<IRouteParams> | IPanelScope, immediate?: boolean) {
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

		var innerSetActive = () => {
			this.setActivePromise = null;

			//Mark all panels as inactive
			this.openPanels.forEach(panel => panel.panelScope.$active = false);

			//Find the given panel and mark it as active
			if (panelScope && !(<IPanelScope>panelScope).$openChildPanel) {
				var p = this.getPanelByInstance(<IPanelInstance<IRouteParams>>panelScope);
				panelScope = p ? p.panelScope : null;
			}

			if (panelScope) {
				(<IPanelScope>panelScope).$active = true;
			}
		};

		if (immediate) {
			innerSetActive();
		} else {
			//Set active in a timeout to ensure it occurs after any 'onclick' event that occurs on the panel that may call setActive as well
			this.setActivePromise = this.$timeout(innerSetActive, 100);
		}
	}

	/**
	 * Close all open panels
	 */
	private closeAll(): ng.IPromise<any> {
		var deferred = this.$q.defer<any>();

		if (this.openPanels.length > 0) {
			var panel = this.openPanels[0];
			this.closeBranch(panel).then(() => {
				panel.deferred.reject();
				deferred.resolve();
			}, deferred.reject);
		}
		else {
			deferred.resolve();
		}

		return deferred.promise;
	}

	/**
	 * Resolves te route's resolve field and closes appropriate children
	 * Returns any locals loaded by the resolve function
	 * @param panelRoute The route to the panel to open
	 * @param parent The parent panel that is opening the new panel
	 * @returns {}
	 */
	private prepareToOpenPanel(panelRoute: IPanelRoute, options: IPanelOptions<IRouteParams>, parent?: IPanelInstance<IRouteParams>): ng.IPromise<any> {
		var promises: ng.IPromise<any>[] = [];
		var resolve = {};

		if (panelRoute.resolve || options.resolve) {
			resolve = angular.extend({}, panelRoute.resolve || {}, options.resolve || {});

			angular.forEach(resolve, (value, key) => {
				promises.push(angular.isString(value) ? this.$injector.get(value) : this.$injector.invoke(value, null, key));
			});
		}

		//If a parent is supplied, close its children, otherwise close all panels
		if (parent) {
			promises.push(this.closeChildren(this.openPanels.find(p => p.instance === parent), false));
		} else {
			promises.push(this.closeAll());
		}

		return this.$q.all(promises).then((values) => {
			//Create a dictionary of resolved local values
			var locals = {};
			var ix = 0;
			angular.forEach(resolve, (value, key) => {
				locals[key] = values[ix++];
			});
			return locals;
		});
	}

	/**
	 * Find an open panel that has the same name and params as a given panelOptions object
	 * @param options Options to search by
	 * @returns {}
	 */
	private findExistingPanel(options: IPanelOptions<IRouteParams>, parent?: IPanelInstance<IRouteParams>): IOpenPanel {
		if (!options.name) {
			return null;
		}

		var parentPanel = this.getPanelByInstance(parent);

		return this.openPanels.find(p => {
			return ((options === p.instance.options || this.compareOptions(options, p.instance.options)) && p.parent == parentPanel);
		});
	}

	/**
	 * Compare two options objects to see if their names and params are equal
	 * @param o1 Options 1
	 * @param o2 Options 2
	 */
	private compareOptions(o1: IPanelOptions<IRouteParams>, o2: IPanelOptions<IRouteParams>): boolean {
		var key: string;

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
	}

	/**
	 * Event handler for the window's hash change event
	 */
	private onLocationChanged() {
		if (!this.panelUrlService.isUrlCurrent(this.currentUrl)) {
			this.closeAll().then(() => {
				this.loadPanelsFromPath();
			}, () => {
				this.updateUrl()
			});
		}
	}

	/**
	 * De-serialize the url int panel options and create panels based on these options
	 */
	private loadPanelsFromPath() {
		this.$animate.enabled(false);
		var panels = this.panelUrlService.deserializeUrl();

		var load = (index, last: IPanelInstance<IRouteParams>) => {
			var panel = panels[index];
			this.createPanel(<IPanelOptions<IRouteParams>>{ name: panel.name, params: panel.params }, last).opened.then((instance) => {
				if (index + 1 < panels.length) {
					load(index + 1, instance);
				} else {
					this.$animate.enabled(true);
					this.setActive();
					this.updateUrl();
				}
			});
		};

		load(0, null);
	}

	/**
	 * Close all child panels belonging to a given panel
	 * @param panel parent panel who's child panels are to be closed
	 * @param animate Allow animations or not (Usefull to prevent a double animation when closing one panel and opening another
	 */
	private closeChildren(panel: IOpenPanel, animate?: boolean): ng.IPromise<void> {
		var deferred = this.$q.defer<void>();
		var children = this.getChildPanels(panel);

		//A self executing function that will close all children until there are none left
		var closeChild = (panel: IOpenPanel) => {
			children.splice(0, 1);
			this.closeBranch(panel).then(() => {
				//The child wasn't closed explicitly so we need to reject its promise
				panel.deferred.reject();

				if (children.length > 0) {
					closeChild(children[0]);
				} else {
					deferred.resolve();
				}
			}, () => {
				deferred.reject();
			});
		};

		//Check that there are children first
		if (children.length > 0) {
			if (!animate) {
				//this.$animate.enabled(false);
			}
			closeChild(children[0]);
		} else {
			deferred.resolve();
		}

		return deferred.promise;
	}

	/**
	 * Close a panel and all of its child panels
	 * @param panel Panel to close
	 */
	private closeBranch(panel: IOpenPanel): ng.IPromise<void> {
		var deferred = this.$q.defer<void>();

		this.closeChildren(panel).then(() => {
			panel.instance.beforeClose().then(() => {
				this.removePanel(panel).then(() => {
					deferred.resolve();
				});
			}, () => {
				deferred.reject();
			});
		}, () => {
			deferred.reject();
		});

		return deferred.promise;
	}

	/**
	 * Get all children of a given panel
	 * @param panel Panel to get children of
	 */
	private getChildPanels(panel: IOpenPanel): IOpenPanel[] {
		return this.openPanels.filter(p => p.parent === panel);
	}

	/**
	 * Find a panel by its instance object
	 * @param panelInstance Panel instance to search by
	 */
	private getPanelByInstance(panelInstance: IPanelInstance<IRouteParams>): IOpenPanel {
		return this.openPanels.find(p => p.instance === panelInstance);
	}

	/**
	 * Remove a panel from the dom and the open panel list
	 * @param panel
	 * @returns {}
	 */
	private removePanel(panel: IOpenPanel): ng.IPromise<void> {
		var deferred = this.$q.defer<void>();

		//need to investigate if there is any memory leak here
		this.$animate.removeClass(panel.element, 'open').then(() => {
			var index = this.openPanels.indexOf(panel);
			panel.element.remove();
			this.openPanels.splice(index, 1);
			deferred.resolve();
			panel.panelScope.$destroy();
		});

		return deferred.promise;
	}

	/**
	 * Update the window's hash with a serialized version of the current open panel's options
	 */
	private updateUrl() {
		this.currentUrl = this.getOpenPanelUrl();
		window.location.hash = this.currentUrl;
	}

	/**
	 * Serialize all the panel's options objects into a string for use in the url
	 */
	private getOpenPanelUrl(): string {
		return this.panelUrlService.createUrl(this.openPanels.map(panel => panel.instance));
	}
}

export default angular
	.module('sliderizr.panelService', [])
	.service('panelService', PanelService);

