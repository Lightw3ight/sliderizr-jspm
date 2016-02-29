import angular from 'angular';
import 'core-js/fn/array/find-index';
import 'core-js/fn/array/find';
import 'core-js/fn/array/from';
import 'core-js/fn/array/includes';
import 'core-js/fn/object/assign';
import 'core-js/fn/set';
import 'core-js/fn/string/includes';
import 'core-js/fn/string/starts-with';

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