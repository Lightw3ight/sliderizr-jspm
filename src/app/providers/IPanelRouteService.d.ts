import IRouteCollection from '../models/IRouteCollection';
import ISliderizrConfig from '../models/ISliderizrConfig';

interface IPanelRouteService {
	routes: IRouteCollection;
	config: ISliderizrConfig;
}

export default IPanelRouteService;