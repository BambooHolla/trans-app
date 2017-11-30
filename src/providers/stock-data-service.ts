import { Injectable } from '@angular/core';

import { Http, Headers, URLSearchParams, RequestMethod } from '@angular/http';

import { Observable } from 'rxjs/Observable';
// import { Subscriber } from 'rxjs/Subscriber';
import { Subject } from 'rxjs/Subject';
// import { ConnectableObservable } from 'rxjs/Observable/ConnectableObservable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import * as moment from 'moment';

import { AppSettings } from './app-settings';
import { AppDataService } from './app-data-service';
import { LoginService } from './login-service';
import { SocketioService } from './socketio-service';
import { HttpService } from './http-service';
import { AppService } from './app.service';

@Injectable()
export class StockDataService {
  // readonly SOCKETIO_SUBSCRIBE_STOCK_EVENT = 'equityInfo';
  readonly SOCKETIO_SUBSCRIBE_STOCK_EVENT = 'equityDetail';

  private _stockObservableMap: Map<string,
    Map<
      string, { refCounted: Observable<any>, subject: Subject<any> }
    >
  > = new Map();

  private _thisTradeDayStartTime: number = 0;
  private _thisTradeDayEndTime: number = 0;
  private _nextTradeDayStartTime: number = 0;

  private _tradeDayCheckTimer: number = null;

  private _refreshRealtimeDataTimer: number = null;

  // 实时数据
  private _stockRealtimeData: BehaviorSubject<AnyObject> = new BehaviorSubject({});

  public getStockRealtimeData(code) {
    return this._stockRealtimeData.getValue()[code];
  }
  
  public stockRealtimeData$ = this._stockRealtimeData.asObservable();

  // 股票基本数据（包括价格、当天成交量、卖五卖五档等等）
  private _stockBaseData: BehaviorSubject<AnyObject> = new BehaviorSubject({});

  public getStockBaseData(code) {
    return this._stockBaseData.getValue()[code];
  }
  
  public stockBaseData$ = this._stockBaseData.asObservable();

  // 板块列表。
  // 暂时使用固定数据。
  // private _sectorList: SectorSimpleData[] = [
  //   // {sectorType: '00', sectorName: '股权板块'},
  //   // {sectorType: '01', sectorName: '互联网产权'},
  //   // {sectorType: '02', sectorName: '高科技产权'},
  //   // {sectorType: '20', sectorName: '台资企业'},
  //   // {sectorType: '30', sectorName: '专利技术'},
  //   // 001 高交所股票、002 高交所知识产权、003 私募基金、004 本能理财
  //   { sectorType: '001', sectorName: '高交所股票'},
  //   { sectorType: '002', sectorName: '高交所知识产权'},
  // ];

  // public get sectorList(){
  //   return this._sectorList;
  // }

  // private _sectorData: BehaviorSubject<SectorData> = new BehaviorSubject(undefined);

  // public sectorData$ = this._sectorData.asObservable()
  //     .filter(data => data !== undefined);

  // 保证数值在小数点后最多只有两位有效数字。
  // js 做加减法，或乘以一个带有小数的数字，都有可能出现精度问题，
  // 因此需要对计算结果做校正。
  numberFixed2: (any) => number =
    (src) => Math.round((parseFloat(src) || 0) * 100) / 100;

  constructor(
    public http: Http,
    public appSettings: AppSettings,
    public appService: AppService,
    public appDataService: AppDataService,
    public socketioService: SocketioService,
    public httpService: HttpService,
    public loginService: LoginService,
  ){
    this.initTradeDay();
    this.startTradeDayCheckTimer();
    // this.initSectors();
    this.initRefreshRealtimeDataTimer();
    this.initSubscribers()
  }

  initSubscribers() {
    this.loginService.status$.subscribe(status => {
      if (!status) {
        this.resetData()
      }
    })
  }

  resetData() {
    // if (this._tradeDayCheckTimer) {
    //   clearInterval(this._tradeDayCheckTimer);
    // }

    this._stockObservableMap.forEach(observableMap => {
      observableMap.forEach(({ subject }) => {
        subject.unsubscribe();
      });
      observableMap.clear();
    });
    this._stockObservableMap.clear();

    this._stockKData.next({});

    this._stockRealtimeData.next({});
    this._stockBaseData.next({});
    // this.initSectors();
  }

  private getTradeTimeMisc() {
    const switchMinutes = this.appSettings.tradingMinutePeriods[0].start -
            this.appSettings.TRADE_DAY_SWITCH_MINUTES_BEFORE_TRADING;
    // 使用 moment 的 utc 时间，
    // 否则在 android 设备上设置时间有可能导致错误结果
    // （例如设置本地时间 9 点的操作，实际效果是设置了 ISO 时间 9 点）。
    // dateMoment.local();
    const dateMoment = moment.utc();
    const dayOfWeek = dateMoment.day();
    const currentMinutes = this.normalizeMinutes(dateMoment);
    // 根据星期来判断当天是否为交易日。
    // 不准确，没有考虑节日与交易所停盘的因素，
    // 实际上应当向服务器端查询“今天是否为交易日”、“上一个交易日是哪天”。
    // 并且也未考虑 utc 时间可能造成日期偏移，
    // 因为使用北京时间，因此这个日期偏移的因素暂时可以忽略。
    const todayIsTradeDay = dayOfWeek > 0 && dayOfWeek < 6;

    return {
      dateMoment,
      currentMinutes,
      switchMinutes,
      dayOfWeek,
      todayIsTradeDay,
    };
  }

  private initTradeDay() {
    const { dateMoment, currentMinutes, switchMinutes, dayOfWeek, todayIsTradeDay } = this.getTradeTimeMisc();

    const tempDateMoment = moment.utc(dateMoment.format('YYYY-MM-DD 00:00:00.000'));
    this._thisTradeDayStartTime = +tempDateMoment + switchMinutes * 60e3;
    this._nextTradeDayStartTime = this._thisTradeDayStartTime;
    // 当天不是交易日，或者时间在交易日切换时间（早上 9:00 ）之前，
    // 则“当前交易日”要设置为上一个交易日。
    if (!todayIsTradeDay || currentMinutes < switchMinutes) {
      // 星期二到星期六，上一个交易日就是前一天；
      // 星期天或星期一，上一个交易日是上周五。
      // 天数的偏移量计算出来为正数，之后参与运算时使用减法。
      const lastTradeDayOffset = dayOfWeek > 1 ? 1 : 2 + dayOfWeek;
      this._thisTradeDayStartTime -= lastTradeDayOffset * 24 * 36e5;
    } else {
      // 否则“下一个交易日”要设置为下一个真实交易日。
      // 星期天到星期四，下一个交易日为下一天；
      // 星期五或星期六，下一个交易日为下周一。
      const nextTradeDayOffset = dayOfWeek < 5 ? 1 : 8 - dayOfWeek;
      this._nextTradeDayStartTime += nextTradeDayOffset * 24 * 36e5;
    }

    const { tradingMinutePeriods, TRADE_DAY_SWITCH_MINUTES_BEFORE_TRADING } = this.appSettings;
    this._thisTradeDayEndTime = this._thisTradeDayStartTime + 60e3 *
        (tradingMinutePeriods[1].end - tradingMinutePeriods[0].start +
            TRADE_DAY_SWITCH_MINUTES_BEFORE_TRADING
        );
  }

  private startTradeDayCheckTimer() {
    if (this._tradeDayCheckTimer) {
      clearInterval(this._tradeDayCheckTimer);
    }

    this._tradeDayCheckTimer = setInterval(this.checkTradeDay.bind(this), 30e3);
  }

  // 定时检查当前时间，判断是否已经切换了交易日。
  // 也可以考虑开放给外部类调用，以便在切换行情页面时立刻进行检查。
  private checkTradeDay() {
    const time = +moment.utc() - this.appSettings.minuteOffset * 60e3;
    if (time >= this._nextTradeDayStartTime) {
      this.resetStockData();
      this.initTradeDay();
    }
  }

