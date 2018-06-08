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
import { AppDataService } from '../../providers/app-data-service';
import { SocketioService } from "../../providers/socketio-service";
import { AppSettings } from '../../providers/app-settings';
import { StockDataService } from '../../providers/stock-data-service';
import * as echarts from 'echarts';


// 未完成，完成后整理代码格式与调用逻辑
@Component({
  selector: 'page-trade-chart-v2',
  templateUrl: 'trade-chart-v2.html'
})
export class TradeChartV2Page {

  private product:any = '--- / ---';
  private traderId:any;

  private timeArray: string[] = [
    window['language']['1M']||'1分',
    window['language']['5M']||'5分',
    window['language']['15M']||'15分',
    window['language']['30M']||'30分', 
    window['language']['1H']||'1小时', 
    window['language']['1D']||'1天', 
    window['language']['1W']||'1周'];
  private timeTypeArr: string[] = ['1m','5m','15m','30m','1h','1d','1w'];
  public timeType: string = '1m';

  private _baseData$: Observable<any>;
  private _reportsData$: Observable<any> = Observable.of([])

  private viewDidLeave: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private viewDidLeave$ = this.viewDidLeave
  .asObservable()
  .distinctUntilChanged()
  .filter(value => value === true);

  realtimeOptions =1;

  @ViewChild('largeRealtimeChart') largeRealtimeChart;
    

  constructor(
      private navParams: NavParams,
      public appDataService: AppDataService,
      private socketioService: SocketioService,
      public appSettings: AppSettings,
      public alertCtrl: AlertController,
      public navCtrl: NavController,
      public stockDataService: StockDataService,
  ) { 


    alertCtrl.create({
      title:'k线图数据对接中',
      message:"当前页面仅供样式观看",
      buttons:[
          {
              text: '确定',
              role: 'cancel',
              handler: () => {
              // console.log('Cancel clicked')
              }
          }
      ]
    }).present();
    this.socketioService
    .subscribeEquity(this.traderId, 'chartPrice','1m')
    .do(data => console.log('trade-chart-v2_price: ',data)) 
    this.init();
    
  }

  init() {
    this.traderId = this.navParams.get('stockCode') || this.navParams.data ;
    this.product = this.appDataService.traderList.get(this.traderId) ;
    const traderId = this.traderId;
    console.log('trade-chart-v2:(doSubscribe) ', traderId)
    if (traderId){
      const trader = this.appDataService.traderList.get(traderId)
      this._baseData$ = trader.marketRef;
      this.changeTime(0)
    }
    
  }

  activeIndex;
  changeTime(index) {
    if( this.activeIndex == index) return ;
    this.activeIndex = index;
    this.timeType = this.timeTypeArr[index];
    this.changeReportType(index);
  } 

  changeReportType(index) {
    
    this._reportsData$ = this.socketioService.subscribeRealtimeReports([this.traderId],undefined,{timespan:this.timeTypeArr[index]})
      .do(data => console.log('trade-chart-v2_reportsData: ',data)) 
      .takeUntil(this.viewDidLeave$)
      .filter(({ type }) => type === this.traderId)
      .map(data => data.data)
      .map(data => {
        //处理增量更新 
        const srcArr = []
        srcArr.push(...data)//使用push+解构赋值,预期echarts动画实现
        const length = srcArr.length
        if (length > this.appSettings.Charts_Array_Length) { 
          srcArr.splice(0, length - this.appSettings.Charts_Array_Length)
        }
        console.log('trade- chart_reportsData:srcArr:', srcArr)
        return srcArr.concat()
      });
        // this.stockDataService
				// .subscibeRealtimeData(value.traderId, 'chartPrice',undefined,'1m') 
				// .subscribe(value.chartRef)//, this.viewDidLeave$) 
     
  }

  backPage() {
    this.navCtrl.pop()
  }
}



