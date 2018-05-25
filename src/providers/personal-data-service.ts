import { Injectable } from '@angular/core';

import { Http, RequestMethod, URLSearchParams } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// import { Subscription } from 'rxjs/Subscription';

// import * as moment from 'moment';

import { AppSettings } from './app-settings';
import { AppDataService } from './app-data-service';
import { StockDataService } from './stock-data-service';
import { LoginService } from './login-service';
// import { SocketioService } from './socketio-service';
import { HttpService } from './http-service';
import { AppService } from './app.service';

@Injectable()
export class PersonalDataService {
  private _idcardnumber: string = ''
  public get idcardnumber() {
    return this._idcardnumber;
  }
  private _fundingAccount = '';

  public get fundingAccount(){
    return this._fundingAccount;
  }

  private _accountStatus = 0;

  public get accountStatus(){
    return this._accountStatus;
  }

  private _realname = '';

  public get realname(){
    return this._realname;
  }

  private _certifiedStatus = '';

  public get certifiedStatus() {
    return this._certifiedStatus;
  }

  private _certifiedMsg = ''

  public get certifiedMsg() {
    return this._certifiedMsg;
  }

  private _fullname = '';

  public get fullname(){
    return this._fullname;
  }

  private _address = '';

  public get address(){
    return this._address;
  }

  private _email = '';

  public get email(){
    return this._email;
  }
  private _assets = 0;

  public get assets() {
    return this._assets;
  }

  private _accountBalance = 0;

  public get accountBalance() {
    return this._accountBalance;
  }

  private _phone = '';

  public get phone(){
    return this._phone;
  }

  private _mobile = '';

  public get mobile(){
    return this._mobile;
  }

  private _recommendCode = '';

  public get recommendCode(){
    return this._recommendCode;
  }

  private _relatedBankAccount = {
    bankName:'',
    cardNo:'',
    bankIconURL:'',
  }

  public get relatedBankAccount() {
    return this._relatedBankAccount
  }

  private _personalStockList: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public personalStockList$: Observable<any[]> = this._personalStockList
        .asObservable()
        // .filter(data => Array.isArray(data))
        // 需要测试 distinctUntilChanged 对数组是否有效！
        .distinctUntilChanged();

  public get personalStockList():any[] {
    // return this._status;
    return this._personalStockList.getValue();
  }

  private _personalStockListIsNull: BehaviorSubject<boolean> = new BehaviorSubject(undefined);
  personalStockListIsNull$: Observable<boolean> = this._personalStockListIsNull
        .asObservable()
        .distinctUntilChanged();

  public get personalStockListIsNull(){
    return this._personalStockListIsNull.getValue();
  }


  constructor(
    public http: Http,
    public appSettings: AppSettings,
    public appDataService: AppDataService,
    public appService: AppService,
    public stockDataService: StockDataService,
    // public socketioService: SocketioService,
    public loginService: LoginService,
    public httpService: HttpService,
  ){
    // this.subscribePersonalStockListChanged();
    this.initSubscribers();
  }

  subscribePersonalStockListChanged() {
    // this.personalStockList$
    //   .subscribe(list => {
    //     console.log('personalStockList$', list);
    //     list.forEach(({stockCode}) => {
    //       this.stockDataService.requestStockBaseData(stockCode);
    //     })
    //   })
  }

  initSubscribers() {
    this.loginService.status$.subscribe(status => {
      if (status) {
        this.requestPersonalData();
      } else {
        this.resetData();
      }
    })
  }

  resetData(){
    this._fundingAccount = '';
    this._accountStatus = 0;
    this._realname = '';
    this._fullname = '';
    this._address = '';
    this._email = '';
    this._accountBalance = 0;
    this._assets = 0;
    this._phone = '';
    this._mobile = '';
    this._idcardnumber = '';
    this._certifiedStatus = '';
    this._certifiedMsg = '';

    this._personalStockList.next([]);
    this._personalStockListIsNull.next(undefined);
  }

  requestPersonalData(){
    this.requestCustomerData()
      .catch(err => {});

    this.requestFundData()
      .catch(err => {});

    this.requestEquityDeposit()
      .catch(err => {});

    this.requestCertifiedStatus()
      .catch(err => { });

    //币加所暂无银行账户概念
    // this.requestBankAccount()
    //   .catch(err => {})
  }

