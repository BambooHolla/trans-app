import { Component, ViewChild } from '@angular/core';
// import * as echarts from 'echarts';
import { NavController, NavParams, Slides, Platform, ToastController } from 'ionic-angular';

import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TradeInterfacePage } from '../trade-interface/trade-interface';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AppSettings } from '../../providers/app-settings';
import { PersonalDataService } from '../../providers/personal-data-service';
import { SocketioService } from '../../providers/socketio-service';
import { StockDataService } from '../../providers/stock-data-service';
import { TradeService } from '../../providers/trade-service';

@Component({
  selector: 'page-stock-detail',
  templateUrl: 'stock-detail.html'
})
export class StockDetailPage {
  private _stockCode: string;

  kDataUnit: string = '';

  candlestickOptions = {
    customTooltip: true,
    candlestickcalculateList : [[5,'rgba(254, 53, 53, .6)'],[10,'purple'],[20,'blue'],[30,'green']],
    yAxisLabel: {
      inside : true,
      showMinLabel :false,
      showMaxLabel :false,
      textStyle: {
        fontSize: 10,
        color:'#fff'
      },
    },
    ySplitLine : {
      show: false,
    },
    // ySplitNumber:4,
    yAxisShow : false,
  };

  realtimeOptions = {
    customTooltip: true, 
    yAxisStyle: {
      color: 'rgba(255, 255, 255, 0.1)',
      type: 'dashed',
    },
    textColor: '#505050',
    gridLeft: '0',
    gridTop: '12px',
    gridBottom: '0px',
    align: 'bottom',
    yAxisSize: '10',
    showTimeLabelPerHour: false,
  };

