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
	) {}
	// readonly GET_ACCOUNT_INFO = this.appSetting.APP_URL('aco')
	readonly GET_ACCOUNT_ASSETS = this.appSetting.APP_URL(
		'account/accounts/:id'
	);
	readonly GET_ACCOUNT_PRODUCT = this.appSetting.APP_URL(
		'account/accounts/products'
	);
	readonly GET_CRYPTO_CURRENCY = this.appSetting.APP_URL(
		'account/payment/cryptocurrency'
	);
	readonly GET_PRODUCTS = this.appSetting.APP_URL('product/product');
	readonly GET_TRANSACTION_LOGS = this.appSetting.APP_URL(
		'transaction/externaltransactions'
	);
	readonly ADD_WITHDRAW_ADDRESS = this.appSetting.APP_URL(
		'account/payment/create'
	);
	/** 同ADD_WITHDRAW_ADDRESS，但是这个是提交验证信息的*/
	readonly CREATE_VALIDATE = this.appSetting.APP_URL(
		'account/payment/createvalidate'
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
	);

	readonly GET_AUTHENTICATE_DETAIL = this.appSetting.APP_URL(
		'user/getAuthenticateDetail'
	);
	readonly SEND_VALIDATE_TO_CUSTOMER = this.appSetting.APP_URL(
		'user/validate/customersend'
	);

	getAcountAssets(
		accountId?: string,
		accountType?: string,
		customerId?: string
	) {
		return this.fetch.get(this.GET_ACCOUNT_ASSETS, {
			params: {
				id: accountId
			},
			search: {
				accountType,
				customerId
			}
		});
	}
	getAccountProduct(search: {
		accountId?: string;
		accountType?: AccountType;
		productId?: string;
		customerId?: string;
	}) {
		return this.fetch.get(this.GET_ACCOUNT_PRODUCT, {
			search
		});
	}

	getRechargeAddress(productId: string) {
		return this.fetch
			.autoCache(true)
			.get<CryptoCurrencyModel>(this.GET_CRYPTO_CURRENCY, {
				search: { productId }
			});
	}

	getWithdrawAddress(productId: string) {
		return this.fetch
			.autoCache(true)
			.get<CryptoCurrencyModel[]>(this.GET_CRYPTO_CURRENCY, {
				search: {
					productId,
					paymentCategory: PaymentCategory.Withdraw
				}
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
	withdrawAddressList: AsyncBehaviorSubject<any[]>;
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

	submitCertification(body: {
		type: CertificationCertificateType;
		category: CertificateType;
		value: string /*认证值（证件号码、指纹数据*/;
		pattern: CertificationPatternType;
		collectType: CertificationCollectType;
		name?: string;
		media?: any[];
	}) {
		return this.fetch.post(this.SUBMIT_CERTIFICATION, body);
	}

	getAuthenticateDetail(search?: {
		category?: CertificateType;
		status?: any;
		type?: CertificationCertificateType;
	}) {
		return this.fetch.get<AuthenticationModel[]>(
			this.GET_AUTHENTICATE_DETAIL,
			{
				search
			}
		);
	}

	sendValidateToCustomer(category: CertificateType, authId: string) {
		return this.fetch.post(this.SEND_VALIDATE_TO_CUSTOMER, {
			category,
			authId
		});
	}
	/** 通过验证码创建(绑定)支付账户*/
	createValidate(body: {
		realname?: string;
		paymentCategory: PaymentCategory;
		paymentType: PaymenType;
		paymentBelong: PaymentBelong;
		paymentOrganization: string; // productId
		paymentAccountNumber: string;
		code: string;
		category: CertificateType;
		paymentAccountRemark?: string;
	}) {
		return this.fetch.post(this.CREATE_VALIDATE, body);
	}
}
export enum CertificationCertificateType {
	账号 = '001',
	身份 = '002'
}
export enum CertificationPatternType {
	人工审核 = '001',
	系统自动审核 = '002'
}
export enum CertificationCollectType {
	文本填写 = '001',
	证件照片 = '002',
	证件视频 = '003',
	手持证件照片 = '004',
	现场认证 = '005'
}
export enum PaymenType {
	Bank = '001', // 银行卡
	Alipay = '002', // 支付宝
	WechatPay = '003', // 微信
	SinaPay = '004', // 新浪支付
	IFMT = '005', // IFMT
	BTC = '006', // BTC
	ETH = '007', // ETH
	Other = '999' // 其他
}
export enum PaymentCategory {
	Recharge = '001', // 充值
	Withdraw = '002', // 提现
	Other = '999' // 其他
}
export enum PaymentBelong {
	Platform = '001', // 平台
	Custoemr = '002', // 客户【勿使用，拼写错误】
	Customer = '002', // 客户
	Other = '999' // 其他
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
	BuyProduct = '001', // 购买产品
	SaleProduct = '002', // 卖出产品
	GiveProduct = '003', // 赠送产品
	Other = '999' // 其他
}
export enum TransactionStatus {
	Unpaied = '001', // 待支付
	Paied = '002', // 已支付
	Cancel = '003', // 已取消
	Other = '999' // 其他
}
export enum DealResult {
	Preparing = '001', // 准备中
	InAudit = '002', // 审核中
	InConfirmation = '003', // 确认中
	Finish = '004', // 完成
	Failed = '005', // 失败
	Expired = '006', // 过期
	Other = '999' // 其他
}
export enum AccountType {
	Cash = '001', // 现金账
	Deposit = '002', // 存管账
	Product = '003', // 产品账
	Bail = '004', // 保证金
	Commission = '005', // 佣金账
	Integral = '006', // 积分账
	Interest = '007', // 利息账
	Experience = '008', // 体验金账户
	CryptoCurrency = '009', // 数字货币账户
	Other = '999' // 其他
}
export enum CertificateType {
	手机号 = '001',
	邮箱 = '002',
	指纹 = '003',
	声音 = '004',
	人脸 = '005',
	二代身份证 = '006',
	护照 = '007'
}
export enum BankCode {
	上海银行 = 'BOS',
	中信银行 = 'CITIC',
	中国邮储银行 = 'PSBC',
	中国银行 = 'BOC',
	交通银行 = 'COMM',
	光大银行 = 'CEB',
	兴业银行 = 'CIB',
	农业银行 = 'ABC',
	华夏银行 = 'HXB',
	工商银行 = 'ICBC',
	平安银行 = 'SZPAB',
	广发银行 = 'GDB',
	建设银行 = 'CCB',
	招商银行 = 'CMB',
	民生银行 = 'CMBC',
	浦发银行 = 'SPDB'
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
export type CryptoCurrencyModel = {
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
export type AuthenticationModel = {
	_id: string;
	__v: number;
	createTime: string;
	recordTime: any;
	auditedUserId: string;
	auditTime: any;
	pattern: string;
	reason: string;
	status: string;
	collectType: string;
	media: string;
	endValTime: any;
	beginValTime: any;
	issueAgencies: string;
	address: any[];
	value: string;
	name: string;
	category: CertificateType;
	type: string;
	id: string;
};
