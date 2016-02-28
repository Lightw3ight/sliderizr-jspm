import IRouteParams from './models/IRouteParams';
import {IPanelInstance} from './models/IPanelInstance';
import {IPanelOptions} from './models/IPanelOptions';

interface IPanelService {
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
	 * @param parent The parent panel that is opening the new panel (Optional)
	 * @param activate Set the panel as active once it is opened (default: true
	 */
	open(name: string, parent?: IPanelInstance<IRouteParams>): IPanelInstance<IRouteParams>;

	/**
	 * Open a new panel
	 * @param name Name of the panel to open (Must match a route)
	 * @param routeParams Optional parameters to load the panel with (think querystring)
	 * @param parent The parent panel that is opening the new panel (Optional)
	 */
	open<T extends IRouteParams>(name: string, routeParams: IRouteParams, parent?: IPanelInstance<IRouteParams>): IPanelInstance<T>;

	/**
	 * Open a new panel
	 * @param name Name of the panel to open (Must match a route)
	 * @param routeParams Optional parameters to load the panel with (think querystring)
	 * @param parent The parent panel that is opening the new panel (Optional)
	 * @param activate Set the panel as active once it is opened (default: true
	 */
	open(name: string, routeParams: IRouteParams, parent?: IPanelInstance<IRouteParams>): IPanelInstance<IRouteParams>;

	/**
	 * Open a new panel
	 * @param options Options to use to configure the panel
	 * @param parent The parent panel that is opening the new panel (Optional)
	 */
	open(options: IPanelOptions<IRouteParams>, parent?: IPanelInstance<IRouteParams>): IPanelInstance<IRouteParams>;

	/**
	 * Open a new panel
	 * @param options Options to use to configure the panel
	 * @param parent The parent panel that is opening the new panel (Optional)
	 */
	open<T extends IRouteParams>(options: IPanelOptions<IRouteParams>, parent?: IPanelInstance<IRouteParams>): IPanelInstance<T>;

	getActivePanel(): IPanelInstance<IRouteParams>;

	getAllOpenPanels(): IPanelInstance<IRouteParams>[];
}

export default IPanelService;
