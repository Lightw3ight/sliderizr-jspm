import IPanelRoute from '../models/IPanelRoute';
import ISliderizrConfig from '../models/ISliderizrConfig';

interface IPanelRouteProvider extends ng.IServiceProvider {
	when(name: string, route: IPanelRoute): IPanelRouteProvider;
	otherwise(route: IPanelRoute): IPanelRouteProvider;
	otherwise(routeName: string): IPanelRouteProvider;
	config: ISliderizrConfig;
}

export default IPanelRouteProvider
