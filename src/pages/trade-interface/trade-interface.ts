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

@Component({
  selector: 'page-trade-interface',
  templateUrl: 'trade-interface.html'
})
export class TradeInterfacePage {
  stockCode: string = this.appSettings.SIM_DATA ? 
    '000001' : undefined;

  tradeType:number = 1 //1是买,0是卖
  
  private _saleableQuantity$: Observable<number>;

  private _baseData$: Observable<any>;

  private _realtimeData$: Observable<any>;

  private viewDidLeave: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private viewDidLeave$ = this.viewDidLeave
            .asObservable()
            .distinctUntilChanged()
            .filter(value => value === true);

  // liquiddata:any;

  price: string = '0.00';
  amount: string = '0';
  maxAmount: string = '100';
  range = 0;
  @ViewChild('quantityRange') Range:any

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

  initData() {
    console.log('trade-interface')
    this.stockDataService.stockBaseData$
      .map(data => data[this.stockCode])
      .filter(data => data !== undefined)
      // 使用 first() 以确保只订阅第一次有效数据。
      .first()
      .subscribe(baseData => {
        // console.log(baseData.bets, baseData.latestPrice);
        const { handBase = 100, bets, latestPrice } = baseData;
        this.handBase = handBase;
        const price = Number(bets && (bets[5].price || bets[4].price) ||
                        latestPrice ||
                        0
                      );
        this.price = price.toFixed(2)
        if (price > 0) {
          this.amount = (Math.floor(this.personalDataService.accountBalance / price / handBase) * handBase).toString();
        }
      })
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
      this._saleableQuantity$ = this.personalDataService.personalStockList$
        .map(arr => arr.filter(item => item.stockCode === stockCode))
        .map(arr => arr.length && +arr[0].saleableQuantity || 0)
        .distinctUntilChanged();
      this._baseData$ = this.stockDataService.stockBaseData$.map(data => data[stockCode])
        .do(data => console.log('final data:',data));
      this._realtimeData$ = this.stockDataService.stockRealtimeData$.map(data => data[stockCode]);

      this.initData();
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
      if(this.tradeType === 1){
        //可用资金/价格
      }else if(this.tradeType === 0){
        //最大持仓
      }else{

      }
    }
  }

  formatNumber(target: string, precision: number = 0){
    this.changeByStep(target, 0, precision);
  }

  // toBuy() {
  //   this.doTrade(1)
  // }

  // toSale() {
  //   this.doTrade(2)
  // }

  chooseTradeType($event: MouseEvent){
    const dataset = ($event.target as HTMLElement).dataset
    if (dataset && dataset.tradeType){
      this.tradeType = Number(dataset.tradeType)
    }
  }

  doTrade(tradeType: number = this.tradeType){
    // 界面按钮已根据是否 可买/可卖 进行了限制，
    // 此处没有再进行判断。
    const price = parseFloat(this.price);
    const amount = parseInt(this.amount, 10);

    console.log(tradeType)
    console.log(this.Range.ratio)

    this.tradeService
      .purchase(
        this.stockCode,
        '',
        tradeType,
        amount,
        price,
      )
      .then(resData => {
        console.log(resData)
        // [{ "FID_CODE": "1", "FID_MESSAGE": "委托成功,您这笔委托的合同号是:201" }]
        const result = resData instanceof Array ? resData[0] : resData
        
        if (typeof result === 'object' && result.FID_CODE) {
          let toast = this.toastCtrl.create({
            message: `${result.FID_MESSAGE}`,
            duration: 3000,
            position: 'middle'
          })
          toast.present()
          //初始化数据
          this.amount = '0';
        }else{
          return Promise.reject(result);
        }
        console.log('trade done:')
        this.alertService.dismissLoading()
      })
      .catch(err => {
        console.log('trade err:', err);
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

  // 订阅实时数据。
  // 由于 DataSubscriber 装饰器的作用，
  // 会在 ionViewDidEnter() 事件处理函数中被自动调用。
  doSubscribe(){
    const stockCode = this.stockCode;
    console.log('trade-interface: ',stockCode)
    if (stockCode){
      this.stockDataService.subscibeRealtimeData(stockCode, undefined, this.viewDidLeave$)
        .takeUntil(this.viewDidLeave$.delay(this.appSettings.UNSUBSCRIBE_INTERVAL))
        // 必须订阅，数据才会流动，即使订阅函数内部没有做任何操作。
        .subscribe();
    }
  }

}
