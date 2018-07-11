import { Component, ViewChild } from "@angular/core";
import {
	IonicPage,
	NavController,
	NavParams,
	InfiniteScroll,
	ViewController,
	ModalController,
	AlertController
} from "ionic-angular";
import { SecondLevelPage } from "../../bnlc-framework/SecondLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
import { PromiseOut } from "../../bnlc-framework/providers/PromiseExtends";
import {
	AccountType,
	AccountServiceProvider,
	PaymentCategory,
	ProductModel,
	CryptoCurrencyModel,
	TransactionType,
	TransactionModel,
	DealResult,
	RateMainType,
} from "../../providers/account-service/account-service";
import { WithdrawAddressListPage } from "../withdraw-address-list/withdraw-address-list";
import { AddAddressPage } from "../add-address/add-address";
import { CommonAlert } from "../../components/common-alert/common-alert";
import { StockDataService } from "../../providers/stock-data-service";
import { PromptControlleService } from "../../providers/prompt-controlle-service";
import { PersonalDataService } from '../../providers/personal-data-service';

import { BigNumber } from "bignumber.js";
import { CryptoService } from "../../providers/crypto-service";
/**
 * Generated class for the WithdrawDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
	selector: "page-withdraw-detail",
	templateUrl: "withdraw-detail.html",
})
export class WithdrawDetailPage extends SecondLevelPage {
	public freeSwitch:boolean = true;
	constructor(
		public navCtrl: NavController,
		public viewCtrl: ViewController,
		public navParams: NavParams,
		public accountService: AccountServiceProvider,
		public stockDataService: StockDataService,
		public modalCtrl: ModalController,
		public alertCtrl: AlertController,
		public promptCtrl: PromptControlleService,
		public personalDataService: PersonalDataService,
		public cryptoService: CryptoService,
	) {

		super(navCtrl, navParams);
		BigNumber.config({ EXPONENTIAL_AT: [-8, 20] })
		this.productInfo = this.navParams.get("productInfo");
		// this.alertCtrl.create({
		// 	title: "提示",
		// 	message: "提现功能暂时关闭",
		// 	buttons: [
		// 		{
		// 			text: "确定",
		// 			handler: () => {
					
		// 			}
		// 		}
		// 	]
		// }).present();
		
	}
	formData: {
		selected_withdraw_address_id: number;
		amount: string;
		password: string;
	} = {
		selected_withdraw_address_id: undefined,
		amount: "",
		password: "",
	};
	errors: any = {};
	promptLimit: any = {
		title1:window['language']['NO_WITHDRAWAL_AMOUNT']||'没有提现金额限制',
		title2:''
	};
	promptAmount:any = {
		min: undefined,
		max: undefined
	}

	@WithdrawDetailPage.setErrorTo("errors", "amount", ["outRange"])
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

	@WithdrawDetailPage.watchChange(
		(self: WithdrawDetailPage, value: CryptoCurrencyModel) => {
			self.formData.selected_withdraw_address_id = value
				? value.id
				: undefined;
		},
	)
	selected_withdraw_address: CryptoCurrencyModel;
	access_info: any;
	openWithdrawAddressSelector() { 
		const { withdraw_address_list, productInfo } = this;
		console.log('目前的   withdraw_address_list 暂时未刷新')
		console.log(withdraw_address_list)
		const selector = this.modalCtrl.create(WithdrawAddressListPage, {
			title: window['language']['WITHDRAWAL_ADDRESS_MANAGEMENT']||"提现地址管理",
			productInfo,
			selected_data:
				this.selected_withdraw_address &&
				this.selected_withdraw_address.id,
			withdraw_address_list, 
		});
		selector.onWillDismiss(data => {
			console.log("selected result:", data);
			this.selected_withdraw_address = data.selected_data;
			if (data.withdraw_address_list) {
				this.withdraw_address_list = data.withdraw_address_list;
			}
		});
		selector.present();
	}
	toAddWithdrawAddress() {
		// return this.routeTo("add-address", {
		// 	productInfo: this.productInfo,
		// });
		const selector = this.modalCtrl.create(AddAddressPage, {
			productInfo: this.productInfo,
		});
		selector.onDidDismiss(returnData => {
			this.selected_withdraw_address = returnData ? returnData : null;
			this.accountService
				.getWithdrawAddress(this.productInfo.productId)
				.then(data => {
					this.withdraw_address_list = data;
				});
		  });
		selector.present();
	}


	//取消提现订单弹出确认窗
	cancelWithdrawModal(transactionId?:string,id?:number) {
		let modal = this.alertCtrl.create({
			title: window['language']['CANCEL_ORDER']||'取消订单',
			message: window['language']['WITHDRAWAL_ORDER']||'确定取消这条提现订单吗？',
			buttons: [
				{
					text: window['language']['CANCEL']||'取消',
					handler: () => {
					
					}
				},
				{
					text:  window['language']['COFIRM']||'确定',
					cssClass:'cancel-btn-confirm',
					handler: () => {
						this.cancelWithdrawAppply(transactionId,id)
					}
				}
			]
		});
		modal.present();
	}

	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error("CANCEL_FAIL")
	@asyncCtrlGenerator.success("CANCEL_SUCCESSFULLY")
	cancelWithdrawAppply(transactionId?:string,id?:number) {
		return this.accountService
			.cancelWithdrawAppply(
				{
					transactionId: transactionId,
					id: id,
					status: '005',
					freeze: 'true',
				} 
				
			)
			.then((data) => {
				
				return  this.getTransactionLogs()

			})
			.then( () => {
				return this.accountService
				.getAccountProduct({
					productHouseId: this.productInfo.productHouseId,
					accountType: AccountType.Product,
				})
				.then(data => {
					this.access_info = data;
					this.access_info.balance = (new BigNumber(''+this.access_info.balance||'0')).toString()
				});
			})
			.catch(err => {
				this.getTransactionLogs()
				return Promise.reject(err)
			});
	}





	//自定义弹窗(modal->alert)
	describeModal() {
		let modal = this.modalCtrl.create(CommonAlert, {
			title1: this.promptLimit.title1,
			title2: this.promptLimit.title2
		}, { showBackdrop: true, enableBackdropDismiss: true });
		modal.present();
	  }

	has_account_pwd = false;

	@WithdrawDetailPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error("GAIN_TRANSACTION_PASSWORD_ERROR")
	async checkHasAccountPWD() {
		this.has_account_pwd = await this.accountService.hasAccountPwd.getPromise();
	}

	@WithdrawDetailPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error("GAIN_DATA_ERROR") 
	async getAccountsInfo() {
		this.productInfo = this.navParams.get("productInfo");
		if (this.productInfo) {
			const tasks = [];
			// 获取可用的提现地址 
			tasks[tasks.length] = this.accountService
				.getWithdrawAddress(this.productInfo.productId) 
				.then(data => {
					this.withdraw_address_list = data;
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
					productHouseId: this.productInfo.productHouseId,
					accountType: AccountType.Product,
				}) 
				.then(data => {
					this.access_info = data;
					this.access_info.balance = (new BigNumber(''+this.access_info.balance||'0')).toString()
				});
			// 获取是否有设置交易密码
			tasks[
				tasks.length
			] = this.accountService.hasAccountPwd
				.getPromise()
				.then(data => (this.has_account_pwd = data));
			// 获取提现记录
			tasks[tasks.length] = this.getTransactionLogs(); 
			// 获取手续费
			tasks[tasks.length] = this.accountService
				.getProductRate(this.productInfo.productId, {
					rateMainType: RateMainType.withdraw,
				})
				.then(data => {
					console.log("手续费：", data);
					if(data && data[0]){
						data[0].rateNumber = data[0].calcMethodType === '001' ? `${data[0].rateNumber * 100}%` :
							data[0].calcMethodType === '002' ? `${data[0].rateNumber}` : '';
						this.freeSwitch =  data[0].calcMethodType === '001' ? false:
							data[0].calcMethodType === '002' ? true : true;

					} 
					this.rate_info = data[0];
					console.log(this.productInfo)
				});
			// 获取提现限额
			tasks[tasks.length] = this.accountService
				.getLimitedQuota(this.productInfo.productId,'002')
				.then(data => {

					let limitedQuota:any = data[0]
	
					
					//多种情况提示语
					if(limitedQuota){
						if(!limitedQuota['min'] && !limitedQuota['max']){
							this.promptLimit.title1 = window['language']["NO_WITHDRAWAL_AMOUNT"]||'没有提现金额限制';
							this.promptLimit.title2 = '';
						}else if(limitedQuota['min'] && !limitedQuota['max']){
							this.promptLimit.title1 =(window['language']['EACH_WITHDRAWAL_AMOUNT_NOT_LESS_THAN']||'单次提现金额不得小于')+limitedQuota['min']+this.productInfo.productName;
							this.promptLimit.title2 = '';
							this.promptAmount.min = limitedQuota['min']
						} else if(!limitedQuota['min'] && limitedQuota['max']){
							this.promptLimit.title1 = (window['language']['EACH_WITHDRAWAL_AMOUNT_NOT_BIGGER_THAN']||'单次提现金额不得大于')+limitedQuota['max']+this.productInfo.productName;
							this.promptLimit.title2 = '';
							this.promptAmount.max = limitedQuota['max']
						} else{
							this.promptLimit.title1 = (window['language']['EACH_WITHDRAWAL_AMOUNT_1']||'单次提现金额不得小于')+limitedQuota['min']+this.productInfo.productName;
							this.promptLimit.title2 = (window['language']['EACH_WITHDRAWAL_AMOUNT_2']||'不得大于')+limitedQuota['max']+this.productInfo.productName;
							this.promptAmount.min = limitedQuota['min']
							this.promptAmount.max = limitedQuota['max']
						}
					} else {
						this.promptLimit.title1 = window['language']["NO_WITHDRAWAL_AMOUNT"]||'没有提现金额限制';
							this.promptLimit.title2 = '';
					}
					
				});
			await Promise.all(tasks).then(() =>{
					setTimeout(() => {
						this.validateIdentify();
					}, 600);
			});
		} else {
			this.navCtrl.removeView(this.viewCtrl);
		}
	}
	rate_info: any = {};

	get canSubmit() {
		return (
			Object.keys(this.formData).every(k => this.formData[k]) &&
			!this.hasError(this.errors)
		);
	}
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error("WITHDRAW_FAIL")
	@asyncCtrlGenerator.success("WITHDRAW_SUCCESS")
	async submitWithdrawAppply() {
		await this.personalDataService.requestCertifiedStatus();
		if( !(this.personalDataService.certifiedStatus == '2') ){
			return Promise.reject(new Error(`${window['language']['VERIFICATION']||'实名认证'}：${this.personalDataService.realname|| this.personalDataService.certifiedMsg}`));
		} 
		return this.accountService
			.submitWithdrawAppply(
				{
					transactionType: TransactionType.WithdrawProduct,
					productId: this.productInfo.productId,
					amount: new BigNumber(this.formData.amount).toString(), 
					paymentId: this.formData.selected_withdraw_address_id + "",
				},
				this.cryptoService.MD5(this.formData.password),
			)
			.then((transaction: TransactionModel) => {
				
				return this._formatWithdrawLogs([
					transaction,
				]).then(format_transaction_list => {
		
					
					const format_transaction = format_transaction_list[0];
					this.transaction_logs.unshift(format_transaction);
					this.formData.amount = '';
					this.formData.password = '';
					
					return format_transaction;
				}).then(transaction => {
					return this.accountService
					.getAccountProduct({
						productHouseId: this.productInfo.productHouseId,
						accountType: AccountType.Product,
					})
					.then(data => {
						this.access_info = data;
						this.access_info.balance = (new BigNumber(''+this.access_info.balance||'0')).toString()
						return transaction;
					})
				});
			});
	}

	transaction_logs: any[];

	getTransactionLogs() {
		this.withdraw_logs_page_info.page = 1;
		return this._getWithdrawLogs().then(
			data => {
				 
				this.transaction_logs = data
			}
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
	// @asyncCtrlGenerator.error("获取充值记录出错")
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
		let productHouseId:string = this.productInfo.productHouseId;
		const formated_transaction_logs = await Promise.all(
			transaction_logs.map(async transaction => {
				if(transaction.productHouseId) productHouseId = transaction.productHouseId;
				const product = await this.stockDataService.getProduct(transaction.productHouseId||productHouseId);
				
				const withdraw_address_info = await this.accountService.getPaymentById(
					transaction.paymentId,
				);
				
				if(transaction.amount) transaction.amount = new BigNumber(transaction.amount).toString();
				return Object.assign(transaction, {
					dealResultDetail: AccountServiceProvider.getTransactionStatusDetail(
						transaction.status,
					),
					productDetail: product
						? product.productName
							? product.productName
							: product.productHouseId
						: '',
					withdrawName: withdraw_address_info
						? withdraw_address_info.paymentAccountRemark
						: "",
					withdrawAddress: withdraw_address_info
						? withdraw_address_info.paymentAccountNumber
						: "",
				});
			}),
		);
		
		console.log("formated_transaction_logs", formated_transaction_logs);
		return formated_transaction_logs;
	}


	//做个控制，避免回来后又弹出消息
	private validateId:boolean = true;
	async validateIdentify(){
		if(!(this.personalDataService.certifiedStatus == '2') && this.validateId){
			await this.personalDataService.requestCertifiedStatus(); 
		  }
		if(this.personalDataService.certifiedStatus == '2'  || !this.validateId ){
			return ;
		}
		let options:any = {};
		//title 不能设置在初始化中，会没掉
		if( this.personalDataService.certifiedStatus == '0'|| this.personalDataService.certifiedStatus == '3' ){
			alert['title'] = `${window['language']['REAL_NAME_AUTHENTICATION']||'实名认证'}`;
			alert['subTitle'] = `${this.personalDataService.realname || this.personalDataService.certifiedMsg}`;
			alert['buttons'] = [
				{
					text: window['language']['CANCEL']||'取消',
					role: 'cancel',
					handler: () => {
						// console.log('Cancel clicked')
					}
				},
				{
					text: window['language']['VERIFICATION_1']||'认证',
					handler: () => {
						this.routeTo('submit-real-info').then(e =>{
							this.validateId = false;
						})
					}
				}
			];
		} 
		if( this.personalDataService.certifiedStatus == '1'){
			alert['title'] = `${window['language']['REAL_NAME_AUTHENTICATION']||'实名认证'}`;
			alert['subTitle'] = `${this.personalDataService.realname|| this.personalDataService.certifiedMsg}`;
			alert['buttons'] = [
				{
					text:  window['language']['CONFIRM']||'确认',
					role: 'cancel',
					handler: () => {
						// console.log('Cancel clicked')
					}
				}
			];
		}
		alert['cssClass'] = 'trade-alert-color';
		// 避免空白提示
		if(!(JSON.stringify(alert) == "{}")){
			this.alertCtrl.create(
				Object.assign(
					alert
				)
			).present();
		}
	}


}
