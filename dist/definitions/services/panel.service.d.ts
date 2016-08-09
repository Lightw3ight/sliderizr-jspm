/// <reference path="../../../typings/main.d.ts" />
import angular from 'angular';
import IPanelService from 'IPanelService';
import IPanelRouteService from '../providers/IPanelRouteService';
import IPanelUrlService from 'IPanelUrlService';
import { IPanelInstance } from '../models/IPanelInstance';
import IRouteParams from '../models/IRouteParams';
import { IPanelOptions } from '../models/IPanelOptions';
export declare class PanelService implements IPanelService {
    private $rootScope;
    private $controller;
    private $compile;
    private panelRoute;
    private $q;
    private $animate;
    private $timeout;
    private panelUrlService;
    private $injector;
    private $sce;
    private $templateRequest;
    private openPanels;
    private currentUrl;
    private setActivePromise;
    constructor($rootScope: ng.IRootScopeService, $controller: ng.IControllerService, $compile: ng.ICompileService, panelRoute: IPanelRouteService, $q: ng.IQService, $animate: ng.animate.IAnimateService, $timeout: ng.ITimeoutService, panelUrlService: IPanelUrlService, $injector: ng.auto.IInjectorService, $sce: ng.ISCEService, $templateRequest: ng.ITemplateRequestService);
    getActivePanel(): IPanelInstance<IRouteParams>;
    getAllOpenPanels(): IPanelInstance<IRouteParams>[];
    /**
     * Close a given panel and resolve the 'result' promise
     * @param panelInstance Instance Instance of the panel to close
     * @param result Optional result object to return with the 'result' promise
     */
    close(panelInstance: IPanelInstance<IRouteParams>, result: any): void;
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
    /**
     * Create a scope for a panel, this scope gives us some functions for interacting with the panel from our view
     * @param panelInstance The instance object of the panel
     * @param panelRoute The route that defines the panel
     * @param title The initial title of the panel
     * @param parent The panel's parent instance
     * @returns {}
     */
    private createPanelScope(panelInstance, panelRoute, title, parent?);
    /**
     * Create a panel instance.
     * Panel instances are for use in the panel's controller and allow us to interact with the panel
     * @param options Options defining the panel
     * @param openedPromise A promise that is resolved when a panel has finished opening
     * @param resultPromise A promise that is resolved when a panel is closed
     */
    private createPanelInstance(options, openedPromise, resultPromise);
    /**
     * Create a panel controller
     * @param panelRoute The panel route that defines the controller to be created
     * @param panelInstance The instance of the panel to be used in the controller
     * @param panelScope The scope of the panel
     * @param resolvedLocals An object with local values that can be injected into the constructor of the controller
     */
    private createController(panelRoute, panelInstance, panelScope, resolvedLocals);
    /**
     * Create a panel's DOM element
     * @param contentTemplateUrl url to the template to be used for the content of the panel
     * @param panelScope Panel's scope object
     */
    private createPanelElement(contentTemplateUrl, panelScope);
    /**
     * Create and open a new panel
     */
    private createPanel(options, parent?);
    /**
     * Close a given panel and reject its 'result' promise
     * @param panelInstance Instance of the panel to close
     * @param reason Optional reason for dismissing the panel
     */
    private dismiss(panelInstance, reason?);
    /**
     * Set a given panel as active
     * @param panelInstance Instance of the panel to set as active (defaults to the last panel if none is supplied
     * @param immediate Set active immediately or set it in a timeout
     */
    private setActive(panelScope?, immediate?);
    /**
     * Close all open panels
     */
    private closeAll();
    /**
     * Resolves te route's resolve field and closes appropriate children
     * Returns any locals loaded by the resolve function
     * @param panelRoute The route to the panel to open
     * @param parent The parent panel that is opening the new panel
     * @returns {}
     */
    private prepareToOpenPanel(panelRoute, options, parent?);
    /**
     * Find an open panel that has the same name and params as a given panelOptions object
     * @param options Options to search by
     * @returns {}
     */
    private findExistingPanel(options, parent?);
    /**
     * Compare two options objects to see if their names and params are equal
     * @param o1 Options 1
     * @param o2 Options 2
     */
    private compareOptions(o1, o2);
    /**
     * Event handler for the window's hash change event
     */
    private onLocationChanged();
    /**
     * De-serialize the url int panel options and create panels based on these options
     */
    private loadPanelsFromPath();
    /**
     * Close all child panels belonging to a given panel
     * @param panel parent panel who's child panels are to be closed
     * @param animate Allow animations or not (Usefull to prevent a double animation when closing one panel and opening another
     */
    private closeChildren(panel, animate?);
    /**
     * Close a panel and all of its child panels
     * @param panel Panel to close
     */
    private closeBranch(panel);
    /**
     * Get all children of a given panel
     * @param panel Panel to get children of
     */
    private getChildPanels(panel);
    /**
     * Find a panel by its instance object
     * @param panelInstance Panel instance to search by
     */
    private getPanelByInstance(panelInstance);
    /**
     * Remove a panel from the dom and the open panel list
     * @param panel
     * @returns {}
     */
    private removePanel(panel);
    /**
     * Update the window's hash with a serialized version of the current open panel's options
     */
    private updateUrl();
    /**
     * Serialize all the panel's options objects into a string for use in the url
     */
    private getOpenPanelUrl();
}
declare var _default: angular.IModule;
export default _default;
