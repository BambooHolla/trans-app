import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
	Platform,
	ActionSheetController,
	ModalController,
	NavController,
	NavParams,
	ViewController
} from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	AccountServiceProvider,
	CertificationCertificateType,
	AuthenticationModel
} from '../../providers/account-service/account-service';
import { PromptControlleService } from "../../providers/prompt-controlle-service";
@Component({
	selector: 'page-set-pay-pwd',
	templateUrl: 'set-pay-pwd.html'
})
export class SetPayPwdPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public accountService: AccountServiceProvider,
		public promptCtrl: PromptControlleService,
	) {
		super(navCtrl, navParams);
	}

	has_account_pwd = false;
	loading_has_account_pwd = true;

	@SetPayPwdPage.willEnter
	@asyncCtrlGenerator.error('GAIN_TRANSACTION_PASSWORD_ERROR')
	async checkHasAccountPWD() {
		this.loading_has_account_pwd = true;
		this.has_account_pwd = await this.accountService.hasAccountPwd.getPromise();
		this.loading_has_account_pwd = false;
	}

	formData: {
		payPWD: string;
		confirmPayPWD: string;
		loginPWD: string;
		check_method: AuthenticationModel;
		vcode: string;
	} = {
		payPWD: '',
		confirmPayPWD: '',
		loginPWD: '',
		check_method: null,
		vcode: ''
	};
	errors: any = {};

	@SetPayPwdPage.setErrorTo('errors', 'confirmPayPWD', ['no_same'])
	check_two_pay_pwd() {
		if (this.formData.payPWD !== this.formData.confirmPayPWD) {
			return { no_same: true };
		}
	}

	check_method_options: any[];
	@SetPayPwdPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('LOAD_USER_INFO_ERROR')
	async getCheckMethodOptions() {
		return (this.check_method_options = await this.accountService.getAuthenticateDetail(
			{
				type: CertificationCertificateType.账号
			}
		));
	}
	@asyncCtrlGenerator.loading('SENDING_VERIFICATION_CODE')
	@asyncCtrlGenerator.error('SEND_VERIFICATION_CODE_ERROR')
	@asyncCtrlGenerator.success('SEND_VERIFICATION_CODE_SUCCESS')
	sendValidate() {
		const { check_method } = this.formData;
		return this.accountService.sendValidateToCustomer(
			check_method.category,
			check_method.id
		);
	}
	get canSubmit() {
		// 表单中所有的值都不能为空,检验标识需通过
		return ( 
			this.protocolAgree &&
			Object.keys(this.formData).every(k => this.formData[k]) &&
			!this.hasError(this.errors) && !this.payPWD && !this.confirmPayPWD
		);
	}
	protocolAgree = true;
	toggleProtocolAgree() {
		this.protocolAgree = !this.protocolAgree;
	}

	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('TRANSACTION_PASSWORD_SETTINGS_ERROR')
	@asyncCtrlGenerator.success('TRANSACTION_PASSWORD_SETTINGS_SUCCESS')
	submitForm() {
		const { formData } = this;
		return this.accountService
			.setAccountPWD(
				formData.payPWD,
				formData.loginPWD,
				formData.check_method.category,
				formData.vcode
			)
			.then(() => {
				this.accountService.hasAccountPwd.refresh();
				this.finishJob(true);
			});
	}

	pwdAgreementPass = false;
	payPWD = false;
	confirmPayPWD = false;
	pwdAgreement(){
		const { formData } = this;
		if(formData.payPWD && formData.confirmPayPWD && (formData.payPWD == formData.confirmPayPWD)){
			this.pwdAgreementPass = true;
		} else {
			this.pwdAgreementPass = false;
		}
		if(formData.payPWD  && (formData.payPWD.length < 6)){
			this.payPWD = true;
		} else {
			this.payPWD = false;
		}
		if(formData.confirmPayPWD  && (formData.confirmPayPWD.length < 6)){
			this.confirmPayPWD = true;
		} else {
			this.confirmPayPWD = false;
		}
	}

}