  realtimeFullOptions = {
    customTooltip: true, 
    yAxisStyle: {
      color: 'rgba(255, 255, 255, 0.1)',
      type: 'dashed',
    },
    textColor: '#505050',
    gridLeft: '0',
    gridTop: '12px',
    gridBottom: '0px',
    align: 'bottom',
    yAxisSize: '10',
  };

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
    datetime: '',
  });

  tempData$ = this.tempData
    .asObservable()
    .distinctUntilChanged();

  showData: AnyObject = {};

  private _saleableQuantity$: Observable<number>;

  private _baseData$: Observable<AnyObject>;

  private _realtimeData$: Observable<AnyObject>;

  private _kData$: Observable<{ [key: string]: any[] }>;

  isPortrait: boolean = true;

  pageReady: boolean = false;

  averagePrice: any;

  realTimeRate: any;

  turnoverQuantity: any;

  tradeInterfacePage: any = TradeInterfacePage;

  @ViewChild('sld') sld: Slides;

  activeIndex: number = 0;

  cards: string[] = ['满仓', '1/2仓', '1/3仓', '1/4仓', '1手', '5手', '10手'];

  buySaleActiveIndex: BehaviorSubject<number> = new BehaviorSubject(0);

  timeArray: string[] = ['分时', '日K', '周K', '月K'];

  @ViewChild('slide') slide: Slides;

  activeIndexs: number = 0;

  buyTotalAmount = 0;

  buyTotalQuantity = 0;

  saleTotalAmount = 0;

  saleTotalQuantity = 0;

  buyTempPrice = 0;

  saleTempPrice = 0;

  betsHidden: boolean = false;

  // activeIndexes: number[];

  @ViewChild('largeRealtimeChart') largeRealtimeChart;

  buyCircleClass: {rise?: boolean, fall?: boolean} = {};
  saleCircleClass: {rise?: boolean, fall?: boolean} = {};

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
        {
          icon: "greview",
          title: '点评',
        },
      ]

  noticeListData: any[] = [
        {
          id: "1",
          title: '关于三明节能（股权代码200003）的股权挂牌公告',
          time: '2016-06-26 11:10:00',
        },
        {
          id: "2",
          title: '关于展示版700003 坚强缝制企业信息',
          time: '2016-06-27 14:17:00',
        },
        {
          id: "3",
          title: '关于展示版700003 坚强缝制企业信息',
          time: '2016-06-26 11:10:00',
        },
        {
          id: "4",
          title: '关于三明节能（股权代码200003）的股权挂牌公告',
          time: '2016-06-27 14:17:00',
        },
      ];

  newsListData: any[] = [
      {
        id: "1",
        title: '关于展示版700003 坚强缝制企业信息',
        time: '2016-06-26 11:10:00',
      },
      {
        id: "2",
        title: '关于三明节能（股权代码200003）的股权挂牌公告',
        time: '2016-06-27 14:17:00',
      },
      {
        id: "3",
        title: '关于展示版700003 坚强缝制企业信息',
        time: '2016-06-26 11:10:00',
      },
      {
        id: "4",
        title: '关于三明节能（股权代码200003）的股权挂牌公告',
        time: '2016-06-27 14:17:00',
      },
    ];

    stockCodeParams = {
      stockCode: '',
    };

    constructor(
      public navCtrl: NavController,
      public platform: Platform,
      public statusBar: StatusBar,
      public androidFullScreen: AndroidFullScreen,
      public appSettings: AppSettings,
      public personalDataService: PersonalDataService,
      public socketioService: SocketioService,
      public stockDataService: StockDataService,
      public tradeService: TradeService,
      public toastCtrl: ToastController,
      private navParams: NavParams,

    ) {
      // this.slidesList = [this.sld, this.slide];
      // this.activeIndexes = [0, 0];
      // console.log(this.slidesList);
      if (this.navParams && typeof this.navParams.data === 'string'){
        this.stockCodeParams.stockCode = this._stockCode = this.navParams.data;
      }
      // console.log('StockDetailPage constructor', this._stockCode)
    }

  ionViewDidEnter() {
    this.viewDidLeave.next(false);
    this.doSubscribe();
  }

  ionViewDidLeave(){
    this.viewDidLeave.next(true);
  }

  doSubscribe(){
    // console.log('StockDetailPage doSubscribe', this._stockCode)
    if (this._stockCode){
      const stockCode = this._stockCode;
      this._saleableQuantity$ = this.personalDataService.personalStockList$
        .map(arr => arr.filter(item => item.stockCode === this._stockCode))
        .map(arr => arr.length && +arr[0].saleableQuantity || 0)
        .distinctUntilChanged();
      this._baseData$ = this.stockDataService.stockBaseData$.map(data => data[stockCode]);
      this._realtimeData$ = this.stockDataService.stockRealtimeData$.map(data => data[stockCode]);
      this._kData$ = this.stockDataService.stockKData$.map(data => data[stockCode] || {});
      this.stockDataService.requestStockBaseData(stockCode)
        .catch(() => {})

      this.stockDataService.subscibeRealtimeData(stockCode, undefined, this.viewDidLeave$)
        .takeUntil(this.viewDidLeave$.delay(this.appSettings.UNSUBSCRIBE_INTERVAL))
        // 必须订阅，数据才会流动，即使订阅函数内部没有做任何操作。
        .subscribe();

      // 要求：快速买卖的计算必须是实时的。
      // 合并三个数据流：股票可卖数量（未冻结的持仓数量）、股票基本数据、快速买卖当前的激活位置索引，
      // 在其中任意一者发生变化时，都重新计算买卖数量与金额。
      // 若只订阅 股票基本数据流，则变更快速买卖激活位置时，不会立刻触发计算过程！
      // 合并后返回的数据，严格遵守合并时的数据流顺序。
      // 此处实际上缺少一个要素：账户内的可用资金量！
      // 这样在可用资金量发生变化时，不会去调用重新计算的过程。
      // 目前不是太大的问题，今后若有可能，应当进行修复。
      Observable
        .combineLatest(
          this.buySaleActiveIndex,
          //FIXME ：添加余额的监听
          this._saleableQuantity$,
          this._baseData$,
        )
        // 使用 takeUntil() 在离开当前视图时自动取消订阅。
        .takeUntil(this.viewDidLeave$)
        .subscribe((data) => {
          this.buySale(...data);
        })

      // 合并三个数据流：股票基本数据、是否使用临时数据、临时数据的值。
      // 在任意一者变化时，修改 showData 属性的值。
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

      this._baseData$
        .map(data => data.handBase)
        .filter(handBase => handBase > 0)
        .distinctUntilChanged()
        .first()
        .subscribe(handBase => {
          const start = this.factorArray.length
          ;[1, 5, 10].forEach((base, index) => {
            this.cards[start + index] = (base * handBase).toString()
          })
        })
    }
  }

  factorArray = [1, 0.5, 1 / 3, 1 / 4];

  convenientHandArray = [1, 5, 10];

  //刷新股票市场情况,并返回涨跌状态
  checkMarket(index, saleableQuantity, baseData){
    if (index < 0 || !baseData) {
      return;
    }

    const { latestPrice, yesterdayPrice, bets, handBase: oneHand } = baseData;
    if (!bets || !Array.isArray(bets) || oneHand <= 0) {
      return;
    }
    
    const buy1Price = bets[5] && bets[5].price;
    const sale1Price = bets[4] && bets[4].price;
    // 涨停时，买一档会没有价格，此时需要将买入价调整到卖一档。
    const buyTempPrice = this.buyTempPrice = buy1Price || sale1Price || latestPrice || 0;
    // 卖出价格同理，在跌停时需要特殊处理。
    const saleTempPrice = this.saleTempPrice = sale1Price || buy1Price || latestPrice || 0;

    const factorArrayLength = this.factorArray.length;

    const maxBuyQuantity = buyTempPrice ?
      this.personalDataService.accountBalance / buyTempPrice :
      0;

    if (index < factorArrayLength) {
      const saleQuantity = saleableQuantity * this.factorArray[index];
      this.buyTotalQuantity = Math.floor(maxBuyQuantity * this.factorArray[index] /  oneHand) * oneHand;
      this.saleTotalQuantity = Math.floor(saleQuantity / oneHand) * oneHand;
    } else {
      const buyQuantity = oneHand * this.convenientHandArray[index - factorArrayLength];
      this.buyTotalQuantity = buyQuantity <= maxBuyQuantity ? buyQuantity : 0;
      this.saleTotalQuantity = buyQuantity <= saleableQuantity ? buyQuantity : 0;
    }

    this.buyTotalAmount = this.buyTotalQuantity * buyTempPrice;
    this.saleTotalAmount = this.saleTotalQuantity * saleTempPrice;

    return {
      buyMarket: this.checkRiseOrFall(buyTempPrice, yesterdayPrice, this.buyTotalQuantity),
      saleMarket: this.checkRiseOrFall(saleTempPrice, yesterdayPrice, this.saleTotalQuantity),      
    }
  }

  checkRiseOrFall(nowVal,lastVal,validity){
    if (!nowVal || !lastVal || !validity) {
      return '';
    } else if (nowVal >= lastVal) {
      return 'rise';
    } else {
      return 'fall';
    }
  }

  buySale(...args: any[]) : void
  buySale(i, saleableQuantity, baseData) {
    let marketStatus = this.checkMarket(i, saleableQuantity, baseData);

    const { buyMarket, saleMarket } = marketStatus || {} as AnyObject
    this.buyCircleClass = buyMarket? {[buyMarket]: true} : {}
    this.saleCircleClass = saleMarket? {[saleMarket]: true} : {}
  }

  toggleBets(){
    this.betsHidden = !this.betsHidden;

    if (this.largeRealtimeChart){
      this.largeRealtimeChart.resize();
    }
  }

  quickTrade(trade:string){
    const tradeType = trade === 'buy' ? 1 : 2
    // let tip: string = `${strTrade}委托已提交`;
    //根据可卖数量大于0来判断是否能交易
    if (this[`${trade}TotalQuantity`] > 0){
      this.tradeService
        .purchase(
          this._stockCode,
          '',
          tradeType,
          this[`${trade}TotalQuantity`],
          this[`${trade}TempPrice`],
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
            this.buySaleActiveIndex.next(-1);
            this.buyTotalQuantity = 0;
            this.saleTotalAmount = 0;
            this.saleTotalQuantity = 0;
            this.buyTotalAmount = 0;
            this.buyTempPrice = 0;
            this.saleTempPrice = 0;
            this.buyCircleClass = {};
            this.saleCircleClass = {};
          }else{
            return Promise.reject(result);
          }
        })
        .catch(err => {
          console.log('trade err:', err);
          if(err && err.message){
            let toast = this.toastCtrl.create({
              message: `${err.message}`,
              duration: 3000,
              position: 'middle'
            })
            toast.present()
          }else{
            console.log('stock-detail err:', err)
          }
        });
    }
  }

  changeTime(index) {
    if (index === this.activeIndex) {
      return;
    }

    this.activeIndex = index;
    const KDATA_UNITS= this.appSettings.KDATA_UNITS;
    if (index > 0 && index <= KDATA_UNITS.length) {
      const kDataUnit = this.kDataUnit = KDATA_UNITS[index - 1];
      // FIXME ：切换 K 线图形态时，强制要求重新获取数据，
      // 这样会比较费流量。
      // 可以考虑增加判断，数据已存在就不要重新获取。
      this.stockDataService.requestKData(this._stockCode, kDataUnit);
    }
  }

  changeActive(index) {
    if (index !== this.activeIndex) {
      this.sld.slideTo(index);
    }
  }

  tabChangesd(slide) {
    const destIndex = slide._snapIndex;
    if (slide.isEnd() && slide.getActiveIndex() === destIndex + 1) {
      slide.slideTo(destIndex, 0);
    }
    this.activeIndexs = destIndex;
  }

  changeActives(index) {
    if (index !== this.activeIndexs) {
      this.slide.slideTo(index);
    }
  }

  // 此方法已弃用(还在使用,不清楚前面注释说明的原因)
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
    } else {
      this.statusBar.hide();
    }

    // 使用设备的方向旋转，效果很不好，过渡时会有难看的白色背景，
    // 中间的过渡动画没有找到合适的方法来跳过。
    // 因此弃用设备的旋转，改用 css3 的 rotate 来模拟横屏效果。
    // const orientations = toPortrait ? 'PORTRAIT' : 'LANDSCAPE';
    // this.screenOrientation
    //   .lock(this.screenOrientation.ORIENTATIONS[orientations])
    //   .catch(err => {
    //     console.log('screenOrientation error:', err.message);
    //   });
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

  showKDataCustomTooltip(data){
    // console.log(data);
    const date = data[0].axisValue;

    const sourceData = this.stockDataService.getStockKData(this._stockCode, this.kDataUnit);
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
        datetime: date,
      });

      // console.log(this.tempData);

      this.switchToTempData();
    }
  }

  showRealtimeCustomTooltip(data){
    const realPrice = data[0].data;
    
    const realtimeData = this.stockDataService.getStockRealtimeData(this._stockCode);
    const baseData = this.stockDataService.getStockBaseData(this._stockCode);
    if (!realtimeData || !realtimeData[data[0].dataIndex] || !baseData) {
      return;
    }

    const dataItem = realtimeData[data[0].dataIndex];
    const changeValue = realPrice - (baseData ? baseData.yesterdayPrice : 0);
    const changeRate = baseData ? changeValue / baseData.yesterdayPrice : 0;
    const newTempData = {
      ...this.tempData.getValue(),
      ...baseData,
      latestPrice: realPrice,
      avgPrice:　data[1].data,
      turnoverQuantity: dataItem.turnoverQuantity,
      turnoverAmount: dataItem.turnoverAmount,
      changeValue,
      changeRate,
      datetime: data[0].axisValue,
    };
    this.tempData.next(newTempData);
    // console.log(newTempData);

    this.switchToTempData();
  }

}
