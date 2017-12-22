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
	AccountType,
	CryptoCurrencyModel,
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
	access_info: any = {} as any;
	recharge_address: CryptoCurrencyModel = {} as any;
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
			const tasks = [];
			// 获取地址信息
			tasks[tasks.length] = this.accountService
				.getRechargeAddress(this.productInfo.productId)
				.then(data => (this.recharge_address = data));

			// 获取账户资产
			tasks[tasks.length] = this.accountService
				.getAccountProduct({
					productId: this.productInfo.productId,
					accountType: AccountType.Product
				})
				.then(data => (this.access_info = data));
			const tasks_res = await Promise.all(tasks);
			return tasks_res.reduce((p, c) => ({ ...p, ...c }), {});
		}
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
		this.recharge_logs_page_info.page = 1;
		var zz = await this._getRechargeLogs();
		console.log(zz);
		this.transaction_logs = zz;
	}
	recharge_logs_page_info = {
		has_more: true,
		page: 1,
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
						? product.productDetail
						: product.productId
					: ''
			});
		});
		console.log('formated_transaction_logs', formated_transaction_logs);
		return formated_transaction_logs;
	}
}