  private resetStockData() {
    console.log('reset stock data');
    this.resetAllData();
    for (const code in this._stockBaseData.getValue()) {
      this.requestStockBaseData(code)
        .then(() => {})
        .catch(err => {});

      if (this.appSettings.SIM_DATA) {
        this.getSimStartData(code)
      }
    }
  }

  initRefreshRealtimeDataTimer() {
    if (this._refreshRealtimeDataTimer) {
      setInterval(this._refreshRealtimeDataTimer);
    }

    this._refreshRealtimeDataTimer = setInterval(() => {
      this._stockObservableMap.forEach(observableMap => {
        observableMap.forEach(({ subject }, code: string) => {
          // 如果对应的 Subject 有订阅者，则 observers.length 属性值就不为 0 ，
          // 表示当前股票存在对于实时数据的订阅，需要每分钟刷新一次当天的完整分钟数据。
          // 无论是否在开盘时间段内，都执行此操作，可能会造成流量浪费，后期可考虑加以改进。
          if (subject.observers.length) {
            console.log('requestRealtimeStartData', code);
            if (this.appSettings.SIM_DATA){
              this.getSimStartData(code);
            } else {
              this.requestRealtimeStartData(code)
            }
          }
        });
      });
    }, 180e3);
  }

  // private initSectors() {
  //   const sectorData = {};
  //   this._sectorList.forEach(({sectorType, sectorName}) => {
  //     sectorData[sectorType] = {
  //       sectorName,
  //       stockCodeList: null,
  //     };
  //   });

  //   this._sectorData.next(sectorData);
  // }

  private _stockKData: BehaviorSubject<{ [key: string]: { [key: string]: any[] } }> =
    new BehaviorSubject({});

  public stockKData$ = this._stockKData.asObservable();

  // K 数据没有根据当天的实时数据做汇总处理！需要增加功能。
  // 此外，所有输入 code 或者 stockCode （包括基本数据、实时数据、 K 线图数据），
  // 都没有判断是否为有效的股票代码，仅判断了不为空，
  // 不够严谨，需要改进！
  public getStockKData(code, unit){
    // 调用 getStockKData() 时，如果目标数据已存在，
    // 则直接使用已有数据（相当于是缓存了服务器端返回数据的计算结果），
    // 若要强制刷新数据，可以调用 requestKData() 方法。
    const stockKData = this._stockKData.getValue();
    if (!code || this.appSettings.KDATA_UNITS.indexOf(unit) === -1) {
      return [];
    }

    let dataMissing = true;
    if (!(code in stockKData)){
      this._stockKData.next({
        ...stockKData,
        [code]: {
          [unit]: [],
        },
      });
    } else if (!(unit in stockKData[code])) {
      this._stockKData.next({
        ...stockKData,
        [code]: {
          ...stockKData[code],
          [unit]: [],
        },
      });
    } else {
      dataMissing = false;
    }

    if (dataMissing) {
      this.requestKData(code, unit);
    }

    return this._stockKData.getValue()[code][unit];
  }

  private filterRealtimeData = ({time}) => {
    // 根据返回数据中的时间字段进行过滤。
    // 非当前交易日有效时间段内的数据都会被丢弃。
    // 交易时间段按照计算出的 _thisTradeDayStartTime 与 _thisTradeDayEndTime 来判断，
    // 可能与实际的交易日不一致！！！！
    // 当前交易日的计算与判断只考虑了周末的因素，
    // 而没有考虑非周末的假日，在这类日期，有可能会将返回数据中上一个交易日的数据全部丢弃！
    // 
    // 如果 API 返回的数据是已经针对交易日做过处理的，则这里不需要多做判断来过滤，
    // 只要判断 time 值存在并且有效（ dateMoment.isValid() ）即可！
    if (time) {
      const dateMoment = moment.utc(time);
      if (dateMoment.isValid() &&
        +dateMoment >= this._thisTradeDayStartTime &&
        +dateMoment <= this._thisTradeDayEndTime
      ) {
        return true;
      }
    }
    return false;
  }

  private requestRealtimeStartData(code, cancel$?: Observable<any>): Subscription {
    // const url = `${this.appSettings.SERVER_URL}/api/v1/gjs/biz/equities/timePrice/${code}`
    let todayDate = new Date().getDate()
    const yesterdayDate = new Date(new Date().setDate(todayDate - 1)).toLocaleDateString()// 直接使用日期,后端采用new Date(value)处理
    const url = `${this.appSettings.SERVER_URL + this.appSettings.SERVER_PREFIX}/product/productPrice`///${code}`?priceDate=${yesterdayDate}`
    const token = this.appDataService.token
    if (!token) {
      return Observable.throw(new Error('token missing!')).subscribe()
    }
    const headers = new Headers()
    headers.append('X-AUTH-TOKEN', token)

    // return this.httpService.getObservableWithToken(url, undefined, cancel$)
    //   .switchMap(data => {
    //     if (!data.data || !data.data.todayTrend || !Array.isArray(data.data.todayTrend)){
    //       return Observable.throw('realtime data missing')
    //     }
    //     return Observable.of(data.data)
    //   })
    //   .subscribe({
    //     next: data => {
    //       // 是否要用实时数据的最新价格代替 baseData 的最新价格？
    //       if (data.yesterdayPrice) {
    //         this.setStockBaseData(code, {
    //           // latestPrice: data.data.yesterdayPrice,
    //           yesterdayPrice: data.yesterdayPrice,
    //         })
    //       }
    //       this.parseAndSetRealtimeData(
    //         code,
    //         data.todayTrend
    //           .filter(this.filterRealtimeData)
    //       );
    //     },
    //     error: err => {
    //       console.log('requestRealtimeStartData error: ', err.message || err);
    //       // this.parseAndSetRealtimeData(code, []);
    //       return Observable.throw(err);
    //     }
    //   })
    let http$ = this.http.post(url, {
      productId: code,
      priceDate: yesterdayDate
    }, { headers })

    if (cancel$) {
      http$ = http$.takeUntil(cancel$)
    }

    return http$
      .map(res => res.json())
      .switchMap(data => {
        // 使用 switchMap 来包含 Observable.throw()
        console.log('requestRealtimeStartData data: ', data);
        if (!data) {
          return Observable.throw(new Error('data missing'));
        }

        const err = data.err || data.error
        if (err) {
          return Observable.throw(new Error(err.message || err));
        }

        // switchMap 的正常返回值需要使用 Observable.of()
        return Observable.of(data.data);
      })
      .subscribe({
        next: data => {
          console.log('requestRealtimeStartData subscribe data: ', data);
          if (data && data[0] && data[0].todayPrice) {
            this.setStockBaseData(code, {
              yesterdayPrice: data[0].todayPrice / 100,
            })
          }
        },
        error: err => {
          console.log('requestRealtimeStartData error: ', err.message || err);
          return Observable.throw(err);
        }
      })
  }

  /**
   * 检查与数据项同一时间段的数据项，
   * 只完成了基于“日”的功能（例如“周”与“月”），
   * 没有实现分钟时间段（例如 15 分钟数据、 30 分钟数据）。
   * @param  {string}  timeUnit 时间单位，如 'week' 、 'month' 等
   * @param  {any[]}   data     数据数组
   * @param  {number}  index    当前需要检查的数据项的索引值
   * @return {number}           同一时间段的最后一个数据项的索引值
   */
  private checkEndOfPeriodCommon(timeUnit: string, data: any[], index: number): number{
    if (index === data.length - 1){
      return index;
    }

    const thisElement = data[index];
    const dateMoment = moment(thisElement.FID_RQ);
    // 注意： endOf 方法会直接修改原对象！
    dateMoment.endOf(timeUnit as any);
    const endDateString = dateMoment.format('YYYYMMDD');

    // 获取当前日期的 moment 对象后，将其调整到本时间段的末尾（本周末、本月末等），
    // 然后与下一数据的日期进行比较。
    // 此处没有使用 moment 的 diff() 方法，因为结果不正确
    // （可能需要进行时区的设置才能得到正确结果）。
    // 
    // 未考虑返回数据没有按照日期顺序排列的情况，
    // 如果存在这种情况，在处理数据之前就需要进行排序操作。
    // “周末”指的是周六，以交易日期而言不会造成对星期的误判。
    while (++index < data.length && endDateString >= data[index].FID_RQ){

    }

    return index - 1;
  }

