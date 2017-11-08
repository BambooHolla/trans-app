import { Component, ElementRef, HostBinding } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
	AlertController,
	IonicPage,
	LoadingController,
	NavController,
	NavParams
} from 'ionic-angular';

import { RegisterService } from '../../providers/register-service';
import { LoginService } from '../../providers/login-service';
import { AppDataService } from '../../providers/app-data-service';
import { AppSettings } from '../../providers/app-settings';

/**
 * Generated class for the ModifyPwdPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
	selector: 'page-modify-pwd',
	templateUrl: 'modify-pwd.html'
})
export class ModifyPwdPage {
	@HostBinding('class.account-form-page') isAccountFormPage = true;

	modifyForm: FormGroup = new FormGroup({
		oldPassword: new FormControl({ value: '', disabled: false }, [
			Validators.required,
			Validators.minLength(3)
		]),
		newPassword: new FormControl({ value: '', disabled: false }, [
			Validators.required,
			Validators.minLength(3),
			this.validatePWDDiff.bind(this)
		]),
		confirmNewPassword: new FormControl({ value: '', disabled: false }, [
			Validators.required,
			this.validatePWD.bind(this)
		])
	});
	get oldPassword() {
		return this.modifyForm.get('oldPassword');
	}
	get newPassword() {
		return this.modifyForm.get('newPassword');
	}
	get confirmNewPassword() {
		return this.modifyForm.get('confirmNewPassword');
	}

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public loadingCtrl: LoadingController,
		public alertCtrl: AlertController,
		public elementRef: ElementRef,
		public registerService: RegisterService,
		public loginService: LoginService,
		public appDataService: AppDataService,
		public appSettings: AppSettings
	) {
		window['midifyPWDPage'] = this;
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ModifyPwdPage');
	}

	onOldPasswordInput(e) {
		const newPassword = this.newPassword;
		this.newPassword.setErrors(this.validatePWDDiff());
		console.log('sameError', this.newPassword.getError('sameError'));
	}
	onNewPasswordInput(e) {
		const confirmNewPassword = this.confirmNewPassword;
		this.confirmNewPassword.setErrors(this.validatePWD());
		console.log(
			'confirmError',
			this.confirmNewPassword.getError('confirmError')
		);
	}

	validatePWDDiff() {
		if (this.modifyForm) {
			const oldPassword = this.modifyForm.get('oldPassword').value;
			const newPassword = this.modifyForm.get('newPassword').value;
			return newPassword && oldPassword === newPassword
				? { sameError: true }
				: null;
		}
	}
	validatePWD() {
		if (this.modifyForm) {
			const password = this.modifyForm.get('newPassword').value;
			const confirPassword = this.modifyForm.get('confirmNewPassword')
				.value;
			return password !== confirPassword ? { confirmError: true } : null;
		}
	}

	modifying = false;
	async modify() {
		this.modifying = true;
		try {
			await this.loginService.doModifyPWD(
				this.oldPassword.value,
				this.newPassword.value
			);

			this.alertCtrl
				.create({
					title: '修改成功',
					message: '是否要返回上一页',
					buttons: [
						{
							text: '确定',
							handler: () => {
								const views = this.navCtrl.getViews();
								if (views.length > 1) {
									this.navCtrl.pop();
								}
							}
						}
					]
				})
				.present();
			this.navCtrl.pop;
		} catch (err) {
			this.alertCtrl
				.create({
					title: '警告',
					message: err.message,
					buttons: ['确定']
				})
				.present();
		} finally {
			this.modifying = false;
		}
	}
}
