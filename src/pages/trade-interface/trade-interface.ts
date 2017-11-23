import { Component, ViewChild } from '@angular/core';
// import * as echarts from 'echarts';
import { NavParams, ToastController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AppSettings } from '../../providers/app-settings';
import { StockDataService } from '../../providers/stock-data-service';
import { PersonalDataService } from "../../providers/personal-data-service";
import { TradeService } from '../../providers/trade-service';
import { AppDataService } from '../../providers/app-data-service';
import { AlertService } from '../../providers/alert-service';
import { SocketioService } from "../../providers/socketio-service";

@Component({
  selector: 'page-trade-interface',
  templateUrl: 'trade-interface.html'
})
export class TradeInterfacePage {
  stockCode: string = this.appSettings.SIM_DATA ? 
    '000001' : undefined;

  tradeType:number = 1 //1是买,0是卖

  private _tradeType$: BehaviorSubject<number> = new BehaviorSubject(1);
  tradeType$: Observable<number> = this._tradeType$
    .asObservable()
    .distinctUntilChanged()

  traderList = []
  traderId
  reportArr = []

  private _saleableQuantity$: Observable<number>;

  private _baseData$: Observable<any>;
  private _depth$: Observable<any>;

  private _realtimeData$: Observable<any>;

  private viewDidLeave: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private viewDidLeave$ = this.viewDidLeave
            .asObservable()
            .distinctUntilChanged()
            .filter(value => value === true);

  // liquiddata:any;

  _price: BehaviorSubject<string> = new BehaviorSubject(undefined)
  set price(str){
    this._price.next(str)
  }
  get price(){
    return this._price.getValue()
  }
  amount: string = '0';
  maxAmount: string = '100';
  range = 0;
  @ViewChild('quantityRange') Range: any
  @ViewChild('priceInputer') PriceInputer: any
  @ViewChild('amountInputer') AmountInputer: any

  handBase = 100;

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
  initData() {
    console.log('trade-interface')

    const traderList = []
    this.appDataService.traderList.forEach((value, key, map) => {
      traderList.push(value)
    })
    this.traderList = traderList
    this.traderId = traderList[0] ? traderList[0].traderId:undefined
    this.stockCode = this.traderId || this.stockCode
    // this.stockDataService.stockBaseData$
    //   .map(data => data[this.stockCode])
    //   .filter(data => data !== undefined)
    //   // 使用 first() 以确保只订阅第一次有效数据。
    //   .first()
    //   .subscribe(baseData => {
    //     // console.log(baseData.bets, baseData.latestPrice);
    //     const { handBase = 100, bets, latestPrice } = baseData;
    //     this.handBase = handBase;
    //     const price = Number(bets && (bets[5].price || bets[4].price) ||
    //                     latestPrice ||
    //                     0
    //                   )/this.appSettings.Price_Rate
    //     this.price = price.toFixed(2)
    //     if (price > 0) {
    //       this.amount = (Math.floor(this.personalDataService.accountBalance / price / handBase) * handBase).toString();
    //     }
    //   })
  }
  
  backInOut(k) {
      var s = 1.70158 * 1.525;
      if ((k *= 2) < 1) { return 0.5 * (k * k * ((s + 1) * k - s)); }
      return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
  }

  constructor(
    // public navCtrl: NavController,
    public toastCtrl: ToastController,
    public appSettings: AppSettings,
    public appDataService: AppDataService,
    private socketioService: SocketioService,
    private stockDataService: StockDataService,
    private navParams: NavParams,
    public personalDataService: PersonalDataService,
    public tradeService: TradeService,
    public alertService: AlertService,
  ) {
    this.stockCode = this.navParams.get('stockCode') || this.stockCode;
    if (!this.stockCode) this.appDataService.products.forEach((value, key, map) => {
      this.stockCode = key;
      return;
    })
    const stockCode =  this.stockCode
    if (stockCode) {
      console.log('trade-interface:(constructor)',stockCode)
      this._saleableQuantity$ = this.personalDataService.personalStockList$
        .map(arr => arr.filter(item => item.stockCode === stockCode))
        .map(arr => arr.length && +arr[0].saleableQuantity || 0)
        .distinctUntilChanged();

      this.initData()
      this.doSubscribe()
    }
  }

  changeByStep(target: string, step: number, precision: number = 0) {
    const invBase = Math.pow(10, -precision);
    // 最后必须使用除法，如果用乘法会出现浮点数表示的问题。
    // 例如 602 * 0.01 = 6.0200000000000005 ，
    // 改用 602 / 100 就可以得到正确结果。
    const result = Math.max(0, Math.round((+this[target] + step) * invBase) / invBase);
    this[target] = result.toFixed(Math.max(0, -precision));
    //TODO:价格改变时修改最大可交易数量
    if(target === 'price'){
      if(this._tradeType$.getValue() === 1){
        //可用资金/价格
      } else if (this._tradeType$.getValue() === 0){
        //最大持仓
      }else{

      }
    }
  }

