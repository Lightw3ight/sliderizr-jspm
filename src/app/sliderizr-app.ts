import angular from 'angular';

import panelRouteProvider from './providers/panelRoute.provider';
import panelService from './services/panel.service';
import panelUrlService from './services/panelUrl.service';

import panelDirective from './directives/panel.directive';
import panelContainerDirective from './directives/panelContainer.directive';

export default angular.module('sliderizr',[
	'ngAnimate',
	panelRouteProvider.name,
	panelService.name,
	panelUrlService.name,
	
	panelDirective.name,
	panelContainerDirective.name
])