  requestCustomerData(): Promise<any> {
    if (this.appSettings.SIM_DATA){
      this.parseCustomerData({
        FID_KHZT: 0,
        FID_KHXM: '测试号',
        FID_KHQC: '测试号',
        FID_DH: '13760045001',
        FID_MOBILE: '13760045001',
        FID_DZ: '',
        FID_EMAIL: '',
      });

      return Promise.resolve();
    }

    const path = `/user/getCustomersData`
    return this.appService.request(RequestMethod.Get, path, undefined, true)
      .then(data => {
        console.log('getCustomersData: ', data);
        if (!data) {
          return Promise.reject(new Error('data missing'));
        }
        // 返回数据格式为数组，暂时只使用数组第一组元素。
        this.parseCustomerData(data);
      })
      .catch(err => {
        console.log('getCustomersData error: ', err);
        // return Promise.reject(err);
      });
  }

  requestCertifiedStatus(){
    const path = `/user/getAuthStatus`
    const params = new URLSearchParams()
    params.set('category', '006,007')//001手机号、002邮箱、003指纹、004声音、005人脸、006二代身份证、007护照
    params.set('type', '002')//类别 001 账号 002 身份

    return this.appService.request(RequestMethod.Get, path, params, true)
      .then(data => {
        console.log('requestCertifiedStatus: ', data);
        if (!data) {
          return Promise.reject(new Error('data missing'));
        }


        // CertifiedStatusResponse {
        //   data:
        //   CertifiedStatusResponseData {
        //     status:
        //     string *
        //       认证状态：101已认证，102未认证，103审核中，104审核不通过
        //     message:
        //     string
        //     返回结果具体描述
        //     name:
        //     string
        //     认证名称
        //   }
        // }
        this._certifiedStatus = data.status
        if (data.status === '101'|| data.status === '2'){
          this._realname = data.name
        } else if (data.status === '102' || data.status === '104' || data.status === '103'
          || data.status === '0' || data.status === '1' || data.status === '3'){
          this._certifiedMsg = data.message
        }


        
        // CertifiedStatusResponse {
        //   data:
        //   CertifiedStatusResponseData {
        //     status:
        //     string *
        //       认证状态：0未认证，1审核中，2已认证，3审核不通过
        //     message:
        //     string
        //     返回结果具体描述
        //     name:
        //     string
        //     认证名称
        //   }
        // }
        // this._certifiedStatus = data.status
        // if (data.status === '2'){
        //   this._realname = data.name
        // } else if (data.status === '0' || data.status === '1' || data.status === '3'){
        //   this._certifiedMsg = data.message
        // }



      })
      .catch(err => {
        console.log('requestCertifiedStatus error: ', err);
        // return Promise.reject(err);
      });
  }

  // FID_KHH      客户号
  // FID_KHXM     客户姓名
  // FID_KHQC     客户全称
  // FID_DH       电话
  // FID_FAX      传真
  // FID_PROVINCE 省
  // FID_CITY     市
  // FID_SECTION  县
  // FID_YZBM     邮政编码
  // FID_DZ       地址
  // FID_EMAIL    邮箱
  // FID_KHZT     客户状态
  // FID_KHSX     客户属性
  // FID_MOBILE   手机
  // var message = {
  //   "email": customer.email,
  //   "telephone": customer.telephone,
  //   "gender": customer.gender,
  //   "loginName": customer.loginName,
  //   "recommendCode": customer.recommendCode
  // }
  // return res.json({ data: message })
  parseCustomerData(data){
    // 是否需要检测客户状态？
    // 状态不正常是是否要自动注销登录？
    // this._accountStatus = parseInt(data.FID_KHZT);
    console.log('parseCustomerData')
    this._realname = data.realName || this._realname;
    // this._fullname = data.FID_KHQC;
    // this._phone = data.telephone;
    // this._idcardnumber = data.FID_ZJBH;
    this._mobile = data.telephone// || data.FID_MOBILE;
    // this._address = data.FID_DZ;
    this._email = data.email;
    this._recommendCode = data.recommendCode;
  }