  /**
   * 检查“本日”在哪一个位置结束。
   * 只用于处理以“日”为周期的数据，因此始终返回当前索引值，
   * 即假设没有重复日期。
   * 没有考虑原始数据的单位可能是“分钟”的问题。
   * 后期可以按照实际需求来修改。
   * @param  {any[]}  data  数据数组
   * @param  {number} index 当前需要检查的数据项的索引值
   * @return {number}       同一“日”最后一个数据项的索引值
   */
  private checkEndOfPeriodOfDay(data: any[], index: number): number{
    return index;
  }

  /**
   * 检查“本周”在哪一个位置结束。
   * @param  {any[]}  data  数据数组
   * @param  {number} index 当前需要检查的数据项的索引值
   * @return {number}       同一“周”最后一个数据项的索引值
   */
  private checkEndOfPeriodOfWeek: (data: any[], index: number) => number
    = this.checkEndOfPeriodCommon.bind(this, 'week');

  /**
   * 检查“本月”在哪一个位置结束。
   * @param  {any[]}  data  数据数组
   * @param  {number} index 当前需要检查的数据项的索引值
   * @return {number}       同一“月”最后一个数据项的索引值
   */
  private checkEndOfPeriodOfMonth: (data: any[], index: number) => number
    = this.checkEndOfPeriodCommon.bind(this, 'month');

  private checkEndOfPeriodMethods = {
    day: this.checkEndOfPeriodOfDay,
    week: this.checkEndOfPeriodOfWeek,
    month: this.checkEndOfPeriodOfMonth,
  };

  // 调用此方法时，会从服务器端获取数据，
  // 无论目标数据是否已在当前数据集内。
  // 可以考虑增加一个 forceReload 参数，用于指示是否强制重取数据。
  public requestKData(
    code: string,
    unit: string,
    startDate: string = '20161201',
    endDate: string = moment.utc().format('YYYYMMDD'),
  ): Promise<any> {
    if (this.appSettings.SIM_DATA){
      const data = this.randomKData(code, startDate, endDate);
      this.parseKData(code, unit, data);
      return Promise.resolve();
    }

    const url = ``//${this.appSettings.SERVER_URL}/api/v1/gjs/biz/equities/kline/startDate/${startDate}/endDate/${endDate}/equityCode/${code}`;
    return this.httpService.getWithToken(url)
        .then(data => {
          console.log('requestKData: ', code, unit, data);
          this.parseKData(code, unit, data.data);
        })
        .catch(err => {
          console.log('requestKData error: ', err.message || err);
          return Promise.reject(err);
        });
  }

  subscibeRealtimeData(
    code: string,
    eventName: string = this.SOCKETIO_SUBSCRIBE_STOCK_EVENT,
    cancelGettingStartData$?: Observable<any>,
  ): Observable<any> {
    console.log('subscibeRealtimeData', code);
    const suffix = eventName === 'equityInfo' ? '-1' : '-2';
    if (!this._stockObservableMap.has(eventName)){
      this._stockObservableMap.set(eventName, new Map());
    }

    const realtimeData = this._stockRealtimeData.getValue()
    if (this.appSettings.SIM_DATA){
      this.getSimStartData(code);
    } else {
      const needData = !realtimeData[code] || !realtimeData[code][0]
      if (!realtimeData[code]) {
        this.parseAndSetRealtimeData(code, []);
      }

      if (needData) {
        this.requestRealtimeStartData(code, cancelGettingStartData$)
      }
    }

    const observableMap = this._stockObservableMap.get(eventName);
    if (!observableMap.has(code)){
      console.log('subscribeEquity', code);
      let source$: Observable<any>;
      if (this.appSettings.SIM_DATA) {
        source$ = this.simSubscribeEquity(code, this.SOCKETIO_SUBSCRIBE_STOCK_EVENT);
      } else {
        // //gjs
        // source$ = this.socketioService.subscribeEquity(code + suffix, eventName);
        //bngj直接通过股票代码获取socket链接, eventName用来作为链接暂存的标识.
        source$ = this.socketioService.subscribeEquity(code, eventName)//'price');          
      }
      console.log('source$: ',source$)
      const equity$ = source$
        .do(result => {
          console.log('data changed: ', result);

          const transformedData = this.transformRealtimeData(code, result);
          this.parseAndSetRealtimeData(code, [transformedData], this._stockRealtimeData.getValue()[code]);

          const { time, price, turnoverQuantity,turnoverAmount, bets } = transformedData;
          // minute 与 price 都进行了重复计算，应考虑优化！
          const minute = this.parseMinute(time);
          if (true) {
            // 如果当前交易日尚未登记集合竞价的结果，
            // 则只要当前数据的时间不早于集合竞价的时刻，
            // 则将当前数据的价格作为当天的开盘价。
            // 此处理只针对模拟数据（以下与 toAuctionDone 有关的处理都是）！
            // 如果是真实数据，需要从 requestStockBaseData 的返回结果中获取开盘价。
            const baseData = this._stockBaseData.getValue()[code];
            // 是否需要检查集合竞价已完成。
            const needCheckAuctionDone = this.appSettings.SIM_DATA &&
                minute >= -this.appSettings.AUCTION_DONE_MINUTES_BEFORE_TRADING;
            // 若 baseData 已存在，并且 auctionDone 属性值为 false ，
            // 则需要将其设为 true ，并采用当前模拟出的最新价格作为开盘价。
            const toAuctionDone = needCheckAuctionDone &&
                baseData && !baseData.auctionDone;
            const subData: AnyObject = {};

            // 设置股票基本数据（包括最新价、卖五卖五档等）时，
            // 开盘之前集合竞价的 15 分钟也要考虑进去。
            // 但是竞价结束后、开盘之前（ 9:25:01 ~ 9:29:59 ）的数据应当忽略。
            // （不满足以下判断条件的，就不设置 latestPrice 值）
            // 忽略价格变动，但接受买五卖五档的数据。
            if (true) {
              subData.latestPrice = this.numberFixed2(price);
              if (toAuctionDone) {
                subData.startPrice = subData.latestPrice;
              }
            }

            // 交易时间之前的成交量一概忽略，
            // 但竞价结束时（ 9:25:00 ）的应当予以保留！
            // 成交量与成交额作为字符串形式输入，前面带有 + ，表示要与原先已有的数据做加法。
            // 此处有隐患：尚不确定真实 API 返回的实时数据中，成交量与成交金额是几秒钟之内的，
            //             还是本分钟的完整数据。
            //             这一点需要确认！！！！
            //             如果是本分钟的完整数据，那么需要将当前传入的成交量与成交额减去
            //             本分钟已有数据的量与额，然后属性值依然使用 "<+|-><变化数值>" 的字符串形式。
            if (true) {
              subData.turnoverQuantity = `+${turnoverQuantity}`;
              subData.turnoverAmount = `+${turnoverAmount}`;
            }
            if (bets){
              subData.bets = bets;
            }

            this.setStockBaseData(code, subData);
          }
        });

      const subject =  new BehaviorSubject(undefined);
      const refCounted = equity$.multicast(subject).refCount();
      observableMap.set(code, { refCounted, subject });
    }

    return observableMap.get(code).refCounted;
  }

