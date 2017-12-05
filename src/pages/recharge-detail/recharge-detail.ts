import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	AccountServiceProvider,
	PaymentCategory
} from '../../providers/account-service/account-service';

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
	productInfo:any;
	recharge_address_list: any[];
	@RechargeDetailPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('获取账户信息出错')
	async getAccountsInfo() {
		this.productInfo = this.navParams.get('productInfo');
		if (this.productInfo) {
			this.recharge_address_list = await this.accountService.getRechargeAddress(
				this.productInfo
			);
			return this.recharge_address_list;
		}
	}

	transaction_logs: any[];
	@RechargeDetailPage.willEnter
	@asyncCtrlGenerator.error('获取充值记录出错')
	async getTransactionLogs() {
		this.transaction_logs = await this.accountService.getTransactionLogs(
			0,
			10,
			PaymentCategory.Recharge
		);
		return this.transaction_logs;
	}
}
