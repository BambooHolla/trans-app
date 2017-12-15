import { Component, ViewChild } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	InfiniteScroll,
	ViewController,
	ModalController
} from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	AccountType,
	AccountServiceProvider,
	PaymentCategory,
	ProductModel,
	CryptoCurrencyModel,
	TransactionType,
	DealResult
} from '../../providers/account-service/account-service';
import { WithdrawAddressListPage } from '../withdraw-address-list/withdraw-address-list';

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
		public viewCtrl: ViewController,
		public navParams: NavParams,
		public accountService: AccountServiceProvider,
		public modalCtrl: ModalController
	) {
		super(navCtrl, navParams);
		this.productInfo = this.navParams.get('productInfo');
	}
	formData: {
		selected_withdraw_address_id: number;
		amount: string;
		password: string;
	} = {
		selected_withdraw_address_id: undefined,
		amount: '',
		password: ''
	};
	productInfo: ProductModel;
	withdraw_address_list: CryptoCurrencyModel[];

	@WithdrawDetailPage.watchChange(
		(self: WithdrawDetailPage, value: CryptoCurrencyModel) => {
			debugger;
			self.formData.selected_withdraw_address_id = value
				? value.id
				: undefined;
		}
	)
	selected_withdraw_address: CryptoCurrencyModel;
	access_info: any;
	openWithdrawAddressSelector() {
		const { withdraw_address_list, productInfo } = this;
		const selector = this.modalCtrl.create(WithdrawAddressListPage, {
			title: '请选择提现地址',
			productInfo,
			selected_data:
				this.selected_withdraw_address &&
				this.selected_withdraw_address.id,
			withdraw_address_list
		});
		selector.onWillDismiss(data => {
			console.log('selected result:', data);
			this.selected_withdraw_address = data.selected_data;
			if (data.withdraw_address_list) {
				this.withdraw_address_list = data.withdraw_address_list;
			}
		});
		selector.present();
	}
	toAddWithdrawAddress() {
		return this.routeTo('add-address', {
			productInfo: this.productInfo
		});
	}

	@WithdrawDetailPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('获取账户信息出错')
	async getAccountsInfo() {
		this.productInfo = this.navParams.get('productInfo');
		if (this.productInfo) {
			const tasks = [];
			tasks[tasks.length] = this.accountService
				.getWithdrawAddress(this.productInfo.productId)
				.then(data => {
					this.withdraw_address_list = data;
				});
			tasks[tasks.length] = this.accountService
				.getAccountProduct({
					productId: this.productInfo.productId,
					accountType: AccountType.Product
				})
				.then(data => (this.access_info = data));
			await Promise.all(tasks);
		} else {
			this.navCtrl.removeView(this.viewCtrl);
		}
	}

	get canSubmit() {
		return Object.keys(this.formData).every(k => this.formData[k]);
	}
	submitWithdrawAppply() {
		this.accountService.submitWithdrawAppply({
			transactionType: TransactionType.WithdrawProduct,
			productId: this.productInfo.productId,
			price: 0,
			amount: parseFloat(this.formData.amount),
			password: this.formData.password,
			paymentId: this.formData.selected_withdraw_address_id
		});
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
