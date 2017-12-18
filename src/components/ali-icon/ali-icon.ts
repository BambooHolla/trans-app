import { Component, Input } from '@angular/core';

/**
 * Generated class for the AliIconComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
	selector: 'ali-icon',
	templateUrl: 'ali-icon.html'
})
export class AliIconComponent {
	@Input() name: string;
}
