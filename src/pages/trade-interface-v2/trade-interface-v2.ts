import { Component, ViewChild } from '@angular/core';
// import * as echarts from 'echarts';
import { 
  NavParams,
  AlertController, 
  NavController, 
  InfiniteScroll, 
  Platform, 
  Content,
  Events,
  Refresher,
} from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AppSettings } from '../../providers/app-settings';
import { StockDataService } from '../../providers/stock-data-service';
import { PersonalDataService } from "../../providers/personal-data-service";
import { TradeService } from '../../providers/trade-service';
import { AppDataService } from '../../providers/app-data-service';
import { AlertService } from '../../providers/alert-service';
import { SocketioService } from "../../providers/socketio-service";
import { EntrustServiceProvider } from "../../providers/entrust-service";
import { HistoryRecordPage } from '../history-record/history-record';
import { StatusBar } from '@ionic-native/status-bar';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { AppSettingProvider } from '../../bnlc-framework/providers/app-setting/app-setting';

import { PromptControlleService } from "../../providers/prompt-controlle-service";
import { LoginService } from '../../providers/login-service';
import { BigNumber } from "bignumber.js";

@Component({
  selector: 'page-trade-interface-v2',
  templateUrl: 'trade-interface-v2.html'
})
export class TradeInterfaceV2Page {
  activeBack:boolean = false;
  quickTrading: boolean = false;
  trading: boolean = false;
  marketPrice: any;
  // tradeType:number = 1 //1是买,0是卖
  @ViewChild(Content) content:Content;


  private viewDidLeave: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private viewDidLeave$ = this.viewDidLeave
    .asObservable()
    .distinctUntilChanged()
    .filter(value => value === true);

  private _tradeType$: BehaviorSubject<number> = new BehaviorSubject(1);
  public tradeType$: Observable<number> = this._tradeType$
    .asObservable()
    .distinctUntilChanged()
    .do(type=>{
      let rateSrc
      this.targetName = this.productName
      if (type === 0){
        rateSrc = this.sellRate
      }else if (type === 1){
        rateSrc = this.buyRate
      }
      this.getFee(rateSrc).then(data => this.fee = data)
    })

  private hiddentext = ''
  private traderList = []
  private priceName: string
  private productName: string
  private targetName: string  
  //traderId可以做成subject, 用setter 和getter改变 作为源头触发其他改动.
  private traderId: string = this.appSettings.SIM_DATA ?
    '000001' : undefined;
  private reportArr = []
  private candlestickArr = []
  private entrusts = []

  private trader_target
  private trader_product

  page = 1
  pageSize = 10
  hasMore: boolean = false

  private _cards = {
    '满仓': 1,
    '1/2仓': 1 / 2,
    '1/3仓': 1 / 3,
    '1/4仓': 1 / 4,
  }
  private cards: string[] = Object.keys(this._cards)
  private buySaleActiveIndex: BehaviorSubject<number> = new BehaviorSubject(0);
  private quickTradeSelector = this.buySaleActiveIndex
    .asObservable()
    .takeUntil(this.viewDidLeave$)
    .distinctUntilChanged()
    .do(index => {
      this.getQuickTradeData(index)
    })

  private buyRate
  private sellRate
  private fee

  private buyTotalAmount
  private buyTotalQuantity
  private saleTotalAmount
  private saleTotalQuantity

  private _saleableQuantity$: Observable<number>;

  private _baseData$: Observable<any>;
  private _depth$: Observable<any>;
  private _depthSource$: Observable<any>;
  public buy_depth: AnyObject[] = [];
  public sale_depth: AnyObject[] = [];
  public buyer = ['买1', '买2', '买3', '买4', '买5'];
  public saler = ['卖1', '卖2', '卖3', '卖4', '卖5'];

  private _realtimeData$: Observable<any> = Observable.of([])
  private _candlestickData$: Observable<any> = Observable.of([])

  private isPortrait: boolean = true
  private activeIndex: number = 0
  private timeArray: string[] = ['分时', '5分', '30分', '1小时']

  private betsHidden: boolean = false;
  @ViewChild('largeRealtimeChart') largeRealtimeChart;
  
  private kDataUnit: string = '';
  private candlestickOptions = {
    customTooltip: true,
    candlestickcalculateList: [[5, 'rgba(254, 53, 53, .6)'], [10, 'purple'], [20, 'blue'], [30, 'green']],
    yAxisLabel: {
      inside: true,
      showMinLabel: false,
      showMaxLabel: false,
      textStyle: {
        fontSize: 10,
        color: '#fff'
      },
    },
    ySplitLine: {
      show: false,
    },
    // ySplitNumber:4,
    yAxisShow: false,
  };

  // liquiddata:any;

  _price: BehaviorSubject<string> = new BehaviorSubject(undefined);
  set price(str){
    this._price.next(str)
    this.checkMax(str)
  }
  get price(){
    return this._price.getValue()
  }
  amount: string = '0';
  maxAmount: string | number ;
  range = 0;
  oneRange = 0;
  tenRange = 0;
  hundredRange = 0;

