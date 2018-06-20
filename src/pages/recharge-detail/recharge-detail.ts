import { Component, ViewChild } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	ViewController,
	InfiniteScroll,
} from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	AccountServiceProvider,
	PaymentCategory,
	ProductModel,
	AccountType,
	CryptoCurrencyModel,
	DealResult,
} from '../../providers/account-service/account-service';
import { StockDataService } from '../../providers/stock-data-service';
import { PromptControlleService } from "../../providers/prompt-controlle-service";
import { BigNumber } from "bignumber.js";
import { AppDataService } from '../../providers/app-data-service';
/**
 * Generated class for the RechargeDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
	selector: 'page-recharge-detail',
	templateUrl: 'recharge-detail.html',
})
export class RechargeDetailPage extends SecondLevelPage {
	private userLanguage:any = 'en';
	constructor(
		public navCtrl: NavController,
		public viewCtrl: ViewController,
		public navParams: NavParams,
		public accountService: AccountServiceProvider,
		public stockDataService: StockDataService,
		public promptCtrl: PromptControlleService,
		public appDataService: AppDataService,
	) {
		super(navCtrl, navParams);
		this.productInfo = this.navParams.get('productInfo');
		this.userLanguage = appDataService.LANGUAGE||"en";
	}
	productInfo: ProductModel = {} as any;
	access_info: any = {} as any;
	recharge_address: CryptoCurrencyModel = {} as any;
	minRechargeText: any = '';
	@RechargeDetailPage.willEnter
	@asyncCtrlGenerator.loading(
		undefined,
		undefined,
		undefined,
		'recharge-detail',
	)
	@asyncCtrlGenerator.error('GAIN_DATA_ERROR')
	async getAccountsInfo() {
		this.productInfo = this.navParams.get('productInfo');
		if (this.productInfo) {
			const tasks = [];
			// 获取地址信息
			tasks[tasks.length] = this.accountService
				.getRechargeAddress(this.productInfo.productHouseId)
				.then(data => (this.recharge_address = data[0]));

			// 获取账户资产
			tasks[tasks.length] = this.accountService
				.getAccountProduct({
					productHouseId: this.productInfo.productHouseId,
					accountType: AccountType.Product,
				})
				.then(data => { 
					data['balance'] = new BigNumber(data['balance']+'').div('100000000').toString();
					data['freezeBalance'] = new BigNumber(data['freezeBalance']+'').div('100000000').toString();
					this.access_info = data
					
				});
			// 获取充值记录
			tasks[tasks.length] = this.getTransactionLogs();
			// 获取充值限额
			tasks[tasks.length] = this._getLimitedQuota();
			const tasks_res = await Promise.all(tasks);
			return tasks_res.reduce((p, c) => ({ ...p, ...c }), {});
		} else {
			this.navCtrl.removeView(this.viewCtrl);
		}
	}

	@asyncCtrlGenerator.success('ADDRESS_HAS_BEEN_COPIED_TO_CLIPBOARD')
	@asyncCtrlGenerator.error('COPY_THE_ADDRESS_FAILED')
	async copyCode() {
		if (!this.recharge_address.paymentAccountNumber) {
			throw new Error(window['language']['NO_AVAILABLE_ADDRESS']||'无可用地址');
		}
		if (!navigator['clipboard']) {
			throw new Error(window['language']['COPY_PLUGIN_ERROR']||'复制插件异常');
		}
		navigator['clipboard'].writeText(
			this.recharge_address.paymentAccountNumber,
		);
	}

	transaction_logs: any[];

	getTransactionLogs() {
		this.recharge_logs_page_info.page = 1;
		return  this._getRechargeLogs().then(
			data => (this.transaction_logs = data),
		);
	}
	recharge_logs_page_info = {
		has_more: true,
		page: 1,
		page_size: 10,
	};
	has_more_recharge_logs = true;
	@ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
	async loadMoreRechargeLogs(ctrl: InfiniteScroll) {
		const { recharge_logs_page_info } = this;
		recharge_logs_page_info.page += 1;
		this.transaction_logs.push(...(await this._getRechargeLogs()));
		ctrl.complete();
	}

	// @asyncCtrlGenerator.error('获取充值限额出错')
	async _getLimitedQuota(){
		return await this.accountService
		.getLimitedQuota(this.productInfo.productId,'001')
		.then(data => {
			this.minRechargeText = '';
			if(data[0] && this.productInfo.productDetail){
				if(data[0].min && data[0].max){
					this.minRechargeText = `${window['language']['RECHARGE_MINI']}${data[0].min}${this.productInfo.productDetail}, ${window['language']['RECHARGE_MAX']}${data[0].max}${this.productInfo.productDetail}, ${window['language']['RECHARGE_ERR_MINI_MAX']}`;
				} else if(data[0].min) {
					this.minRechargeText = `${window['language']['RECHARGE_MINI']}${data[0].min}${this.productInfo.productDetail}, ${window['language']['RECHARGE_ERR_MINI']}`;
				} else if(data[0].max){
					this.minRechargeText = `${window['language']['RECHARGE_MAX']}${data[0].max}${this.productInfo.productDetail}, ${window['language']['RECHATGE_ERR_MAX']}`;
				}
			}
			return data;
		});
	}

	// @asyncCtrlGenerator.error('获取充值记录出错')
	async _getRechargeLogs() {
		const { recharge_logs_page_info } = this;
		const transaction_logs = await this.accountService.getRechargeLogs({
			page: recharge_logs_page_info.page,
			pageSize: recharge_logs_page_info.page_size,
			targetId: this.productInfo.productId,
		});
		recharge_logs_page_info.has_more =
			transaction_logs.length === recharge_logs_page_info.page_size;
		this.infiniteScroll &&
			this.infiniteScroll.enable(recharge_logs_page_info.has_more);
		const formated_transaction_logs = await Promise.all(
			transaction_logs.map(async transaction => {
				const product = await this.stockDataService.getProduct(transaction.targetId);
				const recharge_address_info = await this.accountService.getPaymentById(
					transaction.paymentId,
				);
				if(transaction.amount) transaction.amount = new BigNumber(transaction.amount).div('100000000').toString();
				return Object.assign(transaction, {
					dealResultDetail: AccountServiceProvider.getTransactionStatusDetail(
						transaction.status,
					),
					productDetail: product
						? product.productDetail
							? product.productDetail
							: product.productId
						: '',
					rechargeName: recharge_address_info
						? recharge_address_info.paymentAccountRemark
						: '',
					rechargeAddress: recharge_address_info
						? recharge_address_info.paymentAccountNumber
						: '',
				});
			}),
		);
		console.log('formated_transaction_logs', formated_transaction_logs);
		return formated_transaction_logs;
	}
}
