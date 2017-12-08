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
		this.productInfo = this.navParams.get('productInfo');
	}
	productInfo: ProductModel = {} as any;
	recharge_address: RechargeAddressModel = {} as any;
	@RechargeDetailPage.willEnter
	@asyncCtrlGenerator.loading(
		undefined,
		undefined,
		undefined,
		'recharge-detail'
	)
	@asyncCtrlGenerator.error('获取账户信息出错')
	async getAccountsInfo() {
		this.productInfo = this.navParams.get('productInfo');
		if (this.productInfo) {
			this.recharge_address = await this.accountService.getRechargeAddress(
				this.productInfo.productId
			);
			return this.recharge_address;
		}
	}
	@RechargeDetailPage.willEnter
	@asyncCtrlGenerator.loading(
		undefined,
		undefined,
		undefined,
		'recharge-detail'
	)
	@asyncCtrlGenerator.error('获取账户信息出错')
	async getAccessInfo() {
		// this.accountService.getAcountAssets()
	}

	@asyncCtrlGenerator.success('地址已经成功复制到剪切板')
	async copyCode() {
		navigator['clipboard'].writeText(
			this.recharge_address.paymentAccountNumber
		);
	}

	transaction_logs: any[];
	@RechargeDetailPage.willEnter
	async getTransactionLogs() {
		this.recharge_logs_page_info.page = 0;
		var zz = await this._getRechargeLogs();
		console.log(zz);
		this.transaction_logs = zz;
	}
	recharge_logs_page_info = {
		has_more: true,
		page: 0,
		page_size: 10
	};
	has_more_recharge_logs = true;
	@ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
	async loadMoreRechargeLogs(ctrl: InfiniteScroll) {
		const { recharge_logs_page_info } = this;
		recharge_logs_page_info.page += 1;
		this.transaction_logs.push(...(await this._getRechargeLogs()));
		ctrl.complete();
	}

	@asyncCtrlGenerator.error('获取充值记录出错')
	async _getRechargeLogs() {
		const { recharge_logs_page_info } = this;
		const transaction_logs = await this.accountService.getTransactionLogs(
			recharge_logs_page_info.page,
			recharge_logs_page_info.page_size,
			PaymentCategory.Recharge
		);
		recharge_logs_page_info.has_more =
			transaction_logs.length === recharge_logs_page_info.page_size;
		this.infiniteScroll &&
			this.infiniteScroll.enable(recharge_logs_page_info.has_more);
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