  buyQuantityMax:any = 0;
  saleQuantityMax:any = 0;
   // @ViewChild('quantityRange') Range: any;
  @ViewChild('oneQuantityRange') oneQuantity: any;
  @ViewChild('tenQuantityRange') tenQuantity: any;
  @ViewChild('hundredQuantityRange') hundredQuantity: any;


 
  @ViewChild('priceInputer') PriceInputer: any;
  @ViewChild('amountInputer') AmountInputer: any;

  inputGroup = {
    "price":"PriceInputer",
    "amount":"AmountInputer",
  }


  handBase = 0.01;

  realtimeOptions = {
    xAxisShow: true, 
    axisLabelShow: false, 
    yAxisStyle: {
      color: 'rgba(255, 255, 255, 0.2)',
      type: 'dashed',
    },
    textColor: 'rgba(255, 255, 255, 1)'
  };

  //初始化数据,尽量保证不包含异步操作
  async initData() {
    console.log('trade-interface-v2')

    const traderList = [];
    (await this.appDataService.traderListPromise).forEach((value, key, map) => {
      traderList[value.index] = value;
    })
    this.traderList = traderList;
    await this._getRequestCertifiedStatus();
  }
  
  backInOut(k) {
      var s = 1.70158 * 1.525;
      if ((k *= 2) < 1) { return 0.5 * (k * k * ((s + 1) * k - s)); }
      return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
  }

  constructor(
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    public appSettings: AppSettings,
    public appDataService: AppDataService,
    private socketioService: SocketioService,
    private stockDataService: StockDataService,
    private navParams: NavParams,
    public personalDataService: PersonalDataService,
    public tradeService: TradeService,
    public alertService: AlertService,
    public entrustServiceProvider: EntrustServiceProvider,
    public appSetting: AppSettingProvider,
    public platform: Platform,
    public statusBar: StatusBar,
    public androidFullScreen: AndroidFullScreen,
    private events: Events,
    private promptCtrl: PromptControlleService,
    private loginService: LoginService,
  ) {    
    // debugger
    // window['TradeInterfacePage'] = this 
    this.traderId = this.navParams.get('stockCode') || this.navParams.data || this.traderId;

    // if (!this.traderId) this.appDataService.products.forEach((value, key, map) => {
    //   this.traderId = key;
    //   return;
    // })
    const traderId = this.traderId
    if (traderId) {
      console.log('trade-interface-v2:(constructor)', traderId)
      this._saleableQuantity$ = this.personalDataService.personalStockList$
        .map(arr => arr.filter(item => item.stockCode === traderId))
        .map(arr => arr.length && +arr[0].saleableQuantity || 0)
        .distinctUntilChanged();
 
      this.initData()
      this.getProcessEntrusts()
      this.doSubscribe()

      this.requestAssets()

      this.quickTradeSelector.subscribe();
     
    }
  }

  toggleVisible($event){
    if(this.hiddentext){
      this.hiddentext = ''
    } else{
      this.hiddentext = '****'
    }
  }

  changeByStep(target: string, sign: string = '+', step?: any, precision: number = -8) {

    const invBase = Math.pow(10, -(precision));
    // 浮点数四则运算存在精度误差问题.尽量用整数运算
    // 例如 602 * 0.01 = 6.0200000000000005 ，
    // 改用 602 / 100 就可以得到正确结果。
    let length = 0

    if (isNaN(step)) { 
      // 旧要求，每次加最后一位
      // this[target] = this[target] == ''? '0' : this[target];
      // length = this[target].split('.')[1] ? this[target].split('.')[1].length : length
      // step = Math.pow(10, -length)
      // step = sign + step
      
      // 新要求
      if( target == "amount") {
        step = sign + 100;
      } else if( target == "price") {
        step = sign + 1;
      }

    }
    
    //原来的方法遇到 “0.0048” *10^8,会丢失精度
    // const result = Math.max(0, Math.floor(+this[target] * invBase + step * invBase) / invBase);
    //新方法,区分价格跟数量,价格用新的，数量用旧方法
    // '11.12' -> ['11','12'] -> (11 * 10^8 * 10^(arr[1].length) + 12 * 10^8 ) / 10^8
    let result: any;
     
    
    if( step == 0 ){
      // input输入
      result = this[target] == ''? "0": this[target];
      
    } else {  
      // ‘+、-’按钮 
      this[target] = this[target] == ''?"0":this[target];
      result = new BigNumber(this[target]).plus(step).toNumber() < 0 ? '0' : new BigNumber(this[target]).plus(step).toString();
    }

    result = this.numberFormat(result);
    // if(typeof this[target] == "string" ){
    //   result = this[target].split('.');
    //   if(result.length == 2){
    //     result = Math.max(0, Math.floor(result[0] * invBase *  Math.pow(10,result[1].length) + result[1] * invBase + step * invBase * Math.pow(10,result[1].length)) / (invBase * Math.pow(10,result[1].length)));
    //   }else{
    //     result = Math.max(0, Math.floor(result[0] * invBase + step * invBase) / invBase);
    //   }
    // } else {
    //   result = Math.max(0, Math.floor(+this[target] * invBase + step * invBase) / invBase);
    // }


  
    //强制刷新数据hack处理
    this[target] = result;
    this.platform.raf(()=>{      
      this[target] = result;
      this[this.inputGroup[target]].value = this[target];
    })
  }

