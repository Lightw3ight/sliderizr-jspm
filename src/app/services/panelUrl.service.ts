import angular from 'angular';

import IPanelUrlService from 'IPanelUrlService';
import {IPanelInstance} from '../models/IPanelInstance';
import {IPanelOptions} from '../models/IPanelOptions';
import IRouteParams from '../models/IRouteParams';

class PanelUrlService implements IPanelUrlService {
	private pageDividerChar: string = '/';
	private queryIndicatorChar: string = ';';
	private queryDividerChar: string = ',';
	private queryEqualityChar = '=';

	createUrl(panels: IPanelInstance<IRouteParams>[]): string {
		var queryIndicatorAdded = false;
		var url = '';

		panels.forEach((panel) => {
			if (!panel.options.name) {
				return;
			}

			url += this.pageDividerChar;
			url += panel.options.name;
			queryIndicatorAdded = false;

			for (var key in panel.options.params) {
				if (panel.options.params.hasOwnProperty(key)) {

					if (!queryIndicatorAdded) {
						url += this.queryIndicatorChar;
						queryIndicatorAdded = true;
					} else {
						url += this.queryDividerChar;
					}

					url += key + this.queryEqualityChar + panel.options.params[key];
				}
			}
		});

		return url;
	}

	deserializeUrl(url?: string): IPanelOptions<IRouteParams>[] {
		var result: IPanelOptions<IRouteParams>[] = [];

		var path = (url || this.getWindowLocation() || '').replace(/\\/g, this.pageDividerChar);

		if (path.indexOf('/') === 0) {
			path = path.substr(1);
		}

		if (!path) {
			path = 'dashboard';
		}

		var pages = path.split(this.pageDividerChar);
		var lastPage: IPanelOptions<IRouteParams>;

		pages.forEach(pageString => {
			var queryIndex = pageString.indexOf(this.queryIndicatorChar);
			var templatePath = pageString;
			var params: IRouteParams;

			if (queryIndex > 0) {
				templatePath = pageString.substr(0, queryIndex);
				var paramPairs = pageString.substr(queryIndex + 1).split(this.queryDividerChar);
				params = this.parseRouteParams(paramPairs);
			}

			var page = <IPanelOptions<IRouteParams>>{
				name: templatePath,
				params: params || {}
			};

			result.push(page);
			lastPage = page;
		});

		return result;
	}

	private parseRouteParams(params: string[]): IRouteParams {
		var result = <IRouteParams>{};

		params.forEach(paramString => {
			var paramSplit = paramString.split(this.queryEqualityChar);
			result[paramSplit[0]] = paramSplit[1];
		});

		return result;
	}

	isUrlCurrent(url: string): boolean {
		return (this.getWindowLocation() === url);
	}

	getWindowLocation(): string {
		var hash = window.location.hash;

		if (hash.indexOf('#') >= 0) {
			return hash.substr(1);
		}

		return hash;
	}
}

export default angular
	.module('sliderizr.panelUrlService', [])
	.service('panelUrlService', PanelUrlService);

