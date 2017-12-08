import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {
	AppSettingProvider,
	TB_AB_Generator
} from '../../bnlc-framework/providers/app-setting/app-setting';
import { AppFetchProvider } from '../../bnlc-framework/providers/app-fetch/app-fetch';
import { AsyncBehaviorSubject } from '../../bnlc-framework/providers/RxExtends';

/*
  Generated class for the AccountServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AccountServiceProvider {
	constructor(
		public http: Http,
		public appSetting: AppSettingProvider,
		public fetch: AppFetchProvider
	) { }
	readonly GET_ACCOUNT_ASSETS = this.appSetting.APP_URL(
		'account/accounts/assets'
	);
	readonly GET_RECHARGE_ADDRESS = this.appSetting.APP_URL(
		'account/payment/cryptocurrency'
	);
	readonly GET_PRODUCTS = this.appSetting.APP_URL('product/product');
	readonly GET_TRANSACTION_LOGS = this.appSetting.APP_URL(
		'transaction/externaltransactions'
	);
	readonly ADD_WITHDRAW_ADDRESS = this.appSetting.APP_URL(
		'account/payment/create'
	);
	readonly GET_WITHDRAW_ADDRESS_TYPE_LIST = this.appSetting.APP_URL(
		'account/paymenttypelist'
	);
	readonly GET_WITHDRAW_ADDRESS_DETAIL = this.appSetting.APP_URL(
		'account/payments/type/:type'
	);
	readonly SUBMIT_WITHDRAW_APPPLY = this.appSetting.APP_URL(
		'transaction/externaltransactions/withdraw'
	);

	readonly SUBMIT_CERTIFICATION = this.appSetting.APP_URL(
		'user/addCertification'
	)

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
		return this.fetch.get<RechargeAddressModel>(this.GET_RECHARGE_ADDRESS, {
			search: { productId }
		});
	}

	productList: AsyncBehaviorSubject<ProductModel[]>;
	@TB_AB_Generator('productList')
	productList_Executor(promise_pro) {
		return promise_pro.follow(this.getProducts(0, 30));
	}

	getProducts(
		page: number,
		pageSize: number = 10,
		productType?: ProductType,
		productStatus?: ProductStatus,
		productName?: string,
		productIdArr?: string
	) {
		return this.fetch.post<ProductModel[]>(this.GET_PRODUCTS, {
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
		paymentCategory?: PaymentCategory,
		dealResult?: DealResult,
		externalTransactionId?: string,
		expiredAt?: string
	) {
		return this.fetch.get<any[]>(this.GET_TRANSACTION_LOGS, {
			search: {
				page,
				pageSize,
				paymentCategory,
				dealResult,
				externalTransactionId,
				expiredAt
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
	withdrawAddressTypeList: AsyncBehaviorSubject<
		{ name: string; type: string }[]
		>;
	@TB_AB_Generator('withdrawAddressTypeList')
	withdrawAddressTypeList_Executor(promise_pro) {
		return promise_pro.follow(this.getWithdrawAddressTypeList());
	}
	getWithdrawAddressTypeList() {
		return this.fetch
			.get<any>(this.GET_WITHDRAW_ADDRESS_TYPE_LIST)
			.then(dict => {
				const res = [];
				for (let name in dict) {
					res.push({
						name,
						type: dict[name]
					});
				}
				return res;
			});
	}
	withdrawAddressList: AsyncBehaviorSubject<
		any[]
		>;
	@TB_AB_Generator('withdrawAddressList')
	withdrawAddressList_Executor(promise_pro) {
		return promise_pro.follow(this.getWithdrawAddressList());
	}
	getWithdrawAddressList() {
		return this.getWithdrawAddressTypeList().then(type_list => {
			return Promise.all(
				type_list.map(type => this.getWithdrawAddressDetail(type))
			);
		});
		// return this.fetch
		// 	.get<any[]>(this.GET_WITHDRAW_ADDRESS_TYPE_LIST)
		// 	.then(type_list =>
		// 		Promise.all(
		// 			type_list.map(type => this.getWithdrawAddressDetail(type))
		// 		)
		// 	);
	}
	getWithdrawAddressDetail(type: string) {
		return this.fetch.get(this.GET_WITHDRAW_ADDRESS_DETAIL, {
			params: type
		});
	}
	submitWithdrawAppply() {
		return this.fetch.post(this.SUBMIT_WITHDRAW_APPPLY);
	}

	static getDealResultDetail(dealResult: DealResult) {
		if (dealResult == DealResult.Preparing) return '准备中';
		if (dealResult == DealResult.InAudit) return '审核中';
		if (dealResult == DealResult.InConfirmation) return '确认中';
		if (dealResult == DealResult.Finish) return '完成';
		if (dealResult == DealResult.Failed) return '失败';
		if (dealResult == DealResult.Expired) return '过期';
		if (dealResult == DealResult.Other) return '其他';
	}

	submitCertification(certificateNo: string, certificateType: CertificateType, mediaMessage?: string[], realName?: string) {
		this.fetch.post(this.SUBMIT_CERTIFICATION, {
			certificateNo,
			certificateType
		})
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
export enum TransactionType {
	/**
     * 购买产品
     */
	BuyProduct = '001',
	/**
     * 卖出产品
     */
	SaleProduct = '002',
	/**
     * 赠送产品
     */
	GiveProduct = '003',
	// /**
	//  * 现金提现(注：现金提现在外部交易表中)
	//  */
	// DrawCash='004',

	/**
     * 其他
     */
	Other = '999'
}
export enum TransactionStatus {
	/**
     * 待支付
     */
	Unpaied = '001',
	/**
     * 已支付
     */
	Paied = '002',
	/**
     * 已取消
     */
	Cancel = '003',

	/**
     * 其他
     */
	Other = '999'
}
export enum DealResult {
	/**
     * 准备中
     */
	Preparing = '001',

	/**
     * 审核中
     */
	InAudit = '002',

	/**
     * 确认中
     */
	InConfirmation = '003',

	/**
     * 完成
     */
	Finish = '004',

	/**
     * 失败
     */
	Failed = '005',

	/**
     * 过期
     */
	Expired = '006',

	/**
     * 其他
     */
	Other = '999'
}
export enum CertificateType {
	二代身份证 = '101',
	护照 = '102',
}
export type ProductModel = {
	_id: string;
	productId: string;
	productHouseId: string;
	platformType: string;
	productName: string;
	productCover: string;
	productDetail: string;
	priceId: string;
	limitedPriceId: string;
	bonusId: string;
	commissionId: string;
	rateId: string;
	interestId: string;
	issuePrice: number;
	issueQuantity: number;
	remainQuantity: number;
	participants: number;
	issueDate: string;
	productStatus: string;
	crtUserId: string;
	lstModUserId: string;
	lstModDateTime: string;
	crtDateTime: string;
	transactionObjectId: string[];
	agreementId: string[];
	cryptoCurrencyCode: string;
};
export type RechargeAddressModel = {
	id: number;
	customerId: string;
	realname: any;
	paymentCategory: string;
	paymentType: string;
	paymentBelong: string;
	paymentOrganization: string;
	paymentAccountNumber: string;
	paymentAccountRemark: string;
	bindAt: string;
	bindStatus: string;
	unbindAt: any;
	createdAt: string;
	updatedAt: string;
};