  // 修改bignumber
  checkMax(price = this.price){

    const traders = this.traderId.split('-')
    console.log('checkMax', this.personalDataService.personalStockList, ' & ', traders)
    const personalStockList = this.personalDataService.personalStockList
    if (this._tradeType$.getValue() === 1) { 
      //可用资金/价格  
    
      const target = personalStockList
        .filter(({ stockCode }) => stockCode === traders[0]);
      
      // 旧方法使用Number计算，会导致计算数据出错
      // let saleableQuantity:any = (target && target.length != 0 ? target : [{ saleableQuantity:0}])[0]
      //   .saleableQuantity / this.appSettings.Product_Price_Rate;
      let saleableQuantity:any =  new BigNumber((target && target.length != 0 ? target : [{ saleableQuantity:0}])[0]
      .saleableQuantity).div( this.appSettings.Product_Price_Rate);
      this.maxAmount = Number(price) ? saleableQuantity.div(price).toString() : "0";
      if(this.maxAmount == "0"){
        this.maxAmount = 0;
      }
      if(!this.appSetting.getUserToken()){
        this.maxAmount = '--';
      }
    } else if (this._tradeType$.getValue() === 0) { 
      //最大持仓
    
      const target = personalStockList
        .filter(({ stockCode }) => stockCode === traders[1]);
        console.log(target)
        // let saleableQuantity:any = (target && target.length != 0 ? target : [{ saleableQuantity:0}])[0]
      //   .saleableQuantity / this.appSettings.Product_Price_Rate;
        let saleableQuantity:any =  new BigNumber((target && target.length != 0 ? target : [{ saleableQuantity:0}])[0]
        .saleableQuantity).div( this.appSettings.Product_Price_Rate);
        this.maxAmount = Number(price) ? saleableQuantity.div(price).toString() : "0";
        // if(this.maxAmount == "0"){
        //   this.maxAmount = 0;
        // }
    } else {

    }
  }

  formatNumber(target: string, precision?: number){
    this.changeByStep(target, undefined, 0, precision);
  }

  setPrice(price = this.price) {
    
    if(!price){
      price = '0';
    }
    this.price = this.numberFormatDelete0(price)
    this.formatNumber('price')
  }

  chooseTradeType($event: MouseEvent){
    const dataset = ($event.target as HTMLElement).dataset
    if (dataset && dataset.tradeType){
      this._tradeType$.next(Number(dataset.tradeType))
      if(Number(dataset.tradeType)) {
       
        this.price = this.buy_depth[0] ? this.numberFormatDelete0(this.buy_depth[0].price)
                     : this.marketPrice ? this.numberFormatDelete0(this.marketPrice) : "0" ;
      } else {
        this.price = this.sale_depth[0] ? this.numberFormatDelete0(this.sale_depth[0].price)
                     : this.marketPrice ? this.numberFormatDelete0(this.marketPrice) : "0" ;
      }
     
      this.checkMax()
    }
  }

  async getFee(rate) {
    if(!rate) return ''
    
    // const rate = this.buyRate
    const traders = this.traderId
    const rateTarget = rate.targetType === '001' ? await this.stockDataService.getProduct(traders[1]) : 
      rate.targetType === '002' ? await this.stockDataService.getProduct(traders[0]) : void 0
    const rateStr = rate ?
      rate.calculateType === '001' ? `${rate.rate * 100}%` :
        rate.calculateType === '002' ? `${rate.rate + rateTarget.productName}` : void 0
      : void 0

    // const sellRate = this.sellRate
    // const sellrateTarget = sellRate.targetType === '001' ? await this.stockDataService.getProduct(traders[1]) :
    //   sellRate.targetType === '002' ? await this.stockDataService.getProduct(traders[0]) : void 0
    // const sellRateStr = sellRate ?
    //   sellRate.calculateType === '001' ? `${sellRate.rate * 100}%` :
    //     sellRate.calculateType === '002' ? `${sellRate.rate + sellrateTarget}` : void 0
    //   : void 0

    return rateStr

    // const toast = this.toastCtrl.create({
    //   message: `买入费率:${buyRateStr}  卖出费率:${sellRateStr}`,
    //   duration: 3000,
    //   position: 'middle'
    // })
    // toast.present()
  }

