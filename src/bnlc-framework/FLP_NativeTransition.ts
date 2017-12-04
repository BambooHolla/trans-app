import { FLP_Route } from './FLP_Route';
import { Platform, NavOptions, NavController, NavParams } from 'ionic-angular';
import {
	NativePageTransitions,
	NativeTransitionOptions
} from '@ionic-native/native-page-transitions';
type doNativeTransitionOptions = {
	options: NativeTransitionOptions;
	tranType: 'slide' | 'flip' | 'fade' | 'curl';
};

export class FLP_NativeTransition extends FLP_Route {
	@FLP_NativeTransition.FromGlobal
	nativePageTransitions: NativePageTransitions;
	@FLP_NativeTransition.FromGlobal platform: Platform;

	constructor(navCtrl: NavController, navParams: NavParams) {
		super(navCtrl, navParams);
		const _navCtrl_pop = this.navCtrl.pop.bind(this.navCtrl);
		this.navCtrl.pop = (opts?: NavOptions, done?: any) => {
			return _navCtrl_pop(Object.assign({ animate: false }, opts), done);
		};
	}

	public getNativeTransitionOptions(
		type: 'push' | 'leave',
		path?: string,
		params?: any,
		opts?: NavOptions
	): doNativeTransitionOptions | undefined {
		if (type === 'push') {
			return {
				options: {
					direction: 'left',
					duration: 250,
					// iosdelay: -1,
					// androiddelay: -1,
					fixedPixelsTop: 0,
					fixedPixelsBottom: 0 //49 // 底部tab栏
				},
				tranType: 'slide'
			};
		} else {
			// return {
			//   options: {
			//     duration: 0
			//   },
			//   tranType: 'fade'
			// }
		}
	}
	doNativeTransition(tranConfig: doNativeTransitionOptions) {
		if (!this.nativePageTransitions) {
			return;
		}
		var res = this.nativePageTransitions[tranConfig.tranType](
			tranConfig.options
		);
		var platform_key;
		if (this.platform.is('ios')) {
			platform_key = 'iosdelay';
		} else if (this.platform.is('android')) {
			platform_key = 'androiddelay';
		}
		if (platform_key && tranConfig.options[platform_key] === -1) {
			res = res.then(() =>
				this.nativePageTransitions.executePendingTransition()
			);
		}
		return res.catch(console.warn); // 原生浏览器上不支持，但不要抛出错误
	}

	@FLP_NativeTransition.willLeave
	setLeaveTransition() {
		if (!this._is_being_push) {
			const tranConfig = this.getNativeTransitionOptions('leave');
			if (tranConfig) {
				this.doNativeTransition(tranConfig);
			}
		}
		this._is_being_push = false;
	}

	/**
   * 是否push了一个新的页面
   * 用来是否要调用getNativeTransitionOptions('leave')
   * 因为push会调用一次getNativeTransitionOptions，同时ionViewWillLeave不应该再取
   */
	private _is_being_push = false;

	_navCtrlPush(path: string, params?: any, opts?: NavOptions, done?: any) {
		const tranConfig = this.getNativeTransitionOptions(
			'push',
			path,
			params,
			opts
		);
		const runPush = () => {
			this._is_being_push = true;
			return super._navCtrlPush(
				path,
				params,
				Object.assign({ animate: false }, opts),
				done
			);
		};
		if (tranConfig) {
			return runPush().then(() => {
				return this.doNativeTransition(tranConfig);
			});
		} else {
			return runPush();
		}
	}
}