  requestStockBaseData(code: string): Promise<any> {
    // console.log('requestStockBaseData', code);

    if (this.appSettings.SIM_DATA){
      this.simStockBaseData(code);
      return Promise.resolve();
    }

    // const url = `${this.appSettings.SERVER_URL}/api/v1/gjs/biz/equities/equityPrice/${code}`;
    // return this.httpService.getWithToken(url)
    //   .then(data => {
    //     console.log('requestStockBaseData: ', data);
    //     if (!Array.isArray(data.data) || !data.data.length){
    //       return Promise.reject(new Error('requestStockBaseData: data missing!'));
    //     }

    //     this.parseStockBaseData(code, data.data[0]);
    //   })
    //   .catch(err => {
    //     console.log('requestStockBaseData error: ', err.message || err);
    //     return Promise.reject(err);
    //   });
    const path = `/product/product`;
    const params = {
      // "platformType": "002",
      // "productStatus": "002",
      "productIdArr": [
        code
      ],
    }
    console.log('requestStockBaseData: ', code)
    
    return this.appService.request(RequestMethod.Post, path, params, true)
      .then(data => {
        console.log('requestStockBaseData: ', data)
        if (!Array.isArray(data) || !data.length) {
          return Promise.reject(new Error('requestStockBaseData: data missing!'))
        }

        this.parseStockBaseData(code, data[0])
      })
      .catch(err => {
        console.log('requestStockBaseData error: ', err)
        return Promise.reject(err)
      })
  }

  // FID_GQDM  股权代码  C  　  股权代码
  // FID_GQMC  股权名称  C  　  股权名称
  // FID_GQLB  股权类别  C  　  股权类别
  // FID_BZ  币种  C  　  币种
  // FID_ZGBJ  最高报价  N  　  最高报价
  // FID_ZDBJ  最低报价  N  　  最低报价
  // FID_JYJS  交易基数  N  　  交易基数
  // FID_JYJW  交易价位  N  　  交易价位
  // FID_MMXZ  买卖限制  N  　  买卖限制
  // FID_JYDW  交易单位  N  　  交易单位
  // FID_ZSP  昨收盘  N  　  昨收盘
  // FID_EN_WTLB  委托类别范围  C  　  委托类别范围
  // FID_WTSX  委托上限  N  　  委托上限
  // FID_WTXX  委托下限  N  　  委托下限
  // FID_JYXZ  交易限制  N  　  交易限制
  // FID_SSRQ  上市日期  N  　  上市日期
  // FID_SLSX  股东数量上限  N  　  股东数量上限
  // FID_YXSJ  有效时间  N  　  有效时间
  // FID_ZGB  总股本  N  　  总股本
  // FID_FXJ  发行价  N  　  发行价
  // FID_ZSP  昨收盘  N  　  昨收盘
  // FID_ZXJ  最新价  N  　  最新价
  // FID_JKP  今开盘  N  　  今开盘
  // FID_CJSL  成交数量  N  　  成交数量
  // FID_CJJE  成交金额  N  　  成交金额
  // FID_ZGJ  最高价  N  　  最高价
  // FID_ZDJ  最低价  N  　  最低价
  // FID_CJBS  成交笔数  N  　  成交笔数
  // FID_MRJG1  买入价格1  N  　  买入价格1
  // FID_MRSL1  买入数量1  N  　  买入数量1
  // FID_MRJG2  买入价格2  N  　  买入价格2
  // FID_MRSL2  买入数量2  N  　  买入数量2
  // FID_MRJG3  买入价格3  N  　  买入价格3
  // FID_MRSL3  买入数量3  N  　  买入数量3
  // FID_MRJG4  买入价格4  N  　  买入价格4
  // FID_MRSL4  买入数量4  N  　  买入数量4
  // FID_MRJG5  买入价格5  N  　  买入价格5
  // FID_MRSL5  买入数量5  N  　  买入数量5
  // FID_MCJG1  卖出价格1  N  　  卖出价格1
  // FID_MCSL1  卖出数量1  N  　  卖出数量1
  // FID_MCJG2  卖出价格2  N  　  卖出价格2
  // FID_MCSL2  卖出数量2  N  　  卖出数量2
  // FID_MCJG3  卖出价格3  N  　  卖出价格3
  // FID_MCSL3  卖出数量3  N  　  卖出数量3
  // FID_MCJG4  卖出价格4  N  　  卖出价格4
  // FID_MCSL4  卖出数量4  N  　  卖出数量4
  // FID_MCJG5  卖出价格5  N  　  卖出价格5
  // FID_MCSL5  卖出数量5  N  　  卖出数量5
  // FID_CODE  返回值  N  　  返回值
  // FID_MESSAGE  返回信息  C  　  返回信息

  private _baseDataForSim = {
    '000001': {
      FID_GQMC: '正合意',
      FID_ZXJ: 5.33,
      FID_ZSP: 5.07,
      FID_ZGJ: 5.45,
      FID_ZDJ: 4.86,
      FID_JKP: 5.10,
      FID_CJSL: 5634,
      FID_CJJE: 28183.45,
      FID_JYJS: 1000,
    },
    '000002': {
      FID_GQMC: '众泰克',
      FID_ZXJ: 34.89,
      FID_ZSP: 35.24,
      FID_ZGJ: 36.45,
      FID_ZDJ: 34.12,
      FID_JKP: 35.25,
      FID_CJSL: 18632,
      FID_CJJE: 670752.89,
      FID_JYJS: 100,
    },
    default: {
      FID_GQMC: '未命名',
      FID_ZXJ: 10.12,
      FID_ZSP: 9.56,
    }
  };

  private simStockBaseData(code) {
    this.parseStockBaseData(code, this._baseDataForSim[code] || this._baseDataForSim.default);
  }

  private resetAllData() {
    // 如果是虚拟数据，还需要做汇总处理，
    // 也就是将最新价作为前一天的收盘价，其余字段清除。
    if (this.appSettings.SIM_DATA) {
      const tempData = {...this._stockBaseData.getValue()};
      for (const code in tempData) {
        const { FID_ZXJ } = this._baseDataForSim[code];
        Object.assign(this._baseDataForSim[code], {
          FID_ZSP: FID_ZXJ,
          FID_ZGJ: 0,
          FID_ZDJ: 0,
          FID_JKP: 0,
          FID_CJSL: 0,
          FID_CJJE: 0,
        })
      }
    }

    const emptyBaseData = {};
    for (const code in this._stockBaseData.getValue()) {
      emptyBaseData[code] = {
        stockCode: code,
        bets: this.initBets(),
        turnoverQuantity: 0,
        turnoverAmount: 0,
      };
    }
    this._stockBaseData.next(emptyBaseData);

    const emptyRealtimeData = {};
    for (const code in this._stockRealtimeData.getValue()) {
      emptyRealtimeData[code] = [];
    }
    this._stockRealtimeData.next(emptyRealtimeData);
  }

  private parseStockBaseData(code, data){
    const numberFixed2 = this.numberFixed2;
    const newData: AnyObject = {
      name: data.FID_GQMC || data.productName,
      latestPrice: numberFixed2(data.FID_ZXJ),
      yesterdayPrice: numberFixed2(data.FID_ZSP),
      maxPrice: numberFixed2(data.FID_ZGJ),
      minPrice: numberFixed2(data.FID_ZDJ),
      startPrice: numberFixed2(data.FID_JKP),
      turnoverQuantity: parseInt(data.FID_CJSL, 10) || 0,
      turnoverAmount: numberFixed2(data.FID_CJJE),
      // 集合竞价是否已达成。
      auctionDone: !!numberFixed2(data.FID_JKP),
      handBase: parseInt(data.FID_JYJS, 10) || 0,
    }

    if ('FID_MRJG1' in data) {
      const bets = this.initBets();
      for (let i = 1; i <= 5; i++){
        bets[i + 4].price = numberFixed2(data['FID_MRJG' + i]);
        bets[i + 4].quantity = parseInt(data['FID_MRSL' + i], 10) || 0;

        bets[5 - i].price = numberFixed2(data['FID_MCJG' + i]);
        bets[5 - i].quantity = parseInt(data['FID_MCSL' + i], 10) || 0;
      }
      newData.bets = bets
    }

    this.setStockBaseData(code, newData);
  }

