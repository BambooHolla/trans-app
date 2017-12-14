import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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

@Component({
	selector: 'page-add-address',
	templateUrl: 'add-address.html'
})
export class AddAddressPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public appdata: AppDataService,
		public accountService: AccountServiceProvider
	) {
		super(navCtrl, navParams);
	}
	formData: {
		address: string;
		check_method: AuthenticationModel;
		vcode: string;
	} = {
		address: '',
		check_method: null,
		vcode: ''
	};

	productInfo: ProductModel;
	// check_method: AuthenticationModel;
	check_method_options: any[];
	@AddAddressPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('加载用户信息出错')
	async getCheckMethodOptions() {
		this.productInfo = this.navParams.get('productInfo');

		return (this.check_method_options = await this.accountService.getAuthenticateDetail(
			{
				type: CertificationCertificateType.账号
			}
		));
	}
	@asyncCtrlGenerator.loading('验证码发送中')
	@asyncCtrlGenerator.error('验证码发送出错')
	@asyncCtrlGenerator.success('验证码发送成功')
	sendValidate() {
		const { check_method } = this.formData;
		return this.accountService.sendValidateToCustomer(
			check_method.category,
			check_method.id
		);
	}

	protocolAgree = true;
	toggleProtocolAgree() {
		this.protocolAgree = !this.protocolAgree;
	}
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('添加地址出错')
	@asyncCtrlGenerator.success('地址添加成功')
	async submitAddAddress() {
		const { productInfo } = this;
		const { address, check_method, vcode } = this.formData;
		return this.accountService.createValidate({
			paymentCategory: PaymentCategory.Withdraw,
			paymentType: PaymenType.Other,
			paymentBelong: PaymentBelong.Customer,
			paymentOrganization: productInfo.productId,
			paymentAccountNumber: address,
			code: vcode,
			category: check_method.category
		}).then(()=>{
			this.finishJob(true);
		})
	}
}
