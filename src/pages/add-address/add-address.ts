import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	AccountServiceProvider,
	PaymentCategory,
	PaymenType
} from '../../providers/account-service/account-service';

@Component({
	selector: 'page-add-address',
	templateUrl: 'add-address.html'
})
export class AddAddressPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public accountService: AccountServiceProvider
	) {
		super(navCtrl, navParams);
	}

	protocolAgree = true;
	toggleProtocolAgree() {
		this.protocolAgree = !this.protocolAgree;
	}
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('添加地址出错')
	@asyncCtrlGenerator.success('地址添加成功')
	async submitAddAddress() {
		// this.accountService.addWithdrawAddress(PaymentCategory.Withdraw,PaymenType.)
	}
}