  private setStockBaseData(code, subData){
    const baseData = this._stockBaseData.getValue()[code] || {
      stockCode: code,
      bets: this.initBets(),
      turnoverQuantity: 0,
      turnoverAmount: 0,
    };

    const { latestPrice, startPrice, turnoverQuantity, turnoverAmount } = subData;
    const yesterdayPrice = subData.yesterdayPrice || baseData.yesterdayPrice;
    const extraData: AnyObject = {...subData};
    if (latestPrice && yesterdayPrice) {
      // 减法可能导致精度问题，在视图上显示时需要进行格式化。
      extraData.changeValue = latestPrice - yesterdayPrice;
      extraData.changeRate = latestPrice / yesterdayPrice - 1;
    }
    if (startPrice) {
      extraData.auctionDone = true;
    }

    // 有成交量的价格是有效的。
    if (turnoverQuantity) {
      const minPrice = startPrice ? Math.min(startPrice, latestPrice) : latestPrice;
      if (!baseData.minPrice || minPrice < baseData.minPrice) {
        extraData.minPrice = minPrice;
      }
      const maxPrice = startPrice ? Math.max(startPrice, latestPrice) : latestPrice;
      if (!baseData.maxPrice || maxPrice > baseData.maxPrice) {
        extraData.maxPrice = maxPrice;
      }
    }

    // 区分直接设置数值与做加法（参数为字符串，首位是加减号）两种情况。
    // 属性无效时，需要将其删除。
    if (typeof turnoverQuantity === 'string' && /^[+-]/.test(turnoverQuantity)) {
      extraData.turnoverQuantity = baseData.turnoverQuantity + parseInt(turnoverQuantity, 10);
      extraData.turnoverAmount = this.numberFixed2(baseData.turnoverAmount + parseFloat(turnoverAmount));
    } else if (typeof turnoverQuantity !== 'number') {
      delete extraData.turnoverQuantity;
      delete extraData.turnoverAmount;
    }

    const newStockBaseData$ = {
      ...this._stockBaseData.getValue(),
      [code]: {...baseData, ...extraData},
    };
    console.log('newStockBaseData$', newStockBaseData$)
    this._stockBaseData.next(newStockBaseData$);

    if (this.appSettings.SIM_DATA) {
      this.refreshDataForSim(code, extraData);
    }
  }

  private refreshDataForSim(code, extraData) {
    const dataForSim = this._baseDataForSim[code];
    if (!dataForSim) {
      return;
    }
    dataForSim.FID_ZXJ = extraData.latestPrice || dataForSim.FID_ZXJ;
    dataForSim.FID_ZSP = extraData.yesterdayPrice || dataForSim.FID_ZSP;
    dataForSim.FID_ZGJ = extraData.maxPrice || dataForSim.FID_ZGJ;
    dataForSim.FID_ZDJ = extraData.minPrice || dataForSim.FID_ZDJ;
    dataForSim.FID_JKP = extraData.startPrice || dataForSim.FID_JKP;
    if ('turnoverQuantity' in extraData) { dataForSim.FID_CJSL = extraData.turnoverQuantity; }
    if ('turnoverAmount' in extraData) { dataForSim.FID_CJJE = extraData.turnoverAmount; }
  }

  initBets(){
    const bets = [];
    for (let i = 0; i < this.appSettings.betsTitle.length; i++){
      bets.push({
        price: null,
        quantity: null,
      });
    }

    return bets;
  }

  private transformRealtimeData(code, data): AnyObject {
    // {"ec":"000001","m":{"b5":5.51,"bc5":81,"b4":5.5,"bc4":3022,"b3":5.49,"bc3":38,"b2":5.48,"bc2":62,"b1":5.47,"bc1":7,"s1":5.46,"sc1":35,"s2":5.45,"sc2":18,"s3":5.44,"sc3":46,"s4":5.43,"sc4":52,"s5":5.42,"sc5":14},"tq":73,"p":{"n":5.46,"h":5.32,"l":4.87,"s":5.32,"e":4.99,"y":5.07},"t":"2017-07-06T10:09:32.704Z"}
    // bnqj返回数据data格式
    // {
    //   price: 0,//最新价格
    //   amount: 0,//24小时交易量
    //   max: 0,//24小时最高价
    //   min: 0//24小时最低价
    // }
    console.log(data);
    const price = this.numberFixed2(data.price)
    // 模拟服务器数据中缺少 ta （ turnoverAmount ）字段！
    const { m: market, t: time, amount: turnoverQuantity, ta: turnoverAmount } = data;
    const transformResult: AnyObject = {
      time,
      price,
      turnoverQuantity,
      turnoverAmount,
    };

    if (market){
      const bets = this.initBets();
      for (let i = 1; i <= 5; i++) {
        bets[i + 4].price = parseFloat(market['b' + i]);
        bets[i + 4].quantity = parseInt(market['bc' + i]);

        bets[5 - i].price = parseFloat(market['s' + i]);
        bets[5 - i].quantity = parseInt(market['sc' + i]);
      }
      transformResult.bets = bets;
    } else if (data.bets) {
      transformResult.bets = data.bets;
    }

    return transformResult;
  }

  private parseAndSetRealtimeData(code, data: any[], resultArray?: any[]) {
    // 需要将原有实时数据的数组创建副本（此处使用 concat() 方法），
    // 对副本进行操作后，再设置回去。
    // 否则 echarts 视图就无法检测到 @Input() 数据的变化。
    resultArray = resultArray ? resultArray.concat() : [];
    console.log('realtime resultArray1: ', resultArray)

    data.forEach(element => {
      const { time, turnoverQuantity, turnoverAmount } = element;
      let minute = this.parseMinute(time);
      if (typeof minute === 'number') {
        if (minute < 0) {
          // 开盘前的集合竞价。
          minute = 0;
        }
        const price = parseFloat((+element.price).toFixed(2));
        this.fillEmptyData(code, resultArray, minute);
        resultArray[minute] = {
          time,
          price,
          turnoverQuantity,
          turnoverAmount,
        };
      }
    });
    console.log('realtime resultArray2: ', resultArray)
    console.log('realtime stockRealtimeData: ', this._stockRealtimeData.getValue())
    this._stockRealtimeData.next({
      ...this._stockRealtimeData.getValue(),
      [code]: resultArray,
    });
  }

  private parseKData(
    code: string,
    unit: string,
    data: any[],
  ) {
    const checkEndOfPeriodMethod = this.checkEndOfPeriodMethods[unit];
    const newDataArray = [];
    let startIndex = 0;

    // 对数组进行过滤，消去日期字段不合法的数据，以及成交量不大于 0 的。
    data = data.filter(element => 
      moment(element.FID_RQ).isValid() && element.FID_CJSL > 0
    );

    while (startIndex < data.length){
      // 从当前数据项开始，检查本时间段结束位置的索引值。
      const endIndex = checkEndOfPeriodMethod(data, startIndex);

      // 对当前时间段内的数据进行汇总操作。
      const subData = data.slice(startIndex, endIndex + 1);
      const subDataLength = subData.length;

      const date = subData[subDataLength - 1].FID_RQ.replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
      const yesterdayPrice = parseFloat(subData[0].FID_ZSP);
      const startPrice = parseFloat(subData[0].FID_JKP);
      const endPrice = parseFloat(subData[subDataLength - 1].FID_ZXJ);
      let minPriceOfPeriod = Number.MAX_SAFE_INTEGER;
      let maxPriceOfPeriod = Number.MIN_SAFE_INTEGER;
      let turnoverQuantitySum = 0;
      let turnoverAmountSum = 0;

      subData.forEach(element => {
        minPriceOfPeriod = Math.min(minPriceOfPeriod, parseFloat(element.FID_ZDJ));
        maxPriceOfPeriod = Math.max(maxPriceOfPeriod, parseFloat(element.FID_ZGJ));
        turnoverQuantitySum += parseFloat(element.FID_CJSL);
        turnoverAmountSum += parseFloat(element.FID_CJJE);
      });

      newDataArray.push({
        date,
        yesterdayPrice,
        startPrice,
        endPrice,
        minPrice: minPriceOfPeriod,
        maxPrice: maxPriceOfPeriod,
        turnoverQuantity: turnoverQuantitySum,
        turnoverAmount: turnoverAmountSum,
      });

      startIndex = endIndex + 1;
    }

    const stockKData = this._stockKData.getValue();
    this._stockKData.next({
      ...stockKData,
      [code]: {
        ...stockKData[code],
        [unit]: newDataArray,
      }
    });
  }