  requestFundData(): Promise<any> {
    if (this.appSettings.SIM_DATA){
      this.parseFundData({
        FID_ZJZH: this.appDataService.customerId + '02',
        FID_ZHYE: 1e5,
      });

      return Promise.resolve();
    }

    //原有高交所获取数据方法
    // const url = `${this.appSettings.SERVER_URL}/api/v1/gjs/biz/customers/fundInfo`;
    // return this.httpService.getWithToken(url)
    //   .then(data => {
    //     // console.log('requestPersonalData: ', data);
    //     if (!data.data || !Array.isArray(data.data) || !data.data.length){
    //       return Promise.reject(new Error('data missing'));
    //     }
    //     // 返回数据格式为数组，暂时只使用数组第一组元素。
    //     this.parseFundData(data.data[0]);
    //   })
    //   .catch(err => {
    //     console.log('requestPersonalData error: ', err.message || err);
    //     return Promise.resolve(err);
    //   });

    //001为现金账
    const path = `/account/accounts/type/001`;
    return this.appService.request(RequestMethod.Get,path,undefined,true)
      .then(data => {
        console.log('requestPersonalData: ', data);
        if (!data) {
          return Promise.reject(new Error('data missing'));
        }
        // 返回数据格式为数组，暂时只使用数组第一组元素。
        this.parseFundData(data);
      })
      .catch(err => {
        console.log('requestPersonalData error: ', err);
        // return Promise.reject(err);
      });
  }

  // FID_BDRQ    变动日期
  // FID_BZ      币种
  // FID_CODE    返回码
  // FID_DJJE    冻结金额
  // FID_DRCKJE  当日帐户存款金额
  // FID_DZLX
  // FID_GSFL
  // FID_JGLB
  // FID_KHQZ    客户群组
  // FID_KHRQ
  // FID_KHXM
  // FID_KQZJ
  // FID_KYXYED  可用信用额度
  // FID_KYZJ
  // FID_LXJS
  // FID_LXS
  // FID_MESSAGE
  // FID_OFSS_JZ
  // FID_QSJE
  // FID_QTZC
  // FID_SHLX
  // FID_SRYE
  // FID_TZJS
  // FID_TZLX
  // FID_WJSZJ
  // FID_XHRQ
  // FID_XJYE
  // FID_XJZC
  // FID_XYED
  // FID_YJLX
  // FID_YWFW
  // FID_YYB     客户营业部
  // FID_ZCFZ
  // FID_ZHGLJG
  // FID_ZHLB
  // FID_ZHMC    账户名称
  // FID_ZHSX
  // FID_ZHYE    账户余额
  // FID_ZHZT
  // FID_ZJZH    资金帐号
  // FID_ZPJE
  // FID_ZQSZ
  // FID_ZRSZ
  // FID_ZXSZ
  // FID_ZZC
  // FID_ZZHBZ

  parseFundData(data){
    this._fundingAccount = data.FID_ZJZH || data.accountId
    this._assets = Number(data.FID_ZZC)
    // console.log(this._assets)
    // console.log('FID_ZHYE: ',data.FID_ZHYE)
    this._accountBalance = Number(data.FID_ZHYE || data.balance)
  }

  requestEquityDeposit(): Promise<any> {
    if (this.appSettings.SIM_DATA){
      return new Promise((resolve) => {
        setTimeout(() => {
          if (this.appDataService.customerId === '888800000002'){
            console.log('Personal Stock List Null');
            return this.parseEquityDeposit([]);
          }

          this.parseEquityDeposit([
            {
              FID_GQDM: '000001',
              FID_GQSL: 6000,
              FID_DJSL: 1500,
              FID_KMCSL: 4500,
            },
            {
              FID_GQDM: '000002',
              FID_GQSL: 2000,
              FID_DJSL: 2000,
              FID_KMCSL: 0,
            },
          ]);

          resolve();
        }, 1e3);
      });
    }

    //高交所原有接口
    // const url = `${this.appSettings.SERVER_URL}/api/v1/gjs/biz/transactions/equityDeposit`;
    // return this.httpService.getWithToken(url)
    //   .then(data => {
    //     // console.log('requestEquityDeposit: ', data);
    //     if (!data.data || !Array.isArray(data.data)){
    //       return Promise.reject(new Error('data missing'));
    //     }
    //     // 返回数据格式为数组，即使为空数组也需要处理！
    //     this.parseEquityDeposit(data.data);
    //   })
    //   .catch(err => {
    //     console.log('requestEquityDeposit error: ', err.message || err);
    //     return Promise.reject(err);
    //   });

    //持仓
    const path = `/account/position/totals`
    return this.appService.request(RequestMethod.Get,path,undefined,true)
      .then(data => {
        console.log('requestEquityDeposit: ', data);
        if (!data || !Array.isArray(data)) {
          return Promise.reject(new Error('data missing'));
        }
        // 返回数据格式为数组，即使为空数组也需要处理！
        this.parseEquityDeposit(data);
      })
      .catch(err => {
        console.log('requestEquityDeposit error: ', err);
        return Promise.reject(err);
      });
  }