  async doTrade(tradeType: number = this._tradeType$.getValue()){
    await this.personalDataService.requestCertifiedStatus();
    if(!(this.personalDataService.certifiedStatus == '101')){
      return this.validateIdentify();
    }
    
    if(this.trading){
      return void 0
    }
  


    // 界面按钮已根据是否 可买/可卖 进行了限制，
    // 此处没有再进行判断。

    //do需要对这部分进行number数字处理
    const price = parseFloat(this.price);
    const amount = parseFloat(this.amount);

    let tradeText = tradeType === 1 ? '买入':
                    tradeType === 0 ? '卖出': '委托'

    let show_warning = true
    let toast = this.promptCtrl.toastCtrl({
      duration: 3000,
      position: 'middle'
    })
    if(isNaN(price) || price <= 0){
      toast.setMessage(`请输入正确的${tradeText}价格`)
    }else if(isNaN(amount) || amount <= 0){
      toast.setMessage(`请输入正确的${tradeText}数量`)
    }else if(amount > Number(this.maxAmount)){
      toast.setMessage(`${tradeText}数量超过可${tradeText}上限`)
    }else{
      show_warning = false
    }

    if(show_warning){
      toast.present()
      return false      
    }

    console.log('doTrade:',
      this.traderId, ' | ',
      tradeType, ' | ',
      amount, ' | ',
      price, 
    )

    let thanText = tradeType === 1 ? '高于' :
                   tradeType === 0 ? '低于' : '超出'

    let flag = false
    if (tradeType === 1 && price > 1.1 * this.marketPrice) {
      flag = true
    } else if (tradeType === 0 && price < 0.9 * this.marketPrice) {
      flag = true
    }

    if (flag){
      let alert = this.alertCtrl.create({
        title: '价格确认',
        message: `您的${tradeText}价格${thanText}当前市场价10%,确认提交委托？`,
        buttons: [
          {
            text: '取消',
            role: 'cancel',
            handler: () => {
              // console.log('Cancel clicked')
            }
          },
          {
            text: '确认',
            handler: () => {
              this._doTrade(
                this.traderId,
                '',
                tradeType,
                amount,
                price,
              )
            }
          }
        ]
      })
      alert.present();
      return void 0;
    }
  
    this._doTrade(
      this.traderId,
      '',
      tradeType,
      amount,
      price, 
    )
    
  }

  _doTrade(traderId, password, tradeType, amount, price) {
    this.trading = true
    this.tradeService
      .purchase( 
        traderId,
        password,
        tradeType,
        amount,
        price,
      )
      .then(resData => {
        console.log('doTrade:', resData)
        // [{ "FID_CODE": "1", "FID_MESSAGE": "委托成功,您这笔委托的合同号是:201" }]
        const result = resData instanceof Array ? resData[0] : resData

        if (typeof result === 'object' && result.id) {
          let toast = this.promptCtrl.toastCtrl({
            message: '委托单已提交',//`${result.id}`,
            duration: 3000,
            position: 'middle'
          })
          toast.present()
          //初始化数据
          this.amount = '0';
          //下单成功刷新委托单
          this.page = 1
          this.getProcessEntrusts()
        } else {
          return Promise.reject(result);
        }
        console.log('doTrade done:', result.id)
        this.alertService.dismissLoading()
      })
      .catch(err => {
        console.log('doTrade err:', err);
        if (err && err.message) {
          let toast = this.promptCtrl.toastCtrl({
            message: `${err.message}`,
            duration: 3000,
            position: 'middle'
          })
          this.alertService.dismissLoading()
          toast.present()
        }
        console.log(err.statusText || err.message || err)
      })
      .then(() => {
        this.refreshPersonalData();
        this.trading = false
      })
  }

  private _getRequestCertifiedStatus(){
    this.loginService.status$.subscribe(status=>{
      if(status) {
        if(this.personalDataService.certifiedStatus === '103'){
          this.personalDataService.requestCertifiedStatus()
        }
      }
    })
  }

  private refreshPersonalData(refresher?: Refresher) {
    Promise.all([
      this.personalDataService.requestFundData().catch(() => { }),
      this.personalDataService.requestEquityDeposit().catch(() => { }),
    ])
      .then(() => (this.checkMax(), this.requestAssets(), this.getProcessEntrusts()))
      .then(() => refresher ? refresher.complete() : void 0)
  }
  ionViewWillLeave(){
    this.activeBack =true;
  }
  ionViewDidEnter(){
    // window["confirmChangeTradingMode"] = this.confirmChangeTradingMode
    this.viewDidLeave.next(false);
    // console.log('pricetarget', this.PriceInputer)
    // console.log('pricetarget', this.PriceInputer.getElementRef())
    // console.log('pricetarget', this.PriceInputer.getNativeElement())
    // this.subscribeTradeData() //暂时没用 用另一种方式保证刷新数值

    // this.initData();
    // this.getProcessEntrusts();
    // this.doSubscribe();
    // this.liquiddata = [{
    //   name: '1机',
    //   value: 0.7
    // }, 0.69];

    // this.quickTradeSelector.subscribe()
  }

  // subscribeTradeData() {
  //   Observable.combineLatest(
  //     this._tradeType$,
  //     this._price,
  //     // Observable.fromEvent(this.Price.getNativeElement(),'input') ,
  //   )
  //     .distinctUntilChanged()
  //     .debounceTime(300)
  //     .subscribe(([tradeType, price]) => {
  //       // console.log('pricetarget result ', tradeType,
  //       //   ' | ', price
  //       // )
  //       //TODO:交易类型,价格 变动触发 最大可交易量变动
  //       if(tradeType === 1){
          