  // 对当天已过去的分钟数进行计算，考虑分钟的偏移量设置。
  private normalizeMinutes(moment: moment.Moment): number {
    return (moment.hours() * 60 + moment.minutes() - this.appSettings.minuteOffset + 1440) % 1440;
  }

  // 只处理了当天的时间，功能不全。
  // 需要考虑当天开盘之前查看上一个交易日数据的情况，
  // 还要考虑股票当日停牌的情况。
  /**
   * 将传入的时间用分钟偏移量做修正，然后检查是否落在交易时间段内。
   * @param {[string]} dateString 时间字符串， UTC 时间。
   * @return {number|boolean}  落在交易时间段内时，返回 -15 ~ 242 的数字；
   *                           若否，返回 false 。
   */
  parseMinute(dateString: string): number | boolean {
    const dateMoment = moment.utc(dateString);
    const { tradingMinutePeriods, AUCTION_MINUTES_BEFORE_TRADING } = this.appSettings;

    // 传入的时间减去偏移量时，有可能小于 0 或超过 1440 ，需要做取模处理。
    let minute = this.normalizeMinutes(dateMoment);

    if (minute >= tradingMinutePeriods[0].start - AUCTION_MINUTES_BEFORE_TRADING && minute <= tradingMinutePeriods[0].end) {
      // 当前分钟落在上午交易时间段内，则减去上午开盘时间的分钟数。
      return minute - tradingMinutePeriods[0].start;
    } else if (minute >= tradingMinutePeriods[1].start && minute <= tradingMinutePeriods[1].end) {
      // 当前分钟落在下午交易时间段内，则减去下午开盘时间的分钟数，
      // 还需要加上上午交易时间段的长度，
      // 再加上 1 （保证 11:30 与 13:00 不重叠）。
      return minute - tradingMinutePeriods[1].start + tradingMinutePeriods[0].end - tradingMinutePeriods[0].start + 1;
    } else {
      return false;
    }
  }

  private fillEmptyData(code, dataArray, minute) {
    for (var prevMinute = minute - 1; prevMinute >= 0; prevMinute--) {
      if (dataArray[prevMinute] !== undefined){
        break;
      }
    }

    // 使用了稀疏数组，可能存在性能问题。
    // 若不使用稀疏数组，则在 realtime charts 的组件上的 map 操作中需要做额外判断。
    const baseData = this._stockBaseData.getValue()[code]
    if (prevMinute < minute - 1 && (
      prevMinute >= 0 ||
      prevMinute === -1 && baseData && baseData.yesterdayPrice
    )){
      const fillData = {
        price: prevMinute >= 0 ? dataArray[prevMinute].price : baseData.yesterdayPrice,
        turnoverQuantity: 0,
      };

      // 需要保证数组长度，否则 fill() 方法可能无法按预期填充数据。
      if (dataArray.length < minute){
        dataArray.length = minute;
      }

      dataArray.fill(fillData, prevMinute + 1, minute);
    }
  }

  private realtimeSimData = {};

  // 获取实时图的起始模拟数据
  private getSimStartData(code){
    const minuteOffset = this.appSettings.minuteOffset
    const realtimeSimData = this.realtimeSimData
    if (!(code in realtimeSimData)) {
      realtimeSimData[code] = {}
    }

    const simData = realtimeSimData[code]
    const { dateMoment, currentMinutes, switchMinutes, dayOfWeek, todayIsTradeDay } = this.getTradeTimeMisc()
    const [{ start: start_1, end: end_1}, { start: start_2, end: end_2}] = this.appSettings.tradingMinutePeriods
    const useLastTradeDay = !todayIsTradeDay || currentMinutes < switchMinutes
    if (useLastTradeDay) {
      const lastTradeDayOffset = dayOfWeek > 1 ? 1 : 2 + dayOfWeek
      dateMoment.add(-lastTradeDayOffset, 'days')
    }

    // 对 dateMoment 进行时间修正后再取日期字符串。
    const dayString = moment.utc(+dateMoment - minuteOffset * 60e3).format('YYYY-MM-DD')

    if (!(dayString in simData)) {
      this.simRealtimeData(code, dayString)
      // console.log(code, simData[dayString])
    }

    const realtimeData = simData[dayString]
    const startData = []
    // console.log(realtimeData)

    let endIndex
    if (useLastTradeDay || currentMinutes >= end_2) {
      endIndex = realtimeData.length
    } else if (currentMinutes < start_1) {
      return
    } else if (currentMinutes < start_2) {
      endIndex = Math.min(currentMinutes, end_1) - start_1 + 1
    } else {
      endIndex = currentMinutes - start_2 + 1 + end_1 - start_1
    }

    let minPriceOfDay = Number.MAX_SAFE_INTEGER
    let maxPriceOfDay = Number.MIN_SAFE_INTEGER
    let totalQuantity = 0
    let totalAmount = 0
    let lastEndPrice

    for (let i = 0; i < endIndex - 1; i++) {
      const { time, price: { now, minPrice, maxPrice }, turnoverQuantity, turnoverAmount } = realtimeData[i]
      const fixedTime = moment.utc(time).add(minuteOffset, 'minutes').toISOString()
      lastEndPrice = now
      minPriceOfDay = Math.min(minPriceOfDay, minPrice)
      maxPriceOfDay = Math.max(maxPriceOfDay, maxPrice)
      totalQuantity += turnoverQuantity
      totalAmount += turnoverAmount
      startData.push({
        time: fixedTime,
        price: now,
        turnoverQuantity,
        turnoverAmount,
      })
    }

    // 到当前时间为止的最后一分钟的数据需要单独处理，
    // 只按秒数取其中一部分数据。
    // FIXME ：仍然存在 bug ，与实时数据定时器读取随机数据的时间点有关！
    //         可能会造成某个 detail 数值被多计算一次。
    //         但不是特别大的问题，因为一定时间后会重新去取完整的实时数据，会修正之前错误的计算。
    const lastDetailData = realtimeData[endIndex - 1].detail
    const second = dateMoment.get('second')
    const detailEndIndex = Math.min(Math.floor(second / 5) + 1, lastDetailData.length)
    let totalQuantityOfMinute = 0
    let totalAmountOfMinute = 0
    for (let i = 0; i < detailEndIndex; i++) {
      const { price, turnoverQuantity, turnoverAmount } = lastDetailData[i]
      lastEndPrice = price
      minPriceOfDay = Math.min(minPriceOfDay, price)
      maxPriceOfDay = Math.max(maxPriceOfDay, price)
      totalQuantity += turnoverQuantity
      totalAmount += turnoverAmount
      totalQuantityOfMinute += turnoverQuantity
      totalAmountOfMinute += turnoverAmount
    }
    const lastTime = lastDetailData[detailEndIndex - 1].time
    const lastFixedTime = moment.utc(lastTime).add(minuteOffset, 'minutes').toISOString()
    startData.push({
      time: lastFixedTime,
      price: lastEndPrice,
      turnoverQuantity: totalQuantityOfMinute,
      turnoverAmount: totalAmountOfMinute,
    })

    totalAmount = this.numberFixed2(totalAmount)
    const baseData = this._stockBaseData.getValue()[code]

    if (baseData){
      const subData: AnyObject = {
        latestPrice: lastEndPrice,
        turnoverQuantity: totalQuantity,
        turnoverAmount: totalAmount,
      }
      if (startData.length) {
        if (!baseData.minPrice || baseData.minPrice > minPriceOfDay) {
          subData.minPrice = minPriceOfDay
        }
        if (!baseData.maxPrice || baseData.maxPrice < maxPriceOfDay) {
          subData.maxPrice = maxPriceOfDay
        }
      }
      this.setStockBaseData(code, subData);
    }

    if (code in this._baseDataForSim) {
      Object.assign(this._baseDataForSim[code], {
        FID_ZXJ: lastEndPrice,
        FID_ZGJ: baseData ? baseData.maxPrice : 0,
        FID_ZDJ: baseData ? baseData.minPrice : 0,
        // 开盘价需要修正
        FID_JKP: startData.length ? realtimeData[0].detail[0].price : 0,
        FID_CJSL: totalQuantity,
        FID_CJJE: totalAmount,
      });
    }

    this.parseAndSetRealtimeData(code, startData);
  }

