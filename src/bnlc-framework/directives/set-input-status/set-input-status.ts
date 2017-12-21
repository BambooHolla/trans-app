import {
	Directive,
	Input,
	ElementRef,
	ViewContainerRef,
	OnInit,
	OnDestroy,
	Injector
} from '@angular/core';
import { FirstLevelPage } from '../../FirsetLevelPage';

/**
 * Generated class for the SetInputStatusDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
	selector: '[set-input-status]' // Attribute selector
})
export class SetInputStatusDirective implements OnInit, OnDestroy {
	@Input('set-input-status') form_key = '';

	@Input('watch-input-keys') watch_keys = [];

	constructor(private elementRef: ElementRef, public view: ViewContainerRef) {
		// console.log('Hello BackdropBlurDirective Directive');
		// if(this.ele.tagName!=="INPUT"){
		// 	throw new TypeError("[set-input-status] Directive must use in input elememnt");
		// }
		this._addEvent('blur');
		this._addEvent('input');
		this._addEvent('focus');
		console.log((window['sis'] = this));
		// FIXIT: 这不是标准的方法，找到稳定的API来实现获取Component
		this.page = view['_view'].component as FirstLevelPage;
	}
	get ele() {
		return this.elementRef.nativeElement as HTMLElement;
	}
	page: FirstLevelPage;

	ionItemEle: HTMLElement;
	private _addEvent(name) {
		this.ele.addEventListener(name, e => {
			this.form_key && this.page.setInputstatus(this.form_key, e);
		});
		if (name === 'focus' && this.ele.getAttribute('type') === 'password') {
			this.ele.addEventListener(name, e => {
				e.target.select && e.target.select();
			});
		}

		// 模拟ionic-input与ion-item之间的行为
		if (name === 'focus') {
			const on_foucs = e => {
				const ionItemEle = this.findIonItemEle();
				if (ionItemEle) {
					ionItemEle.classList.add('input-has-focus');
				} else {
					this.ele.removeEventListener(name, on_foucs);
				}
			};
			this.ele.addEventListener(name, on_foucs);
		} else if (name === 'blur') {
			const on_blur = e => {
				const ionItemEle = this.findIonItemEle();
				if (ionItemEle) {
					ionItemEle.classList.remove('input-has-focus');
				} else {
					this.ele.removeEventListener(name, on_blur);
				}
			};
			this.ele.addEventListener(name, on_blur);
		} else if (name === 'input') {
			// this.ele.addEventListener(name, e => {
			// 	if(e.target.value){
			// 	ionItemEle.classList.remove('input-has-focus');
			// 	}
			// });
		}
	}
	findIonItemEle() {
		let ionItemEle: HTMLElement = this.ionItemEle;

		if (ionItemEle === undefined) {
			ionItemEle = null;
			const inputEle = this.ele;
			let parentEle = inputEle.parentElement;
			while (parentEle && parentEle != document.body) {
				if (parentEle.tagName === 'ION-ITEM') {
					ionItemEle = this.ionItemEle = parentEle;
					break;
				}
				parentEle = parentEle.parentElement;
			}
		}
		return ionItemEle;
	}

	ngOnInit() {
		this.onInputStatusChanged = this.onInputStatusChanged.bind(this);
		this.page.event.on('input-status-changed', this.onInputStatusChanged);
	}
	onInputStatusChanged(change_info) {
		const { key, event } = change_info;
		if (this.watch_keys.indexOf(key) !== -1 && event.type === 'input') {
			this.form_key && this.page.checkFormKey(this.form_key);
		}
	}
	ngOnDestroy() {
		this.page.event.off('input-status-changed', this.onInputStatusChanged);
	}
}