  //         this.maxAmount 
  //         this.amount 
  //       }else if(tradeType === 0){

  //       }
  //     })
  // }

  // 订阅实时数据。
  // 由于 DataSubscriber 装饰器的作用，
  // 会在 ionViewDidEnter() 事件处理函数中被自动调用。
  async doSubscribe(){
    // window['temp_traderId'] = this.traderId
    const traderId = this.traderId;
    console.log('trade-interface-v2:(doSubscribe) ', traderId)
    if (traderId){
      const traderList = await this.appDataService.traderListPromise;
      const trader = this.appDataService.traderList.get(traderId)
      if(!trader) return void 0 
      const names = trader.traderName.split(' / ')
      this.productName = this.targetName = names[0]
      this.priceName = names[1]
      // this._baseData$ = this.stockDataService.subscibeRealtimeData(traderId, 'price', this.viewDidLeave$)
      this._baseData$ = trader.marketRef
        .do(data => console.log('trade-interface-v2:1', data))
        //初始化买卖价格
        .do(data => {
          // console.log('doSubscribe do')
          if(!data) return false
          if(!this.price) this.price = new BigNumber(data.price).toString();
          this.marketPrice = data.price
          this.buyRate = data.buyRate
          this.sellRate = data.sellRate
        })
      // this.stockDataService.stockBaseData$.map(data => data[stockCode])
      //   .do(data => console.log('final data:', stockCode, data))
      //   .do(data=>{
      //     //若无数据,则订阅.
      //     if(!data){
      //       this.stockDataService.subscibeRealtimeData(stockCode, 'price', this.viewDidLeave$)
      //         .takeUntil(this.viewDidLeave$.delay(this.appSettings.UNSUBSCRIBE_INTERVAL))
      //         // 必须订阅，数据才会流动，即使订阅函数内部没有做任何操作。
      //         .subscribe();
      //     }
      //   })
      console.log('trade-interface-v2:(doSubscribe):depth ', this._depth$)      
      // if(!this._depth$){
        this._depthSource$ = this.socketioService.subscribeEquity(traderId, 'depth')
          .do(data => console.log('trade-interface-v2:depth:', data))
        this._depth$ = this._depthSource$
          // .map(data =>data.data)
          .map(data => {
            let arr = []
            const length = 5
            //todo:买五卖五档数据处理,需要知道后端返回顺序.
            //{buy: Array(0), sale: Array(0)}
            if(!data.sale || !data.buy){
              return arr = Array.from({length:length*2})
            }

            for (let i = 0; i < length; i++) {
              arr[i] = data.sale[length - 1 - i]
              arr[i + length] = data.buy[i]
            }
            return arr
          })
        // this._depth$.subscribe()
        this._depthSource$.subscribe(data=>{
          if(data){
            if(data.buy){
              this.buy_depth = data.buy; 
              if(this.buy_depth[0]){
                this.price = this.numberFormatDelete0(this.buy_depth[0].price);
              }
            }
            if (data.sale) {
              this.sale_depth = data.sale;
            }
          }
        })
      // }

      // this._realtimeData$ = this.stockDataService.stockRealtimeData$.map(data => data[stockCode]);
      console.log('trade-interface-v2_realtimeData:reportArr: ', this.reportArr)
      this._realtimeData$ = this.socketioService.subscribeRealtimeReports([this.traderId])
        .do(data => console.log('trade-interface-v2_realtimeData: ',data))
        .takeUntil(this.viewDidLeave$)
        .filter(({ type }) => type === this.traderId)
        .map(data => data.data)
        .map(data => {
          //处理增量更新
          const srcArr = this.reportArr
          srcArr.push(...data)//使用push+解构赋值,预期echarts动画实现
          const length = srcArr.length
          if (length > this.appSettings.Charts_Array_Length) {
            srcArr.splice(0, length - this.appSettings.Charts_Array_Length)
          }
          console.log('trade- interface_realtimeData:srcArr:', srcArr)
          return srcArr.concat()
        })
    }
  }

  gotoHistory($event){
    this.navCtrl.push(HistoryRecordPage, {
      traderId: this.traderId,
    })
  }

