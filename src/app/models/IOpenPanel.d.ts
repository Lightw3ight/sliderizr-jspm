import IPanelScope from 'IPanelScope';
import {IPanelInstance} from 'IPanelInstance';
import IRouteParams from 'IRouteParams';

interface IOpenPanel {
	deferred: ng.IDeferred<any>;
	panelScope: IPanelScope;
	instance: IPanelInstance<IRouteParams>;
	element: ng.IAugmentedJQuery;
	parent?: IOpenPanel;
}

export default IOpenPanel