  // FID_KHH  客户号
  // FID_KHXM  客户姓名
  // FID_YYB  营业部
  // FID_KHQZ  客户群组
  // FID_GSFL  公司分类
  // FID_BZ  币种
  // FID_DRMCCJSL  当日卖出成交数量
  // FID_DRMRCJJE  当日买入成交金额
  // FID_DRMCCJJE  当日卖出成交金额
  // FID_DRMRCJSL  当日买入成交数量
  // FID_KCRQ  开仓日期
  // FID_DRMCWTSL  当日卖出委托数量
  // FID_KMCS  可卖出数量
  // FID_DJSL  冻结数量
  // FID_JCCL  今持仓量
  // FID_QQSL  确权数量
  // FID_DRMRWTSL  当日买入委托数量
  // FID_BDRQ  最近变动日期
  // FID_GQZH  股权帐号
  // FID_GQSL  股权数量
  // FID_GQDM  股权代码
  // FID_GQLB  证券类别
  // FID_GQMC  股权名称
  // FID_GFXZ  股份性质
  // FID_BROWINDEX  分页索引值
  // FID_GQMC  股权名称      FID_EXFLG有值
  // FID_JYDW  交易单位      FID_EXFLG有值
  // FID_MCSL  卖出数量      FID_EXFLG有值
  // FID_MRSL  买入数量      FID_EXFLG有值
  // FID_PGSL  配股数量      FID_EXFLG有值
  // FID_SGSL  送股数量      FID_EXFLG有值
  // FID_TBFDYK  摊薄浮动盈亏      FID_EXFLG有值
  // FID_TBBBJ  摊薄保本价      FID_EXFLG有值
  // FID_TBCBJ  摊薄成本价      FID_EXFLG有值
  // FID_CCJJ  持仓均价      FID_EXFLG有值
  // FID_FDYK  浮动盈亏      FID_EXFLG有值
  // FID_HLJE   红利金额      FID_EXFLG有值
  // FID_LJYK   累计盈亏      FID_EXFLG有值
  // FID_MCJE   卖出金额      FID_EXFLG有值
  // FID_MRJE  买入金额      FID_EXFLG有值
  // FID_MRJJ  买入均价      FID_EXFLG有值
  // FID_PGJE  配股金额      FID_EXFLG有值
  // FID_ZXSZ  最新市值      FID_EXFLG有值
  // FID_BBJ  保本价      FID_EXFLG有值
  // FID_ZXJ  最新价      FID_EXFLG有值
  // FID_ZGB  总股本      FID_EXFLG有值
  // FID_CODE  　  I  　  返回码
  // FID_MESSAGE  　  C  　  返回信息
  // FID_KMCSL  可卖出数量  I

  parseEquityDeposit(data) {
    this._personalStockListIsNull.next(data.length === 0);
    console.log('parseEquityDeposit raw',data)
    // 严格处理的话，需要过滤数据，查看是否为当前用户的持仓。
    // tofix:先用总持仓当可卖持仓
    this._personalStockList.next(data.map(item => ({
      stockCode: item.FID_GQDM || item.productId,
      restQuantity: item.FID_GQSL || item.totalAmount,
      freezeQuantity: item.FID_DJSL,
      saleableQuantity: item.FID_KMCSL || item.totalAmount,
      cost: item.FID_CCJJ || ((item.totalCost / item.totalAmount) || 0).toFixed(4),
      PNL: item.FID_LJYK,
    })));
  }

