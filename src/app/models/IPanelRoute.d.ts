import IRouteParams from 'IRouteParams';
import PanelSize from 'PanelSize';
import {IPanelOptions} from 'IPanelOptions';

interface IPanelRoute {
	templateUrl?: string;
	controller?: string;
	controllerAs?: string;
	title?: string;
	size?: PanelSize;
	resolve?: { [key: string]: any };
	redirectTo?: string | IPanelOptions<IRouteParams>;
}
export default IPanelRoute;