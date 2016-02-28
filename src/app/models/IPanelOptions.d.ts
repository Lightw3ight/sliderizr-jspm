import IRouteParams from 'IRouteParams';
import PanelSize from 'PanelSize';

export interface IPanelOptions<T extends IRouteParams> {
	name?: string;
	templateUrl?: string;
	controller?: string;
	controllerAs?: string;
	size?: PanelSize;
	params?: T;
	title?: string;
	resolve?: any;
}