  get todayBalance(){
    // 今日盈亏的简单计算。
    // 实际计算会更加复杂，至少要考虑：
    // 1. 今日已卖出的股票（全卖或者卖了一部分）；
    // 2. 今日盘中买入的股票，需要考虑买入价格。
    // 获取盈亏值的方式也需要修改，
    //tofix: get 访问器属性每次读取时都会重复进行计算操作, 有严重的性能问题
    //应当做成一个可观察的值，同时对个人持股列表、股价等进行合并订阅，在来源数据变化时重新计算账户盈亏。模板页上直接对这个账户盈亏 Observable 调用 async 管道。
    // 应当在每个持仓股票的价格或持仓数量变化时主动进行汇总计算！
    // console.log('todayBalance');
    return this._personalStockList.getValue().reduce((sum, {stockCode, restQuantity}) => {
      const baseData = this.stockDataService.getStockBaseData(stockCode);
      return sum + (baseData && baseData.changeValue ? baseData.changeValue * restQuantity : 0);
    }, 0);
  }

  // FID_CODE	返回码
  // FID_MESSAGE	返回信息
  // FID_KHH	客户号
  // FID_ZJZH	资金账号
  // FID_BZ	币种
  // FID_CGZH	存管账号
  // FID_YHDM	银行代码
  // FID_YHZH	银行账户
  // FID_DJRQ	登记日期
  // FID_ZHZT	账户状态
  // FID_CGLB	存管类别
  // FID_ZHGLJG	账户管理机构
  // FID_YYB	营业部
  // FID_KHQZ	客户群组
  // FID_GSFL	公司分类
  // FID_YHYE	银行余额
  // FID_DYBS	对应标识

  requestBankAccount(): Promise<any> {
    if (this.appSettings.SIM_DATA) {
      this.setRelatedBankAccount({
        FID_YHDM: 'JSYH',
        FID_YHZH: '622020000000023121',
      });

      return Promise.resolve();
    }

    const url = `${this.appSettings.SERVER_URL}/api/v1/gjs/biz/accounts/depositoryAccountRelation`;
    return this.httpService.getWithToken(url)
      .then(data => {
        // console.log('requestBankAccount: ', data);
        if (!data.data || !Array.isArray(data.data) || !data.data.length) {
          //数据丢失时显示
          this.setRelatedBankAccount({
            FID_YHDM:'xxxx',
            FID_YHZH: '000000000000000000',
          })
          return Promise.reject(new Error('data missing'));
        }
        this.setRelatedBankAccount(data.data[0])
      })
      .catch(err => {
        console.log('requestBankAccount error: ', err.message || err);
        return Promise.resolve(err);
      });
  }

  setRelatedBankAccount(data){
    this._relatedBankAccount.bankName = this.bankList[data.FID_YHDM] || '未知银行'
    this._relatedBankAccount.bankIconURL = this.bankIconList[data.FID_YHDM] || ''
    this._relatedBankAccount.cardNo = data.FID_YHZH
  }

  personalAssets(){
    const path = `/account/accounts/assets`

    let params = new URLSearchParams()
    params.set('accountType', '003')

    return this.appService.request(RequestMethod.Get, path, params, true)
      .then(data => {
        if (!data) {
          return Promise.reject(new Error('data missing'));
        }

        return Promise.resolve(data)
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }

  personalPriceId(){
    const path = `/platform/parameters`

    let params = new URLSearchParams()
    params.set('type', '002')
    params.set('instId', this.appSettings.Platform_Type)
    params.set('code', 'PRICE_PRODUCT_ID')

    return this.appService.request(RequestMethod.Get, path, params, true)
      .then(data => {
        if (!data || !data[0]) {
          return Promise.reject(new Error('data missing'));
        }

        return Promise.resolve(data[0])
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }


  bankList = {
    "JSYH": "建设银行",
    "ZGYH": "中国银行",
    "GSYH": "工商银行",
    "RMYH": "人民银行",
    "MSYH": "民生银行",
    "ZSYH": "招商银行",
  }
  bankIconList = {
    "JSYH": "assets/images/jsyh.png",
  }
}
