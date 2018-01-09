import { Component, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
	AlertController,
	IonicPage,
	LoadingController,
	NavController,
	NavParams
} from 'ionic-angular';

import { LoginService } from '../../providers/login-service';
import { RegisterService } from '../../providers/register-service';
import { AppDataService } from '../../providers/app-data-service';
import { AppSettings } from '../../providers/app-settings';

/**
 * Generated class for the ForgetPwdPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
	selector: 'page-forget-pwd',
	templateUrl: 'forget-pwd.html'
})
export class ForgetPwdPage {
	forgetPWDForm: FormGroup = new FormGroup({
		// myContry: new FormControl('1002'),
		customerId: new FormControl({ value: '', disabled: false }),
		vcode: new FormControl(
			{ value: '', disabled: false },
			Validators.required
		),
		password: new FormControl({ value: '', disabled: false }, [
			Validators.minLength(3),
			Validators.required
		]),
		confirPassword: new FormControl(
			{ value: '', disabled: false },
			this.validatePWD.bind(this)
		),
		protocolAgree: new FormControl({ value: true, disabled: false })
	});
	get form_password() {
		return this.forgetPWDForm.get('password');
	}
	validatePWD() {
		if (this.forgetPWDForm) {
			const password = this.forgetPWDForm.get('password').value;
			const confirPassword = this.forgetPWDForm.get('confirPassword')
				.value;
			return password !== confirPassword ? { zz: 'zzz' } : null;
		}
	}
	// protocolAgree = false;

	toggleProtocolAgree() {
		// this.protocolAgree = !this.protocolAgree;
		const rawVal = this.forgetPWDForm.getRawValue();
		rawVal.protocolAgree = !rawVal.protocolAgree;
		this.forgetPWDForm.setValue(rawVal);
	}

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public loadingCtrl: LoadingController,
		public alertCtrl: AlertController,
		public elementRef: ElementRef,
		public loginService: LoginService,
		public registerService: RegisterService,
		public appDataService: AppDataService,
		public appSettings: AppSettings
	) {
		const rawVal = this.forgetPWDForm.getRawValue();
		const customerId = navParams.get('customerId');
		if (customerId) {
			rawVal.customerId = customerId;
			this.forgetPWDForm.setValue(rawVal);
		}
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ForgetPWDPage');
	}
	forgetPWDing = false;

	sending_vcode = false;
	resend_time_clock = 0;
	_resend_time_clock_ti: any;
	tickResendTimeClock() {
		this.resend_time_clock = 60;
		clearInterval(this._resend_time_clock_ti);
		this._resend_time_clock_ti = setInterval(() => {
			this.resend_time_clock -= 1;
			if (this.resend_time_clock === 0) {
				clearInterval(this._resend_time_clock_ti);
			}
		}, 1000);
	}

	async forgetPWD_step1() {
		this.sending_vcode = true;
		try {
			const customerId = this.forgetPWDForm
				.get('customerId')
				.value.trim();
			if (!customerId) {
				throw new RangeError('请填写手机号/邮箱');
			}
			await this.registerService.sendSMSCode(customerId,undefined,'1004');

			this.tickResendTimeClock(); // 开始倒计时重新发送短信的按钮
		} catch (err) {
			this.alertCtrl
				.create({
					title: '警告',
					message: err.message,
					buttons: ['OK']
				})
				.present();
		} finally {
			this.sending_vcode = false;
		}
	}

	async forgetPWD() {
		this.forgetPWDing = true;
		try {
			const controls = this.forgetPWDForm.getRawValue();

			const customerId = controls.customerId;
			const password = controls.password;
			const vcode = controls.vcode;

			await this.loginService.doResetPWD(customerId, vcode, password);

			this.appDataService.password = ''; // 清空已经保存的密码，要求用户手动输入
			this.appDataService.customerId = customerId;
			this.alertCtrl
				.create({
					title: '重置密码成功',
					message: '是否要回到登录页面',
					buttons: [
						{
							text: '去登录',
							handler: () => {
								this.navCtrl.push('login');
							}
						}
					]
				})
				.present();
		} catch (err) {
			this.alertCtrl
				.create({
					title: '警告',
					message: err.message,
					buttons: ['确定']
				})
				.present();
		} finally {
			this.forgetPWDing = false;
		}
	}
}
