import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	AccountServiceProvider,
	PaymentCategory
} from '../../providers/account-service/account-service';

/**
 * Generated class for the WithdrawDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
	selector: 'page-withdraw-detail',
	templateUrl: 'withdraw-detail.html'
})
export class WithdrawDetailPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public accountService: AccountServiceProvider
	) {
		super(navCtrl, navParams);
	}
	productInfo: any;
	withdraw_address_list: any[];
	@WithdrawDetailPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('获取账户信息出错')
	async getAccountsInfo() {
		this.productInfo = this.navParams.get('productInfo');
		this.withdraw_address_list = await this.accountService.withdrawAddressList.getPromise();
		return this.withdraw_address_list;
	}
}
