import { NgModule } from '@angular/core';

import { SetInputStatusDirective } from './set-input-status/set-input-status';
import { VcodeSenderDirective } from './vcode-sender/vcode-sender';

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
		VcodeSenderDirective
	],
	imports: [],
	exports: [
		SetInputStatusDirective,
		VcodeSenderDirective
	]
})
export class DirectivesModule {}
