import {IPanelInstance} from '../models/IPanelInstance';
import {IPanelOptions} from '../models/IPanelOptions';
import IRouteParams from '../models/IRouteParams';

interface IPanelUrlService {
	createUrl(panels: IPanelInstance<IRouteParams>[]): string;
	isUrlCurrent(url: string): boolean;
	deserializeUrl(url?: string): IPanelOptions<IRouteParams>[];
}

export default IPanelUrlService;