import IRouteParams from 'IRouteParams';
import {IPanelOptions} from 'IPanelOptions';

export interface IPanelInstance<T extends IRouteParams> {
	/**
	 * The options that were used to construct the panel
	 */
	options: IPanelOptions<T>;

	/**
	 * Close the panel and resolve the 'result' promise
	 * @param result An optional object to be passed to the success value of the 'result' promise
	 * @returns {} 
	 */
	close(result?: any): void;

	/**
	 * Close the panel and reject the 'result' promise
	 * @param reason An optional reason for dismissing the panel, this will be passed as the rejection value of the 'result' promise
	 * @returns {} 
	 */
	dismiss(reason?: any): void;

	/**
	 * Sets the panel as the active panel
	 */
	setActive(): void;

	/**
	 * A promise that is resolved when the panel is closed or rejected if the panel is dismissed
	 */
	result: ng.IPromise<any>;

	/**
	 * A promise that is resolved then the panel is initially opened
	 */
	opened: ng.IPromise<IPanelInstance<T>>;

	/**
	 * Set the panel title
	 * @param title Title of the panel
	 * @returns {} 
	 */
	setTitle(title: string, allowHtml?: boolean): void;

	/**
	 * Open a child panel
	 * @param name Name of the panel to open
	 */
	openChild<U extends IRouteParams>(name: string, routeParams?: U): IPanelInstance<U>;

	/**
	 * Open a child panel
	 * @param name Name of the panel to open
	 */
	openChild(name: string, routeParams?: IRouteParams): IPanelInstance<IRouteParams>;

	/**
	 * Open a child panel
	 * @param options Options to use to construct the child panel
	 */
	openChild(options: IPanelOptions<IRouteParams>): IPanelInstance<IRouteParams>;

	/**
	 * Open a child panel
	 * @param options Options to use to construct the child panel
	 */
	openChild<U extends IRouteParams>(options: IPanelOptions<IRouteParams>): IPanelInstance<U>;

	/**
	 * A Promise that must be resolved before the panel can be closed
	 */
	beforeClose(): ng.IPromise<any>;
}

