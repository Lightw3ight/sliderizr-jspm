import IPanelScope from '../models/IPanelScope';
import IPanelRouteService from '../providers/IPanelRouteService';

function panelFactory($timeout: ng.ITimeoutService, panelRoute: IPanelRouteService): ng.IDirective {
	var activeAnimationElement: JQuery;
	var directive = <ng.IDirective>{
		restrict: 'C',
		transclude: true,
		templateUrl: panelRoute.config.panelInnerTemplateUrl,
		link: link
	};

	function link(scope: IPanelScope, element: ng.IAugmentedJQuery) {
		var parent = element.parent();

		scope.$watch('$active', (newValue) => {
			if (newValue) {
				scrollVisible();
				//$timeout(scrollVisible,.2);
			}
		});

		function scrollVisible() {

			//If there is a scroll animation already in progress, stop it
			if (activeAnimationElement) {
				activeAnimationElement.stop(true, false);
			}



			//function s(){
			//	var scroll = getScrollAmmount();
			//
			//	if (scroll){
			//		parent.scrollLeft(scroll);
			//		window.setTimeout(s, 10);
			//	}
			//}
			//s();

			//Store the element in a global so we can stop the animation if needed
			activeAnimationElement = parent;



			//Animate the scroll
			parent.animate({ scrollLeft: getScrollAmmount() }, 200, () => {
				activeAnimationElement = null;
			});
		}

		function getScrollAmmount(): number {
			var scrollLeft = parent.scrollLeft();
			var parentWidth = parent.outerWidth();
			var panelWidth = claculateWidth();
			var prevSibling = element.prev();

			//Calculate offset left from previous sibling as the current element may be in the wrong position due to animations
			var offsetLeft = prevSibling.length === 0 ? 0 : (prevSibling.offset().left + prevSibling.outerWidth() - parent.offset().left) + scrollLeft;
			var visibleRight = offsetLeft + panelWidth;

			var scroll: number;

			if (scrollLeft > offsetLeft) {
				scroll = offsetLeft;
			} else if (scrollLeft < (visibleRight - parentWidth)) {
				scroll = visibleRight - parentWidth + 50; //Add an extra 50px on the end so the panel isnt butted up against the side of the browser
			} else {
				return;
			}

			return scroll;
		}

		function claculateWidth(): number {
			//If the element is already open, we can just read its width
			if (!element.is('.open-add')) {
				return element.outerWidth();
			}

			//Because the panel's width may be animated during an 'open' animation, we need another way of getting its width
			//To do this we create a temporary 'open' panel, remove the 'open-*' animation classes, add it to the panel container, measure its width then remove it again
			var tmp = $('<div />')
				.attr('class', <string>element.attr('class'))
				.removeClass('open-add')
				.removeClass('open-add-active')
				.appendTo(element.parent());

			var width = tmp.outerWidth();
			tmp.remove();
			return width;
		}
	}

	return directive;
}

export default angular.module('sliderizr.sitePanel', []).directive('sitePanel', panelFactory);