  formatNumber(target: string, precision: number = 0){
    this.changeByStep(target, 0, precision);
  }

  chooseTradeType($event: MouseEvent){
    const dataset = ($event.target as HTMLElement).dataset
    if (dataset && dataset.tradeType){
      this._tradeType$.next(Number(dataset.tradeType))
    }
  }

  doTrade(tradeType: number = this._tradeType$.getValue()){
    // 界面按钮已根据是否 可买/可卖 进行了限制，
    // 此处没有再进行判断。
    const price = parseFloat(this.price);
    const amount = parseInt(this.amount, 10);

    console.log('doTrade:',
      this.stockCode, ' | ',
      tradeType, ' | ',
      amount, ' | ',
      price, )

    this.tradeService
      .purchase(
        this.stockCode,
        '',
        tradeType,
        amount,
        price,
      )
      .then(resData => {
        console.log('doTrade:',resData)
        // [{ "FID_CODE": "1", "FID_MESSAGE": "委托成功,您这笔委托的合同号是:201" }]
        const result = resData instanceof Array ? resData[0] : resData
        
        if (typeof result === 'object' && result.id) {
          let toast = this.toastCtrl.create({
            message: '委托单已提交',//`${result.id}`,
            duration: 3000,
            position: 'middle'
          })
          toast.present()
          //初始化数据
          this.amount = '0';
        }else{
          return Promise.reject(result);
        }
        console.log('doTrade done:')
        this.alertService.dismissLoading()
      })
      .catch(err => {
        console.log('doTrade err:', err);
        if(err && err.message){
          let toast = this.toastCtrl.create({
            message: `${err.message}`,
            duration: 3000,
            position: 'middle'
          })
          this.alertService.dismissLoading()          
          toast.present()
        }
        console.log(err.statusText || err.message || err)
      });
  }

  ionViewDidEnter(){
    this.viewDidLeave.next(false);
    console.log('pricetarget', this.PriceInputer)
    console.log('pricetarget', this.PriceInputer.getElementRef())
    console.log('pricetarget', this.PriceInputer.getNativeElement())
    this.subscribeTradeData()

    this.initData();

    this.doSubscribe();
    // this.liquiddata = [{
    //   name: '1机',
    //   value: 0.7
    // }, 0.69];
  }

  ionViewDidLeave(){
    this.viewDidLeave.next(true);
  }

  subscribeTradeData() {
    Observable.combineLatest(
      this._tradeType$,
      this._price,
      // Observable.fromEvent(this.Price.getNativeElement(),'input') ,
    )
      .distinctUntilChanged()
      .debounceTime(300)
      .subscribe(([tradeType, price]) => {
        // console.log('pricetarget result ', tradeType,
        //   ' | ', price
        // )
        //TODO:交易类型,价格 变动触发 最大可交易量变动
        if(tradeType === 1){
          
          this.maxAmount 
          this.amount 
        }else if(tradeType === 0){

        }
      })
  }

  // 订阅实时数据。
  // 由于 DataSubscriber 装饰器的作用，
  // 会在 ionViewDidEnter() 事件处理函数中被自动调用。
  doSubscribe(){
    const stockCode = this.stockCode;
    console.log('trade-interface:(doSubscribe) ',stockCode)
    if (stockCode){
      this._baseData$ = this.stockDataService.subscibeRealtimeData(stockCode, 'price', this.viewDidLeave$)
        .do(data => console.log('trade-interface:1', data))
        //初始化买卖价格
        .do(data => {
          console.log('doSubscribe do')
          this.price = String(data.price / this.appSettings.Price_Rate)
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
      if(!this._depth$){
        this._depth$ = this.socketioService.subscribeEquity(stockCode, 'depth')
          .do(data => console.log('trade-interface:depth:', data))
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
      }

      // this._realtimeData$ = this.stockDataService.stockRealtimeData$.map(data => data[stockCode]);
      
      this._realtimeData$ = this.socketioService.subscribeRealtimeReports([this.traderId])
        .do(data => console.log('trade-interface_realtimeData: ',data))
        .takeUntil(this.viewDidLeave$)
        .map(data => data.data)
        .map(data => {
          //处理增量更新
          const srcArr = this.reportArr
          srcArr.push(...data)//使用push+解构赋值,预期echarts动画实现
          const length = srcArr.length
          if (length > this.appSettings.Charts_Array_Length) {
            srcArr.splice(0, length - this.appSettings.Charts_Array_Length)
          }
          return srcArr
        })
    }
  }

}