  // 模拟全天实时数据
  private simRealtimeData(code, dayString){
    const fullStartData = [];
    const startData = [];
    const [{ start: start_1, end: end_1}, { start: start_2, end: end_2}] =
      this.appSettings.tradingMinutePeriods;

    const dateMoment = moment.utc(`${dayString} 00:00:00.000`);

    // 开盘时间，使用 ISO 时间 1:30 对应于中国标准时间 9:30
    // 以下同理。
    // const startTime = +dateMoment + start_1 * 60e3;
    // 中午收盘时间。
    const midTime = +dateMoment + end_1 * 60e3;
    // 下午收盘时间。
    const endTime = +dateMoment + end_2 * 60e3;
    // 中午休息时间长度（分钟）。
    const interTrade = start_2 - end_1;

    const baseData = this._stockBaseData.getValue()[code];
    const yesterdayPrice = baseData ? baseData.yesterdayPrice : this._baseDataForSim[code].FID_ZSP;
    const handBase = baseData ? baseData.handBase : this._baseDataForSim[code].FID_JYJS;
    let lastEndPrice = yesterdayPrice;
    const maxPriceBound = this.numberFixed2(yesterdayPrice * 1.1);
    const minPriceBound = this.numberFixed2(yesterdayPrice * 0.9);
    // 控制当天总体趋势是涨还是跌，
    // signSeed 值为 0.55 时，趋势为跌，反之趋势为涨。
    const signSeed = Math.random() >= 0.5 ? 0.55 : 0.45

    const randomData = () => {
      const time = dateMoment.toISOString()
      const minutes = dateMoment.get('hour') * 60 + dateMoment.get('minute')

      // 95% 的几率让价格保持几乎不变。
      const seemNotChange = Math.random() < 0.95
      const sign = Math.random() > signSeed ? 1 : -1
      // 若价格需要变化，则要将最终随机结果限制在有效的涨跌停范围内。
      // 在价格“几乎不变”时， 40% 几率让价格变化 0.01 ，
      // 因为如果完全不变，对于实时数据的界面渲染来说，就不容易看出在持续接收新数据。
      // 单次的变动范围限制在 +-2% 之间，并且对随机数使用平方处理，
      // 让变化更加平缓一些（例如 50% 的几率随机数取值在 0.5 之内，平方后限制在 0.25 之内）。
      const now = Math.min(
                    maxPriceBound, Math.max(
                      minPriceBound,
                      this.numberFixed2(seemNotChange ?
                        lastEndPrice + (Math.random() > 0.6 ? sign * 0.01 : 0) :
                        lastEndPrice * (1 + Math.pow(Math.random(), 2) * 0.02 * sign)
                      )
                    )
                  );

      // turnoverQuantity 的单位设为“股”。
      const turnoverQuantity = Math.floor(Math.random() * 80 + 2) * handBase;
      const turnoverAmount = this.numberFixed2(now * turnoverQuantity * (0.97 + Math.random() * 0.06));
      fullStartData.push({
        time,
        minutes,
        now,
        turnoverQuantity,
        turnoverAmount,
      })
      lastEndPrice = now
    };

    for (dateMoment.add(start_1, 'minutes'); +dateMoment <= midTime; dateMoment.add(5, 'seconds')){
      randomData();
    }

    for (dateMoment.add(interTrade * 60 - 5, 'seconds'); +dateMoment <= endTime; dateMoment.add(5, 'seconds')){
      randomData();
    }

    let lastMinutes = fullStartData[0].minutes;
    let lastTime = '';
    let minPriceOfMinute = Number.MAX_SAFE_INTEGER;
    let maxPriceOfMinute = Number.MIN_SAFE_INTEGER;
    let totalQuantityOfMinute = 0;
    let totalAmountOfMinute = 0;
    let detail = [];
    for (let i = 0; i <= fullStartData.length; i++) {
      const { time, minutes, now, turnoverQuantity, turnoverAmount } = fullStartData[i] || { minutes: 1e5 } as any
      if (minutes > lastMinutes) {
        startData.push({
          time: lastTime,
          price: {
            now: lastEndPrice,
            minPrice: minPriceOfMinute,
            maxPrice: maxPriceOfMinute,
          },
          turnoverQuantity: totalQuantityOfMinute, 
          turnoverAmount: this.numberFixed2(totalAmountOfMinute),
          detail,
        })
        minPriceOfMinute = Number.MAX_SAFE_INTEGER
        maxPriceOfMinute = Number.MIN_SAFE_INTEGER
        totalQuantityOfMinute = 0
        totalAmountOfMinute = 0
        lastMinutes = minutes
        detail = []
      }

      lastEndPrice = now
      lastTime = time
      minPriceOfMinute = Math.min(minPriceOfMinute, now)
      maxPriceOfMinute = Math.max(maxPriceOfMinute, now)
      totalQuantityOfMinute += turnoverQuantity
      totalAmountOfMinute += turnoverAmount
      detail.push({
        time,
        price: now,
        turnoverQuantity,
        turnoverAmount,
      })
    }

    // console.log(fullStartData)
    // console.log(startData)

    this.realtimeSimData[code][dayString] = startData
  }

  private simSubscribeEquity(equityCode: string, eventName: string): Observable<any> {
    const minuteOffset = this.appSettings.minuteOffset
    let maxPriceBound: number;
    let minPriceBound: number;
    let nextTradeDayStartTime: number;
    const calculatePriceBound = () => {
      const baseData = this._stockBaseData.getValue()[equityCode];
      const yesterdayPrice = baseData ? baseData.yesterdayPrice : this._baseDataForSim[equityCode].FID_ZSP;
      maxPriceBound = this.numberFixed2(yesterdayPrice * 1.1);
      minPriceBound = this.numberFixed2(yesterdayPrice * 0.9);
      nextTradeDayStartTime = this._nextTradeDayStartTime;
    };

    const observable = Observable.timer(0, 5e3)
      .do(() => {
        // 交易日切换时，需要重新计算价格上下限。
        if (nextTradeDayStartTime !== this._nextTradeDayStartTime) {
          calculatePriceBound();
        }
      })
      .map(() => {
        const baseData = this._stockBaseData.getValue()[equityCode];
        const { handBase = 100 } = baseData || {} as any
        const dateMoment = moment.utc()
        // 对 dateMoment 进行时间修正后再取日期字符串。
        const dayString = moment.utc(+dateMoment - this.appSettings.minuteOffset * 60e3).format('YYYY-MM-DD')
        const realtimeSimData = this.realtimeSimData
        if (!realtimeSimData[equityCode] || !realtimeSimData[equityCode][dayString]) {
          return
        }

        const realtimeData = realtimeSimData[equityCode][dayString]

        const currentMinutes = this.normalizeMinutes(dateMoment)
        const second = dateMoment.get('second')
        const detailIndex = Math.floor(second / 5)
        const [{ start: start_1, end: end_1}, { start: start_2, end: end_2}] = this.appSettings.tradingMinutePeriods
        let minuteIndex
        if (currentMinutes > end_2 || currentMinutes < start_1) {
          return
        } else if (currentMinutes < start_2) {
          minuteIndex = Math.min(currentMinutes, end_1) - start_1 + 1
        } else {
          minuteIndex = currentMinutes - start_2 + 1 + end_1 - start_1
        }

        if (realtimeData.length <= minuteIndex || realtimeData[minuteIndex].detail.length <= detailIndex) {
          return
        }

        const { time, price, turnoverQuantity: tq, turnoverAmount: ta} = realtimeData[minuteIndex].detail[detailIndex]

        const bets = [];
        for (let i = 5; i > -5; i--){
          const betPrice = price + i / 100;
          // 产生卖五卖五档数据时，需要检测价格是否越界。
          // 此处的卖五卖五档使用数组存储，相邻价位之间只差 0.01 ，
          // 与实时价格相同的价位被锁在 买一 档。
          bets.push(betPrice > maxPriceBound || betPrice < minPriceBound ?
            {
              price: 0,
              quantity: 0,
            } :
            {
              price: betPrice,
              // 挂单量有一定几率出现大数字（ 100000 之内），
              // 是为了测试界面显示是否正常。
              quantity: Math.floor(Math.random() * (Math.random() > 0.9 ? 1e5 : 2e2) + 2) * handBase,
            }
          );
        }

        const newData = {
          t: moment.utc(time).add(minuteOffset, 'minutes').toISOString(),
          p: {
            n: price, 
          },
          tq,
          ta, 
          bets,
        };

        return newData;
      })
      .filter(result => result !== undefined)
      // .do(result => {
      //   console.log(equityCode, result, maxPriceBound, minPriceBound);
      // })

    return observable;
  }

