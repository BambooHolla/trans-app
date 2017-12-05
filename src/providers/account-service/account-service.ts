import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AppSettingProvider } from '../../bnlc-framework/providers/app-setting/app-setting';
import { AppFetchProvider } from '../../bnlc-framework/providers/app-fetch/app-fetch';

/*
  Generated class for the AccountServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AccountServiceProvider {
	constructor(
		public http: Http,
		public appSeting: AppSettingProvider,
		public fetch: AppFetchProvider
	) {}
	readonly GET_ACCOUNT_ASSETS = this.appSeting.APP_URL(
		'account/accounts/assets'
	);
	readonly GET_RECHARGE_ADDRESS = this.appSeting.APP_URL(
		'account/payment/cryptocurrency'
	);
	readonly GET_PRODUCTS = this.appSeting.APP_URL('product/product');
	readonly GET_TRANSACTION_LOGS = this.appSeting.APP_URL(
		'transaction/externaltransactions'
	);
	readonly ADD_WITHDRAW_ADDRESS = this.appSeting.APP_URL(
		'account/payment/create'
	);
	readonly GET_WITHDRAW_ADDRESS_DETAIL = this.appSeting.APP_URL(
		'account/payments/type/:type'
	);
	readonly SUBMIT_WITHDRAW_APPPLY = this.appSeting.APP_URL(
		'transaction/externaltransactions/withdraw'
	);

	getAcountAssets(
		accountId?: string,
		accountType?: string,
		customerId?: string
	) {
		return this.fetch.get(this.GET_ACCOUNT_ASSETS, {
			search: {
				accountId,
				accountType,
				customerId
			}
		});
	}

	getRechargeAddress(productId: string) {
		return this.fetch.get<any[]>(this.GET_RECHARGE_ADDRESS, {
			search: { productId }
		});
	}
	getProducts(
		page: number,
		pageSize: number = 10,
		productType?: ProductType,
		productStatus?: ProductStatus,
		productName?: string,
		productIdArr?: string
	) {
		return this.fetch.post<any[]>(this.GET_PRODUCTS, {
			page,
			pageSize,
			productType,
			productStatus,
			productName,
			productIdArr
		});
	}
	getTransactionLogs(
		page?: number,
		pageSize?: number,
		customerId?: string,
		accountId?: string,
		transactionType?: string,
		targetId?: string,
		status?: string
	) {
		return this.fetch.get(this.GET_TRANSACTION_LOGS, {
			search: {
				page,
				pageSize,
				customerId,
				accountId,
				transactionType,
				targetId,
				status
			}
		});
	}
	addWithdrawAddress(
		paymentCategory: PaymentCategory,
		paymentType: PaymenType,
		paymentBelong: PaymentBelong,
		paymentOrganization: string,
		paymentAccountNumber: string,
		realname?: string,
		paymentAccountRemark?: string
	) {
		return this.fetch.post(this.ADD_WITHDRAW_ADDRESS, {
			paymentCategory,
			paymentType,
			paymentBelong,
			paymentOrganization,
			paymentAccountNumber,
			realname,
			paymentAccountRemark
		});
	}
	getWithdrawAddressDetail(type: string) {
		return this.fetch.get(this.GET_WITHDRAW_ADDRESS_DETAIL, {
			params: type
		});
	}
	submitWithdrawAppply() {
		return this.fetch.post(this.SUBMIT_WITHDRAW_APPPLY);
	}
}

export enum PaymenType {
	/**
     * 银行卡
     */
	Bank = '001',
	/**
     * 支付宝
     */
	Alipay = '002',
	/**
     * 微信
     */
	WechatPay = '003',

	/**
     * 新浪支付
     */
	SinaPay = '004',

	/**
     * IFMT
     */
	IFMT = '005',

	/**
     * BTC
     */
	BTC = '006',

	/**
     * ETH
     */
	ETH = '007',

	/**
     * 其他
     */
	Other = '999'
}
export enum PaymentCategory {
	/**
     * 充值
     */
	Recharge = '001',

	/**
     * 提现
     */
	Withdraw = '002',

	/**
     * 其他
     */
	Other = '999'
}
export enum PaymentBelong {
	/**
     * 平台
     */
	Platform = '001',

	/**
     * 客户【勿使用，拼写错误】
     */
	Custoemr = '002',

	/**
     * 客户
     */
	Customer = '002',

	/**
     * 其他
     */
	Other = '999'
}

export enum ProductType {
	//高交所产品类型 1开头

	//币加所产品类型 2开头

	//本能理财产品类型 3开头
	'bnlc_main' = '301', //首页主产品
	'bnlc_increaseInterest' = '302', //加息计划

	'others' = '999' //"其他"
}
export enum ProductStatus {
	'suspension' = '001', //"已下架/停牌",
	'tradable' = '002', //"已上架/可交易",
	'others' = '999' //"其他"
}
