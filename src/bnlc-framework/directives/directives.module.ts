import { NgModule } from '@angular/core';

import { SetInputStatusDirective } from './set-input-status/set-input-status';
import { VcodeSenderDirective } from './vcode-sender/vcode-sender';
import { ListAniDirective } from './list-ani/list-ani.MutationObserver';

window.requestAnimationFrame = (function() {
	return (
		window.requestAnimationFrame ||
		window['webkitRequestAnimationFrame'] ||
		window['mozRequestAnimationFrame']
	);
})();
window.cancelAnimationFrame = (function() {
	return (
		window.cancelAnimationFrame ||
		window['webkitCancelAnimationFrame'] ||
		window['mozCancelAnimationFrame']
	);
})();

@NgModule({
	declarations: [
		SetInputStatusDirective,
		ListAniDirective,
		VcodeSenderDirective
	],
	imports: [],
	exports: [
		SetInputStatusDirective,
		ListAniDirective,
		VcodeSenderDirective
	]
})
export class DirectivesModule {}
