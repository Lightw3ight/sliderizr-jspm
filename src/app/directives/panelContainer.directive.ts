function factory(): ng.IDirective {
	var directive = <ng.IDirective>{
		restrict: 'C',
		link: link
	};

	function link() {

	}

	return directive;
}

export default angular.module('sliderizr.panelContainer', [])
	.directive('panelContainer', factory);
