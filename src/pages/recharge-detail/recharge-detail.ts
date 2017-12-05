import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import { AccountServiceProvider } from '../../providers/account-service/account-service';

/**
 * Generated class for the RechargeDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
	selector: 'page-recharge-detail',
	templateUrl: 'recharge-detail.html'
})
export class RechargeDetailPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public accountService: AccountServiceProvider
	) {
		super(navCtrl, navParams);
	}

	recharge_address_list: any[];
	@RechargeDetailPage.willEnter
	@asyncCtrlGenerator.error('获取账户信息出错')
	async getAccountsInfo() {
		const productId = this.navParams.get('productId');
		if (productId) {
			this.recharge_address_list = await this.accountService.getRechargeAddress(
				productId
			);
			return this.recharge_address_list;
		}
	}
}
