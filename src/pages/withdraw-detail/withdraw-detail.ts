import { Component, ViewChild } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	InfiniteScroll,
	ViewController,
	ModalController,
} from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import { PromiseOut } from '../../bnlc-framework/providers/PromiseExtends';
import {
	AccountType,
	AccountServiceProvider,
	PaymentCategory,
	ProductModel,
	CryptoCurrencyModel,
	TransactionType,
	TransactionModel,
	DealResult,
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
	templateUrl: 'withdraw-detail.html',
})
export class WithdrawDetailPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public viewCtrl: ViewController,
		public navParams: NavParams,
		public accountService: AccountServiceProvider,
		public modalCtrl: ModalController,
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
		password: '',
	};
	errors: any = {};
	@WithdrawDetailPage.setErrorTo('errors', 'amount', ['outRange'])
	checkout_amount() {
		const balance =
			parseFloat(this.access_info && this.access_info.balance) || 0;
		const amount = parseFloat(this.formData.amount) || 0;
		if (amount <= 0 || amount > balance) {
			return { outRange: true };
		}
	}
	// 产品信息
	productInfo: ProductModel;
	// 可用的提现地址列表
	withdraw_address_list: CryptoCurrencyModel[];
	private _withdraw_address_list_promise = new PromiseOut<
		CryptoCurrencyModel[]
	>();

	@WithdrawDetailPage.watchChange(
		(self: WithdrawDetailPage, value: CryptoCurrencyModel) => {
			debugger;
			self.formData.selected_withdraw_address_id = value
				? value.id
				: undefined;
		},
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
			withdraw_address_list,
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
			productInfo: this.productInfo,
		});
	}

	has_account_pwd = false;

	@WithdrawDetailPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('获取交易密码信息出错')
	async checkHasAccountPWD() {
		this.has_account_pwd = await this.accountService.hasAccountPwd.getPromise();
	}

	@WithdrawDetailPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('获取账户信息出错')
	async getAccountsInfo() {
		this.productInfo = this.navParams.get('productInfo');
		if (this.productInfo) {
			const tasks = [];
			// 获取可用的提现地址
			tasks[tasks.length] = this.accountService
				.getWithdrawAddress(this.productInfo.productId)
				.then(data => {
					this.withdraw_address_list = data;
					this._withdraw_address_list_promise.resolve(
						this.withdraw_address_list,
					);
					if (this.selected_withdraw_address) {
						this.selected_withdraw_address = this.withdraw_address_list.find(
							wa => wa.id == this.selected_withdraw_address.id,
						);
						this.formData.selected_withdraw_address_id = this.selected_withdraw_address.id;
					}
				});
			// 获取账户信息
			tasks[tasks.length] = this.accountService
				.getAccountProduct({
					productId: this.productInfo.productId,
					accountType: AccountType.Product,
				})
				.then(data => (this.access_info = data));
			// 获取是否有设置交易密码
			tasks[
				tasks.length
			] = this.accountService.hasAccountPwd
				.getPromise()
				.then(data => (this.has_account_pwd = data));
			// 获取提现记录
			tasks[tasks.length] = this.getTransactionLogs();

			await Promise.all(tasks);
		} else {
			this.navCtrl.removeView(this.viewCtrl);
		}
	}

	get canSubmit() {
		return (
			Object.keys(this.formData).every(k => this.formData[k]) &&
			!this.hasError(this.errors)
		);
	}
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('提现失败')
	@asyncCtrlGenerator.success('提现成功')
	submitWithdrawAppply() {
		return this.accountService
			.submitWithdrawAppply(
				{
					transactionType: TransactionType.WithdrawProduct,
					productId: this.productInfo.productId,
					amount: parseFloat(this.formData.amount),
					paymentId: this.formData.selected_withdraw_address_id + '',
				},
				this.formData.password,
			)
			.then((transaction: TransactionModel) => {
				return this._formatWithdrawLogs([
					transaction,
				]).then(format_transaction_list => {
					const format_transaction = format_transaction_list[0];
					this.transaction_logs.unshift(format_transaction);
					return format_transaction;
				});
			});
	}

	transaction_logs: any[];

	getTransactionLogs() {
		this.withdraw_logs_page_info.page = 1;
		return this._getWithdrawLogs().then(
			data => (this.transaction_logs = data),
		);
	}
	withdraw_logs_page_info = {
		has_more: true,
		page: 1,
		page_size: 10,
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
		const transaction_logs = await this.accountService.getWithdrawLogs({
			page: withdraw_logs_page_info.page,
			pageSize: withdraw_logs_page_info.page_size,
			targetId: this.productInfo.productId,
		});
		withdraw_logs_page_info.has_more =
			transaction_logs.length === withdraw_logs_page_info.page_size;
		this.infiniteScroll &&
			this.infiniteScroll.enable(withdraw_logs_page_info.has_more);

		return this._formatWithdrawLogs(transaction_logs);
	}

	private async _formatWithdrawLogs(transaction_logs: TransactionModel[]) {
		const productList = await this.accountService.productList.getPromise();
		const withdraw_address_list = await this._withdraw_address_list_promise
			.promise;
		const formated_transaction_logs = transaction_logs.map(transaction => {
			const product = productList.find(
				product => product.productId === transaction.targetId,
			);
			const withdraw_address_info = withdraw_address_list.find(
				wa => wa.id + '' == transaction.paymentId,
			);

			return Object.assign(transaction, {
				dealResultDetail: AccountServiceProvider.getTransactionStatusDetail(
					transaction.status,
				),
				productDetail: product
					? product.productDetail
						? product.productDetail
						: product.productId
					: '',
				withdrawName: withdraw_address_info
					? withdraw_address_info.paymentAccountRemark
					: '',
				withdrawAddress: withdraw_address_info
					? withdraw_address_info.paymentAccountNumber
					: '',
			});
		});
		console.log('formated_transaction_logs', formated_transaction_logs);
		return formated_transaction_logs;
	}
}
