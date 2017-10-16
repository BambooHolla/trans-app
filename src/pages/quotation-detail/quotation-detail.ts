import { Component ,ViewChild} from '@angular/core';
import { Slides} from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AppSettings } from '../../providers/app-settings';
import { SocketioService } from '../../providers/socketio-service';
import { StockDataService } from '../../providers/stock-data-service';

// import * as echarts from 'echarts';
// import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-quotation-detail',
  templateUrl: 'quotation-detail.html'
})
export class QuotationDetailPage {
  stockCode = '000001';
  @ViewChild(Slides) slides: Slides;
  activeIndex: number = 0;
  public currentPage: string = 'notice';

  restoreTimer = null;

  useTempData: BehaviorSubject<boolean> = new BehaviorSubject(false);

  useTempData$ = this.useTempData
    .asObservable()
    .distinctUntilChanged();

  tempData: BehaviorSubject<AnyObject> = new BehaviorSubject({
    latestPrice: 0,
    maxPrice: 0,
    minPrice: 0,
    yesterdayPrice: 0,
    startPrice: 0,
    turnoverQuantity: 0,
    turnoverAmount: 0,
    changeValue: 0,
    changeRate: 0,
    avgPrice: 0,
  });

  // distinctUntilChanged() 不带参数时，对于复杂类型的数据采用浅比较方式，
  // 因此无法真正分辨出数据是否已修改，只要 tempData.next() 传入了新值，就会认为数据已改变。
  // distinctUntilChanged() 可以接受一个回调函数作为参数，
  // 回调函数的第一个参数是旧数据，第二个参数是新数据，
  // 返回值为布尔值，返回 true 时视为数据未变更，返回 false 时视为已变更。
  tempData$ = this.tempData
    .asObservable()
    .distinctUntilChanged();

  showData: AnyObject = {};

  _stockCode = '000001';

  private _baseData$: Observable<any>;

  private _kData$: Observable<{ [key: string]: any[] }>;

  private viewDidLeave: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private viewDidLeave$ = this.viewDidLeave
            .asObservable()
            .distinctUntilChanged()
            .filter(value => value === true);

  titleArray: any[] = [
  {
    icon: "volume-up",
    title: '公告',
  },
  {
    icon: "gnews",
    title: '新闻',
  },
  ]
  noticeListData: any[] = [
    {
      id: "1",
      title: '关于三明节能（股权代码200003）的股权挂牌公告',
      time:'2016-06-27 14:17:00',
    },
    {
      id: "2",
      title: '关于展示版700003 坚强缝制企业信息',
      time:'2016-06-26 11:10:00',
    },
    {
      id: "3",
      title: '关于展示版700003 坚强缝制企业信息',
      time:'2016-06-26 11:10:00',
    },
    {
      id: "4",
      title: '关于三明节能（股权代码200003）的股权挂牌公告',
      time:'2016-06-27 14:17:00',
    },
  ];

   newsListData: any[] = [
    {
      id: "1",
      title: '关于展示版700003 坚强缝制企业信息',
      time:'2016-06-26 11:10:00',
    },
    {
      id: "2",
      title: '关于三明节能（股权代码200003）的股权挂牌公告',
      time:'2016-06-27 14:17:00',
    },
    {
      id: "3",
      title: '关于展示版700003 坚强缝制企业信息',
      time:'2016-06-26 11:10:00',
    },
    {
      id: "4",
      title: '关于三明节能（股权代码200003）的股权挂牌公告',
      time:'2016-06-27 14:17:00',
    },
  ];
  

  constructor(/*public navCtrl: NavController*/
    public appSettings: AppSettings,
    public socketioService: SocketioService,
    public stockDataService: StockDataService,
  ) {

  }

  ionViewDidEnter() {
    this.viewDidLeave.next(false);

    this.doSubscribe();
  }

  ionViewDidLeave(){
    this.viewDidLeave.next(true);
  }

  doSubscribe() {
    // 实际需要替换为指数，而非股票行情。
    const stockCode = this._stockCode;
    this._baseData$ = this.stockDataService.stockBaseData$.map(data => data[stockCode]);
    this.stockDataService.requestStockBaseData(stockCode)
      .catch(() => {})

    this._kData$ = this.stockDataService.stockKData$.map(data => data[stockCode] || {});
    this.stockDataService.requestKData(stockCode, 'day')
      .catch(() => {})

    this.stockDataService.subscibeRealtimeData(stockCode, undefined, this.viewDidLeave$)
      .takeUntil(this.viewDidLeave$.delay(this.appSettings.UNSUBSCRIBE_INTERVAL))
      // 必须订阅，数据才会流动，即使订阅函数内部没有做任何操作。
      .subscribe();

    Observable
      .combineLatest(
        this._baseData$,
        this.useTempData$,
        this.tempData$,
      )
      .takeUntil(this.viewDidLeave$)
      .subscribe(([baseData, useTempData, tempData]) => {
        this.showData = useTempData ? tempData : baseData;
      })
  }

  tabChanged(slides) {
    const destIndex = slides._snapIndex;
    if (slides.isEnd() && slides.getActiveIndex() === destIndex + 1) {
      slides.slideTo(destIndex, 0);
    }
    this.activeIndex = destIndex;
  }

  changeActive(index){
    if (index !== this.activeIndex){
      this.slides.slideTo(index);
    }
  }

  switchToTempData(){
    this.useTempData.next(true);

    if (this.restoreTimer){
      clearTimeout(this.restoreTimer);
    }

    this.restoreTimer = setTimeout(() => {
      this.useTempData.next(false);
      this.restoreTimer = null;
    }, 3e3);
  }

  showVolumnTooltop(params){
    // console.log(params[0]);
    const date = params[0].axisValue;

    const sourceData = this.stockDataService.getStockKData(this.stockCode, 'day');
    const sourceItem = sourceData.find(item => item.date === date);
    if (sourceItem){
      // console.log(sourceItem);
      // 代码需改进，考虑使用 RxJS 。

      const changeValue = sourceItem.endPrice - sourceItem.yesterdayPrice;
      const changeRate = changeValue / sourceItem.yesterdayPrice;
      this.tempData.next({
        ...sourceItem,
        latestPrice: sourceItem.endPrice,
        changeValue,
        changeRate,
      });

      // console.log(this.tempData);

      this.switchToTempData();
    }
  }
}
