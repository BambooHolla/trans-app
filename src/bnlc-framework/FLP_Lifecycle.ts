import { OnInit, AfterContentInit } from '@angular/core';
import { EventEmitter } from 'eventemitter3';
import { PAGE_STATUS } from './const';
import { FLP_Tool } from './FLP_Tool';

export class FLP_Lifecycle extends FLP_Tool
	implements OnInit, AfterContentInit {
	constructor() {
		super();
		console.log(this.cname, this);
		window['instanceOf' + this.cname] = this;
	}
	cname = this.constructor.name;
	PAGE_LEVEL = 1;
	_event: EventEmitter;
	get event() {
		return this._event || (this._event = new EventEmitter());
	}
	PAGE_STATUS = PAGE_STATUS.UNLOAD;

	tryEmit(eventanme, ...args) {
		if (this._event) {
			this._event.emit(eventanme, ...args);
		}
	}
	ngOnInit() {
		// console.log("ngOnInit",this.content,this.header)
		// this.content.fullscreen = true;
		for (let fun_name of this._oninit_funs) {
			this[fun_name]();
		}
		this.tryEmit('onInit');
	}
	ngAfterContentInit() {
		for (let fun_name of this._aftercontentinit_funs) {
			this[fun_name]();
		}
		this.tryEmit('afterContentInit');
	}

	ionViewWillEnter() {
		this.PAGE_STATUS = PAGE_STATUS.WILL_ENTER;
		console.log('ionViewWillEnter', this.cname);

		for (let fun_name of this._will_enter_funs) {
			this[fun_name]();
		}
		this.tryEmit('willEnter');
	}

	ionViewDidEnter() {
		this.PAGE_STATUS = PAGE_STATUS.DID_ENTER;
		console.log('ionViewDidEnter', this.cname);
		
		for (let fun_name of this._did_enter_funs) {
			this[fun_name]();
		}
		this.tryEmit('didEnter');
	}
	ionViewWillLeave() {
		this.PAGE_STATUS = PAGE_STATUS.WILL_LEAVE;
		console.log('ionViewWillLeave', this.cname);

		for (let fun_name of this._will_leave_funs) {
			this[fun_name]();
		}
		this.tryEmit('willLeave');
	}
	ionViewDidLeave() {
		this.PAGE_STATUS = PAGE_STATUS.DID_LEAVE;
		console.log('ionViewDidLeave', this.cname);

		for (let fun_name of this._did_leave_funs) {
			this[fun_name]();
		}
		this.tryEmit('didLeave');
	}

	// 生命周期 修饰器
	// 这里只保存属性名，在调用的时候就能获取到最终被其它修饰器修饰完的属性值
	@FLP_Lifecycle.cacheFromProtoArray('onInit')
	private _oninit_funs: Set<string>;
	static onInit(target: any, name: string, descriptor?: PropertyDescriptor) {
		FLP_Tool.addProtoArray(target, 'onInit', name);
		return descriptor;
	}
	@FLP_Lifecycle.cacheFromProtoArray('afterContentInit')
	private _aftercontentinit_funs: Set<string>;
	static afterContentInit(
		target: any,
		name: string,
		descriptor?: PropertyDescriptor
	) {
		FLP_Tool.addProtoArray(target, 'afterContentInit', name);
		return descriptor;
	}
	@FLP_Lifecycle.cacheFromProtoArray('willEnter')
	private _will_enter_funs: Set<string>;
	static willEnter(
		target: any,
		name: string,
		descriptor?: PropertyDescriptor
	) {
		FLP_Tool.addProtoArray(target, 'willEnter', name);
		return descriptor;
	}
	@FLP_Lifecycle.cacheFromProtoArray('didEnter')
	private _did_enter_funs: Set<string>;
	static didEnter(
		target: any,
		name: string,
		descriptor?: PropertyDescriptor
	) {
		FLP_Tool.addProtoArray(target, 'didEnter', name);
		return descriptor;
	}
	@FLP_Lifecycle.cacheFromProtoArray('willLeave')
	private _will_leave_funs: Set<string>;
	static willLeave(
		target: any,
		name: string,
		descriptor?: PropertyDescriptor
	) {
		FLP_Tool.addProtoArray(target, 'willLeave', name);
		return descriptor;
	}
	@FLP_Lifecycle.cacheFromProtoArray('didLeave')
	private _did_leave_funs: Set<string>;
	static didLeave(
		target: any,
		name: string,
		descriptor?: PropertyDescriptor
	) {
		FLP_Tool.addProtoArray(target, 'didLeave', name);
		return descriptor;
	}

	static cacheFromProtoArray(key) {
		return (target: any, name: string, descriptor?: PropertyDescriptor) => {
			const cache_key = `-PA-${name}-`;
			Object.defineProperty(target, name, {
				get() {
					return (
						this[cache_key] ||
						(this[cache_key] = FLP_Tool.getProtoArray(this, key))
					);
				}
			});
		};
	}
}