  private _randomKDataArray;

  // 模拟 K 线图的数据
  private randomKData(code, startDate = '20161201', endDate = '20170614', yesterdayPrice = 4.78){
    if (this._randomKDataArray){
      return this._randomKDataArray;
    }

    const randomPrice = (yesterdayPrice) =>
      this.numberFixed2(yesterdayPrice * (0.9 + Math.random() * 0.2));

    const data = [];
    const dateMoment = moment(startDate);
    const startDayOfWeek = dateMoment.day();
    // 起始日期为周末时，向后调整到周一。
    if (startDayOfWeek === 6) {
      dateMoment.add(2, 'days');
    } else if (startDayOfWeek === 0) {
      dateMoment.add(1, 'days');
    }

    let dateString;
    while ((dateString = dateMoment.format('YYYYMMDD')) <= endDate){
      const startPrice = randomPrice(yesterdayPrice);
      const endPrice = randomPrice(yesterdayPrice);
      const minPrice = Math.min(startPrice, endPrice, randomPrice(yesterdayPrice));
      const maxPrice = Math.max(startPrice, endPrice, randomPrice(yesterdayPrice));
      const turnoverQuantity = Math.round(Math.random() * 3000 + 500);
      const turnoverAmount = turnoverQuantity * (minPrice + maxPrice) * 50;
      data.push({
        FID_RQ: dateString,
        FID_ZSP:yesterdayPrice,
        FID_JKP:startPrice,
        FID_ZXJ:endPrice,
        FID_ZDJ:minPrice,
        FID_ZGJ:maxPrice,
        FID_CJSL:turnoverQuantity,
        FID_CJJE:turnoverAmount,
      });

      dateMoment.add(dateMoment.day() === 5 ? 3 : 1, 'days');
      yesterdayPrice = endPrice;
    };

    this._randomKDataArray = data;
    return data;
  }

  // FID_BZ: ""
  // FID_CCSLXZ: ""
  // FID_CCSLXZ_JG: ""
  // FID_CODE: ""
  // FID_CPDM: ""
  // FID_CPID: "0"
  // FID_CPMC: ""
  // FID_DQRQ: ""
  // FID_EN_WTLB: ""
  // FID_FLLB: ""
  // FID_FXJ: ""
  // FID_FXRQ: ""
  // FID_GQDM: "000002"
  // FID_GQLB: "01"
  // FID_GQMC: "万科A"
  // FID_JJJYBZ: ""
  // FID_JSSJ: ""
  // FID_JYDW: ""
  // FID_JYJS: ""
  // FID_JYJW: ""
  // FID_JYXZ: ""
  // FID_JYZT: ""
  // FID_JZJ: ""
  // FID_KSRQ: ""
  // FID_LX: "0"
  // FID_MESSAGE: ""
  // FID_MMXZ: ""
  // FID_PYDM: "WKA"
  // FID_QTJGCCXX: ""
  // FID_QTZGCCSX: ""
  // FID_SLSX: ""
  // FID_SSRQ: ""
  // FID_TDBH: ""
  // FID_TZSL: ""
  // FID_TZXX: ""
  // FID_WTSX: ""
  // FID_WTXX: ""
  // FID_XGDM: ""
  // FID_XJFS: ""
  // FID_XQXZ: ""
  // FID_YXSJ: ""
  // FID_ZDBJ: ""
  // FID_ZED: ""
  // FID_ZGB: ""
  // FID_ZGBJ: ""
  // FID_ZSP: "15"
  // FID_ZXJ: "15"

  // 00 股权板块
  // 01 互联网产权
  // 02 高科技产权
  // 20 台资企业
  // 30 专利技术
  // public requestEquitiesOfSector(sectorType: string = '001'): Promise<any> {
  //   // const url = `${this.appSettings.SERVER_URL}/api/v1/gjs/biz/equities/info`;
  //   // const params = new URLSearchParams();
  //   // params.append('equityType', sectorType);
  //   // return this.httpService.getWithToken(url, {params})
  //   //   .then(data => {
  //   //     if (!Array.isArray(data.data)){
  //   //       return Promise.reject(`get equities of equityType[${sectorType}] data missing`);
  //   //     }
  //   //     // console.log(data);
  //   //     this.parseSectorStockListData(sectorType, data.data);
  //   //   })
  //   //   .catch(err => {
  //   //     console.log('getEquityOfSector error: ', err.message || err);
  //   //     // this.parseAndSetRealtimeData(code, []);
  //   //     return Promise.reject(err);
  //   //   });
  //   const path = `/product/product`
  //   const params = {
  //     //productType	string
  //     // 001 高交所股票、002 高交所知识产权、003 私募基金、004 本能理财
  //     productType:sectorType,
  //   }
  //   return this.appService.request(RequestMethod.Post, path, params, true)
  //     .then(data => {
  //       console.log('requestEquitiesOfSector: ',data)
  //       this.parseSectorStockListData(sectorType, data);
  //     })
  //     .catch(err => {
  //       console.log('getEquityOfSector error: ', err.message || err);
  //       // this.parseAndSetRealtimeData(code, []);
  //       return Promise.reject(err);
  //     });
  // }

  // private parseSectorStockListData(sectorType: string, data: any[]) {
  //   const stockCodeList: string[] = data.map(item => item.FID_GQDM);

  //   const baseData = Object.assign({}, this._stockBaseData.getValue());
  //   let baseDataChanged = false;
  //   data.forEach(({ FID_GQDM: stockCode, FID_GQMC: name ,productId,productName}) => {
  //     if (name && !baseData[stockCode]) {
  //       baseData[stockCode] = {
  //         stockCode,
  //         name,
  //         turnoverQuantity: 0,
  //         turnoverAmount: 0,
  //       };
  //       baseDataChanged = true;
  //     }
  //     //获取成功更新列表缓存
  //     this.appDataService.products.set(productId,{productName})
  //   })

  //   console.log('storage product: ',this.appDataService.products)

  //   if (baseDataChanged) {
  //     this._stockBaseData.next(baseData);
  //   }

  //   const sectorData = this._sectorData.getValue();
  //   this._sectorData.next({
  //     ...sectorData,
  //     [sectorType]: {
  //       ...sectorData[sectorType],
  //       stockCodeList,
  //     }
  //   });

  // }

  public requestProducts(platformType: string = '001'): Promise<any> {
    const path = `/product/product`
    const params = {
      platformType: platformType,
    }
    return this.appService.request(RequestMethod.Post, path, params, true)
      .then(data => {
        console.log('requestProducts: ', data)
        this.parseStockListData(data)
      })
      .catch(err => {
        console.log('requestProducts error: ', err.message || err);
        return Promise.reject(err);
      });
  }

  private parseStockListData(data: any[]) {
    const baseData = Object.assign({}, this._stockBaseData.getValue());
    let baseDataChanged = false;
    data.forEach(({ FID_GQDM: stockCode, FID_GQMC: name, productId, productName }) => {
      if (name && !baseData[stockCode]) {
        baseData[stockCode] = {
          stockCode,
          name,
          turnoverQuantity: 0,
          turnoverAmount: 0,
        };
        baseDataChanged = true;
      }
      //获取成功更新列表缓存
      this.appDataService.products.set(productId, { productName })
    })

    console.log('storage product: ', this.appDataService.products)

    if (baseDataChanged) {
      this._stockBaseData.next(baseData);
    }
  }
}
