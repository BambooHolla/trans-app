import { Component } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	ViewController
} from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	AccountServiceProvider,
	ProductModel,
	PaymentCategory,
	PaymenType,
	PaymentBelong,
	AuthenticationModel,
	CertificationCertificateType
} from '../../providers/account-service/account-service';
import { AppDataService } from '../../providers/app-data-service';
import { PromptControlleService } from '../../providers/prompt-controlle-service';
@Component({
	selector: 'page-add-address',
	templateUrl: 'add-address.html'
})
export class AddAddressPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public appdata: AppDataService,
		public viewCtrl: ViewController,
		public accountService: AccountServiceProvider,
		public promptCtrl: PromptControlleService,
	) {
		super(navCtrl, navParams);
	}
	// PS:这里不能用FormGroup, 因为ion-radio不支持formControl
	formData: {
		name: string;
		address: string;
		check_method: AuthenticationModel;
		vcode: string;
	} = {
		name: '',
		address: '',
		check_method: null,
		vcode: ''
	};

	productInfo: ProductModel;
	// check_method: AuthenticationModel;
	check_method_options: any;
	@AddAddressPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('LOAD_USER_INFO_ERROR')
	async getCheckMethodOptions() {
		this.productInfo = this.navParams.get('productInfo');
		if (!this.productInfo) {
			this.navCtrl.removeView(this.viewCtrl);
		}
		 
		return (this.check_method_options = await this.accountService.getAuthenticateDetail(
			{
				type: CertificationCertificateType.账号
			}
		).then( value => value[0]? value : value))
	}
	@asyncCtrlGenerator.loading('SENDING_VERIFICATION_CODE')
	@asyncCtrlGenerator.error('SEND_VERIFICATION_CODE_ERROR')
	@asyncCtrlGenerator.success('SEND_VERIFICATION_CODE_SUCCESSFULLY')
	sendValidate() {
		const { check_method } = this.formData;
		return this.accountService.sendValidateToCustomer(
			check_method.category,
			check_method.id
		);
	}
	get canSubmit() {
		// 表单中所有的值都不能为空
		return Object.keys(this.formData).every(k => this.formData[k]);
	}
	protocolAgree = true;
	toggleProtocolAgree() {
		this.protocolAgree = !this.protocolAgree;
	}
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('ADD_ADDRESS_ERROR')
	@asyncCtrlGenerator.success('ADD_ADDRESS_SUCCESS')
	async submitAddAddress() {
		const { productInfo } = this;
		const { name, address, check_method, vcode } = this.formData;
		return this.accountService
			.createValidate({
				paymentCategory: PaymentCategory.Withdraw,
				paymentType: PaymenType.Other,
				paymentBelong: PaymentBelong.Customer,
				paymentOrganization: productInfo.productId,
				realname: name,
				paymentAccountNumber: address,
				code: vcode,
				category: check_method.category
			})
			.then((returnData) => {
				console.log('add-address return data')
				console.log(returnData)
				this.viewCtrl.dismiss(returnData);
				// this.finishJob(true);
			});
	}

	finishSelect(send_selected_data?: boolean) {
		this.viewCtrl.dismiss();
	}
}
