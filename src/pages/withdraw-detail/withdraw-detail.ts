import { Component, ViewChild } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	InfiniteScroll
} from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	AccountServiceProvider,
	PaymentCategory,
	ProductModel,
	RechargeAddressModel,
	DealResult
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
		this.productInfo = this.navParams.get('productInfo');
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


	transaction_logs: any[];
	@WithdrawDetailPage.willEnter
	async getTransactionLogs() {
		this.withdraw_logs_page_info.page = 0;
		var zz = await this._getWithdrawLogs();
		console.log(zz);
		this.transaction_logs = zz;
	}
	withdraw_logs_page_info = {
		has_more: true,
		page: 0,
		page_size: 10
	};
	has_more_withdraw_logs = true;
	@ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
	async loadMoreWithdrawLogs(ctrl: InfiniteScroll) {
		const { withdraw_logs_page_info } = this;
		withdraw_logs_page_info.page += 1;
		this.transaction_logs.push(...(await this._getWithdrawLogs()));
		ctrl.complete();
	}
	@asyncCtrlGenerator.error('获取充值记录出错')
	async _getWithdrawLogs() {
		const { withdraw_logs_page_info } = this;
		const transaction_logs = await this.accountService.getTransactionLogs(
			withdraw_logs_page_info.page,
			withdraw_logs_page_info.page_size,
			PaymentCategory.Withdraw
		);
		withdraw_logs_page_info.has_more =
			transaction_logs.length === withdraw_logs_page_info.page_size;
		this.infiniteScroll &&
			this.infiniteScroll.enable(withdraw_logs_page_info.has_more);
		const productList = await this.accountService.productList.getPromise();
		const formated_transaction_logs = transaction_logs.map(transaction => {
			const product = productList.find(
				product => product.productId === transaction.productId
			);

			return Object.assign(transaction, {
				dealResultDetail: AccountServiceProvider.getDealResultDetail(
					transaction.dealResult
				),
				productDetail: product
					? product.productDetail
					: product.productId
			});
		});
		console.log('formated_transaction_logs', formated_transaction_logs);
		return formated_transaction_logs;
	}
}
