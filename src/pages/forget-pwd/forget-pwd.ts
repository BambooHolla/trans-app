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
import { CryptoService } from '../../providers/crypto-service';
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
			Validators.required,
			this.validatePWDDStrength.bind(this,'password')
			
		]),
		confirPassword: new FormControl(
			{ value: '', disabled: false },[
				this.validatePWD.bind(this),
				Validators.required,
		]),
		protocolAgree: new FormControl({ value: true, disabled: false })
	});
	get form_customerId() {
		return this.forgetPWDForm.get('customerId');
	}
	get form_password() {
		
		return this.forgetPWDForm.get('password');
	}
	get form_confirPassword() {
		return this.forgetPWDForm.get('confirPassword');
	}
	pwdAgreementPass = false;
	validatePWD() {
		
		if (this.forgetPWDForm) {
			const password = this.forgetPWDForm.get('password').value;
			const confirPassword = this.forgetPWDForm.get('confirPassword').value;
			this.pwdAgreementPass = password !== confirPassword ?true : false;
			return password !== confirPassword ? {err:'err'} : null;
		}
	}



	// protocolAgree = false;

	toggleProtocolAgree() {
		// this.protocolAgree = !this.protocolAgree;
		const rawVal = this.forgetPWDForm.getRawValue();
		rawVal.protocolAgree = !rawVal.protocolAgree;
		this.forgetPWDForm.setValue(rawVal);
	}
	private backLoginCb:any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public loadingCtrl: LoadingController,
		public alertCtrl: AlertController,
		public elementRef: ElementRef,
		public loginService: LoginService,
		public registerService: RegisterService,
		public appDataService: AppDataService,
		public appSettings: AppSettings,
		public cryptoService: CryptoService,
	) {
		const rawVal = this.forgetPWDForm.getRawValue();
		const customerId = navParams.get('customerId');
		this.backLoginCb = navParams.get("loginCb");
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
				throw new RangeError(window['language']['PLEASE_INPUT_MOBILE_PHONE_NUMBER_EMAIL']||'请填写手机号/邮箱');
			}
				await this.registerService.sendSMSCode(customerId,undefined,'1004');
				this.tickResendTimeClock(); // 开始倒计时重新发送短信的按钮
		} catch (err) {
			this.alertCtrl
				.create({
					title: window['language']['WARNING']||'警告',
					message: err.message,
					buttons: [window['language']['COFIRM']||'确定']
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
			const resetPwd = controls.password;
			const vcode = controls.vcode;

			await this.loginService.doResetPWD(customerId, vcode, this.cryptoService.MD5(resetPwd));

			this.appDataService.password = ''; // 清空已经保存的密码，要求用户手动输入
			this.appDataService.customerId = customerId;
			this.alertCtrl
				.create({
					title: window['language']['RESET_PASSWORD_SUCCESSFULLY']||'重置密码成功',
					message: window['language']['RETURN_TO_LOGIN_PAGE']||'是否要回到登录页面',
					buttons: [
						{
							text: window['language']['GO_TO_LOGIN']||'去登录',
							handler: () => {
								//跳转到重置密码页面，是用过navPush的
								//所以之后返回需要使用pop()
								//而不是使用push
								//因为登录页面是没放在正常的路由里面，而是一个模态框
								// this.navCtrl.push('login');
								this.navCtrl.pop().then( () => {
							
									if(this.backLoginCb) {
										this.backLoginCb()
									}
								});
							}
						}
					]
				})
				.present();
		} catch (err) {
			this.alertCtrl
				.create({
					title: window['language']['WARNING']||'警告',
					message: err.message,
					buttons: [window['language']['COFIRM']||'确定']
				})
				.present();
		} finally {
			this.forgetPWDing = false;
		}
	}

	customerId_existence = true ;
  async checkRegister(){

    const controls = this.forgetPWDForm.getRawValue();
	const customerId = controls.customerId;
	if(!customerId) return;
      try {

        this.registerService.doCheckRegister(customerId)
        .then((data)=>{
          //账户不存在
          if(data.status == "error"){
            this.customerId_existence = false;
        
          }
          //账户存在
          if(data.status == "ok"){
            this.customerId_existence = true;
          }

        })
      } catch(err) {
        console.log('register checkRegister',err)
      }
  }
  validatePWDDStrength(pwd){
	if (this.forgetPWDForm) {
		const password = this.forgetPWDForm.get(pwd).value;
		if(!password) return null;
		//密码至少包含一个大写，一个小写，一个数字
		let pattern = new RegExp( /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{3,}$/);
		return pattern.test(password) ? null	 :  { strengthError: true };
	}
	
}
}