  confirmCancel(entrustId, entrustTime, entrustCategory) {
    entrustCategory =  entrustCategory == '001' ? '买入' : entrustCategory == '002' ? '卖出' : '' 
    entrustTime = new Date(entrustTime)
    entrustTime = `${entrustTime.getFullYear()}-${entrustTime.getMonth()+1}-${entrustTime.getDate()}`
    let alert = this.alertCtrl.create({
      title: '撤回委托',
      message: `确定要撤回${entrustTime}的${entrustCategory}委托单?`,
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked')
          }
        },
        {
          text: '确认',
          handler: () => {
            this.cancelEntrust(entrustId)
          }
        }
      ]
    })
    alert.present()
  }

  cancelEntrust(entrustId){
    this.entrustServiceProvider.cancelEntrust(entrustId)
      .then(data => {
        console.log('cancelEntrust data', data)

        this.page = 1
        this.getProcessEntrusts()

        if (data && data.status) {
          this.promptCtrl.toastCtrl({
            message: `撤单成功`,
            duration: 2000,
            position: 'middle'
          }) 
          .present();
        } else { 
          return Promise.reject(data);
        }
      })
      .catch(err => {
        console.log('cancelEntrust err',err)

        this.page = 1
        this.getProcessEntrusts()
        
        if (err && err.message) {
          let toast = this.promptCtrl.toastCtrl({
            message: `${err.message}`,
            duration: 3000,
            position: 'middle'
          })
          toast.present()
        } else {
          console.log('cancelEntrust err:', err)
        }
      })
      .then(()=>{
        this.refreshPersonalData()
      })
  }

  getProcessEntrusts(infiniteScroll?: InfiniteScroll){
    this.entrustServiceProvider.getEntrusts(this.traderId,'001,002',this.page)
      .then(data=>{ 
        console.log('getProcessEntrusts data:',data)

        if(this.page == 1){
          this.entrusts = data
        }else{
          this.entrusts.push(...data)          
        }
        this.hasMore = !(data.length < this.pageSize)
        if (infiniteScroll){ 
          infiniteScroll.complete()
          infiniteScroll.enable(this.hasMore)
        }
      })
      .catch(() => {
        console.log('getProcessEntrusts err')
        this.hasMore = false
        if (infiniteScroll) infiniteScroll.enable(this.hasMore)
      })
  }

  changeTrader($event){
    console.log('traderChanged', this.traderId)
    this.reportArr = []
    this.doSubscribe()
    this.getProcessEntrusts()
    
    this.requestAssets()
  }
  confirmChangeTradingMode(){
    console.log('confirmChangeTradingMode')
    if(this.appDataService.show_onestep_trade){
      this.appDataService.show_onestep_trade = false;
    }else{
      if (this.appDataService.show_onestep_warning){
        const alert = this.alertCtrl.create({
          title: '风险提示',
          message: `
            快捷交易会优先以当前您见到的市场上最优价格买入或卖出，但可能因为网络延迟或他人优先下单的情况导致实际成交价格与看到的价格有所差别，可能会出现更高价买入或更低价卖出的情况，为了您的资金安全，请谨慎使用快捷交易。
            <a>查看交易规则</a><br/>
          `,
          inputs: [
            {
              name: 'nowarning',
              type: 'checkbox',
              label: '不再提醒',
              value: 'nowarning',
            },
          ],
          buttons: [
            {
              text: '取消',
              role: 'cancel',
              handler: () => {
                // console.log('Cancel clicked')
              }
            },
            {
              text: '同意',
              handler: data => {
                this.appDataService.show_onestep_trade = true;
                if (data.indexOf("nowarning") >= 0) {
                  this.appDataService.show_onestep_warning = false;
                }
              }
            }
          ]
        })
        alert.present()
      }else{
        this.appDataService.show_onestep_trade = true;        
      }
      
      
    }
  }

  loadMoreHistory(infiniteScroll: InfiniteScroll) {
    this.page += 1
    
    this.getProcessEntrusts(infiniteScroll)
  }

  //行情详情图表
  toggleBets() {
    this.betsHidden = !this.betsHidden;

    if (this.largeRealtimeChart) {
      this.largeRealtimeChart.resize();
    }
  }

  switchOrientation(toPortrait: boolean) {
    this.isPortrait = toPortrait;
    (<any>window).screenSimLandscape = !toPortrait;
    if (toPortrait) {
      this.statusBar.show();
      // statusBar 隐藏后再显示，在 android 上会变成单独的状态条，
      // 不会融入 APP 的界面。
      // 即使设置 overlaysWebView 为 true 也无效。
      // this.statusBar.overlaysWebView(true);

      // 因此改用 androidFullScreen 来处理 android 设备的状态条问题，
      // 基本表现尚可，但偶尔会出现以下设置不生效的情况。
      // ios 设备的效果待测。
      if (this.platform.is('android')) {
        this.androidFullScreen.isImmersiveModeSupported()
          .then(() => this.androidFullScreen.immersiveMode())
          .then(() => this.androidFullScreen.showSystemUI())
          .then(() => this.androidFullScreen.showUnderStatusBar())
          .catch((error: any) => console.log(error.message || error));
      }
      //tofix:关闭旋屏时需要重新watch分时图数据,临时处理待优化
      // console.log('switchOrientation subscribeRealtimeReports ')
      // this.socketioService.subscribeRealtimeReports([this.traderId])
      this.doSubscribe()
    } else {
      this.statusBar.hide();
    }
  }

  changeTime(index) {
    if (index === this.activeIndex) {
      return;
    }

    this.activeIndex = index;
    const KDATA_UNITS = this.appSettings.KDATA_UNITS;
    if (index > 0 && index <= KDATA_UNITS.length) {
      const kDataUnit = this.kDataUnit = KDATA_UNITS[index - 1];
      // FIXME ：切换 K 线图形态时，强制要求重新获取数据，
      // 这样会比较费流量。
      // 可以考虑增加判断，数据已存在就不要重新获取。
      // this.stockDataService.requestKData(this._stockCode, kDataUnit);
      this.candlestickArr = []
      let theDate = new Date()
      let timespan,startTime
      switch (index) {
        case 1:
          timespan = '5m';
          startTime = theDate.setDate(theDate.getDate() - 5);
          break;
        case 2:
          timespan = '30m';
          startTime = theDate.setDate(theDate.getDate() - 30);
          break; 
        case 3:
          timespan = '1h';
          startTime = theDate.setDate(theDate.getDate() - 60);
          break; 
        default:
          timespan = '5m';
          startTime = theDate.setDate(theDate.getDate() - 5);
          break;
      }
      this._candlestickData$ = this.socketioService.subscribeRealtimeReports([this.traderId],undefined,{
        // var reportType = {
        //   Year: '1y',//年报
        //   HalfYear: '6M',//半年报
        //   Quarter: '1q',//季报
        //   Month: '1M',//月报
        //   Week: '1w',//周报
        //   Day: '1d',//日报
        //   Hour: '1h',//时报
        //   HalfHour: '30m',//30分报
        //   FifteenMinute: '15m',//15分报
        //   FiveMinute: '5m',//5分报
        //   Minute: '1m'//1分报
        // }
        timespan: timespan,
        type: '001',
        start: startTime,
        keepcontact : false,
        rewatch : true,
      })
        .takeUntil(this.viewDidLeave$)
        .filter(({ type }) => type === this.traderId)
        .map(data => data.data)
        .map(data => {
          //处理增量更新
          const srcArr = this.candlestickArr
          const resData = data.map(item => {
            const value = item.value
            const time = new Date(item.beginTime)
            return{
              startPrice: value.start,
              endPrice: value.end,
              minPrice: value.min,
              maxPrice: value.max,
              date: `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${time.getMinutes()}`,
              turnoverAmount: value.amount * value.avg / this.appSettings.Product_Price_Rate,
              turnoverQuantity: value.amount / this.appSettings.Product_Price_Rate,
              // yesterdayPrice:4.78,
            }    
          })
          srcArr.push(...resData)//使用push+解构赋值,预期echarts动画实现
          const length = srcArr.length
          if (length > this.appSettings.Charts_Array_Length) {
            srcArr.splice(0, length - this.appSettings.Charts_Array_Length)
          }
          console.log('trade- interface_candlestickData:srcArr:', srcArr)
          return srcArr.concat()
        })      
    }
  }


  //快捷交易三个拉动条
  rangeQuickTradeData(data:any){
    console.log('.....',data)

  }
  //快捷交易 满仓等
  getQuickTradeData(index) {
    
    console.log('getQuickTradeData')
    
    const rate = this._cards[Object.keys(this._cards)[index]]||1
    const traders = this.traderId.split('-')
    let priceProduct, productProduct

    this.personalDataService.personalStockList.forEach(item => {
      //获取交易信息
      if (item.stockCode === traders[0]) {
        priceProduct = item
      } else if (item.stockCode === traders[1]) {
        productProduct = item
      }

    })

    if (priceProduct) {
      //可卖数量
      this.buyTotalQuantity = priceProduct.saleableQuantity * rate
      this.buyTotalAmount = undefined
      // priceid productid totalprice
      this.tradeService.getQuickTradeData('001', traders[1], traders[0], this.buyTotalQuantity)
        .then(data => {
          if (data) {
            this.buyTotalQuantity = data.forecastAmount
            this.buyTotalAmount = data.forecastPrice
            this.buyQuantityMax =  data.forecastAmount/1e8;
            console.log('........',this.buyQuantityMax)
          } 
          // else {
          //   this.buyTotalQuantity = 0
          // }
        })
    }
    if (productProduct) {
      this.saleTotalQuantity = productProduct.saleableQuantity * rate
      this.saleTotalAmount = undefined
      this.tradeService.getQuickTradeData('002', traders[1], traders[0], this.saleTotalQuantity)
        .then(data => {
          if (data) {
            this.saleTotalQuantity = data.forecastAmount
            this.saleTotalAmount = data.forecastPrice
            this.saleQuantityMax = data.forecastAmount/1e8;
           

            console.log('........',this.saleQuantityMax)
          } 
          // else {
          //   this.saleTotalQuantity = 0
          // }
        })
    }
  }

  async quickTrade(tradeType){
    if(!this.appSetting.getUserToken()){
      return this.goLogin();
    }
    await this.personalDataService.requestCertifiedStatus();
    if(!(this.personalDataService.certifiedStatus == '101')){
      return this.validateIdentify();
    }
  
    if (this.quickTrading) {
      return void 0
    }
    let transactionType = ''
    let amount:any = 0
    if (tradeType === 'buy') {
      transactionType = '001'
      amount = this.buyTotalQuantity
    }else if (tradeType === 'sale') {
      transactionType = '002'
      amount = this.saleTotalQuantity
    }else {
      return void 0
    }

    if(!Number(amount)){
      this.alertService.showAlert('下单失败', '预计成交额为0')
      return void 0
    }

    this.alertService.presentLoading('')

    try{
      const index = this.buySaleActiveIndex.getValue()
      const rate = this._cards[Object.keys(this._cards)[index]]
      const traders = this.traderId.split('-')
      const priceId = traders[0]
      const productId = traders[1]

      this.quickTrading = true
      this.tradeService.quickTrade(transactionType, productId, priceId, amount)
        .then(async data => {
          if (!data.realityAmount){
            return Promise.reject({message:'无委托提交'})
          }
          //刷新账户信息
          await this.personalDataService.requestFundData().catch(() => { });
          await this.personalDataService.requestEquityDeposit().catch(() => { });
          this.getQuickTradeData(index)          

          this.alertService.dismissLoading()

          const toast = this.promptCtrl.toastCtrl({
            message: `快捷下单成功`,
            duration: 3000,
            position: 'middle'
          })
          toast.present()

          //下单成功刷新委托单
          this.page = 1
          this.getProcessEntrusts()
        })
        .catch(err => {
          this.alertService.dismissLoading()
          if(err&&err.message){
            this.alertService.showAlert('下单失败',err.message)
          }
        })
        .then(() => this.quickTrading = false)
    }finally{
      // this.alertService.dismissLoading()
    }

  }


  private personalAssets: object = {};
  requestAssets() {
    const traders = this.traderId.split('-')

    this.personalDataService.personalStockList.forEach(item => {
      if (item.stockCode === traders[0]) {
        this.trader_target = item
      } else if (item.stockCode === traders[1]) {
        this.trader_product = item
      }
    
    })

    this.personalDataService
      .personalAssets()
      .then(async data => {
        for (let key in data) {
          const item = data[key];
          let priceName = '';
          const product = await this.stockDataService.getProduct(item.priceId)

          if (product) priceName = `${product.productName}`;
          item.priceName = priceName;
        }
        console.log('requestAssets', data);
        this.personalAssets = data;
      })
      .catch(err => {
        console.log('requestAssets:', err);
      });
  }
  
  goLogin(){
    this.events.publish('show login', 'login', this.refreshPersonalData.bind(this)); 
  }

 
	validateIdentify(){
		if(this.personalDataService.certifiedStatus == '101' ){
			return ;
		}
		let options:any = {};
		//title 不能设置在初始化中，会没掉
		if(this.personalDataService.certifiedStatus == '102'|| this.personalDataService.certifiedStatus == '104' ){
			alert['title'] = `交易失败`;
			alert['message'] = `实名认证${this.personalDataService.realname || this.personalDataService.certifiedMsg}`;
			alert['buttons'] = [
				{
					text: '取消',
					role: 'cancel',
					handler: () => {
						// console.log('Cancel clicked')
					}
				},
				{
					text: '认证',
					handler: () => {
						this.navCtrl.push('submit-real-info');
					}
				}
			];
		} 
		if(this.personalDataService.certifiedStatus == '103'){
			alert['title'] = "交易失败";
			alert['message'] = `实名认证${this.personalDataService.realname|| this.personalDataService.certifiedMsg}`;
			alert['buttons'] = [
				{
					text: '确认',
					role: 'cancel',
					handler: () => {
						// console.log('Cancel clicked')
					}
				}
			];
		}
		// 避免空白提示
		if(!(JSON.stringify(alert) == "{}")){
			this.alertCtrl.create(
				Object.assign(
					alert
				)
			).present();
		}
  }
  
  //格式处理18位，整数18，小数10+8
  numberFormat(number:any = "0",delete0?:boolean){
  
    number = typeof number == "string" ? number : number.toString();
    if(delete0){
      number = this.numberFormatDelete0(number);
    }
    number = number.split('.');
    if(number[0].length > 1){
      number[0] =  number[0].replace(/\b(0+)/gi,"");
      number[0] = number[0] == ''? "0": number[0];
    }
    if(number[1]){
      number[0] =  number[0].length > 10? number[0].substr(-10) : number[0];
      number[1] =  number[1].length > 8? number[1].substr(0,8) : number[1];
      return number[0]+'.'+number[1];
    }else{
      return number[0].length > 18? number[0].substr(-18) : number[0];
    }
    
  }

  numberFormatDelete0(number:string|number){
    let arrExp:any ;
    if(typeof number == "number") number = number.toString();
    number = number.split("").reverse().join("");
    arrExp = /[1-9|\.]/ig.exec(number)
    if(arrExp){
        if(arrExp[0] == '.'){
          number = number.substring(arrExp.index+1)
        } else {
          number = number.substring(arrExp.index)
        }
        return  number.split("").reverse().join("")
    }
    return number;
  }
}
