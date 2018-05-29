import { Component, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';

import { NavController, NavParams, Refresher, AlertController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from '../../providers/app-settings';
import { PersonalDataService } from '../../providers/personal-data-service';
import { StockDataService } from '../../providers/stock-data-service';
import { AppDataService } from '../../providers/app-data-service';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import {
  AccountServiceProvider,
  ProductModel
} from '../../providers/account-service/account-service';
import { LoginService } from '../../providers/login-service';
import { AppSettingProvider } from '../../bnlc-framework/providers/app-setting/app-setting';

@Component({
  selector: 'page-optional',
  templateUrl: 'optional.html'
})
export class OptionalPage extends SecondLevelPage {
  optionalStockDetailList: any[] = [];
  personalAssets: object = {};
  // 日盈亏
  dayTotal:any = 0;
  dayTotalArr:any = [];

  private viewDidLeave: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private viewDidLeave$ = this.viewDidLeave
    .asObservable()
    .distinctUntilChanged()
    .filter(value => value === true);

  private lastRealtimeStockList: string[] = [];
  private realtimeStockList: BehaviorSubject<string[]> = new BehaviorSubject(
    []
  );
  private realtimeStockList$ = this.realtimeStockList
    .asObservable()
    .distinctUntilChanged();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public appSettings: AppSettings,
    public appDataService: AppDataService,
    public loginService:LoginService,
    public personalDataService: PersonalDataService,
    public accountService: AccountServiceProvider,
    public stockDataService: StockDataService, // public translate: TranslateService,
    public appSetting: AppSettingProvider,
  ) {
    super(navCtrl, navParams);
    this.loginService.status$.subscribe(status=>{
      if(status && this.appSetting.getUserToken()){
        this.initData()
      }else{
        this.resetData()
      }
    })
  }

  private upDate:boolean = true;
  initData(refresher?: Refresher) {
    //tofix:刷新页面数据初始化流程问题
    if(this.upDate){
      this.upDate = false;
      Promise.all([ 
        this.requestAssets(),
        this.initPersonalStockListSubscriber(),
        this.personalDataService.requestEquityDeposit(),
      ]) 
      .then(() => {
        this.upDate = true;
        return refresher ? refresher.complete() : void 0;
      }).catch(() => {
        this.upDate = true;
        return refresher ? refresher.complete() : void 0;
      })
    }
   
  }

  resetData(){
    this.personalAssets = {}
    this.optionalStockDetailList = []
  }

  @OptionalPage.didEnter
  onIonViewDidEnter() {
    if(this.appSetting.getUserToken()){
      this.initData()
    }else{
      this.resetData()
    }
    this.viewDidLeave.next(false);
    
    // this.personalDataService.requestFundData();

    // this.doSubscribe();

    // 如果不使用 refresh 方法，则进入本页面时，显示的股价未必是最新的。
    // 原因：从当前页面切换到其他页面（或退出APP）一段时间后，
    // 当前页的股票实时订阅被取消，
    // 然后再返回本页面，股价会显示为上一次取消订阅时的最后价格，
    // 不会立刻刷新，需要等待新的实时数据推送。
    // 这样体验可能不好，特别是在盘中看过股价后离开、等收盘之后再回来看的情况。
    //
    // 使用 refreshOptionalStockDetailList() 方法，每次进入页面时都重新请求一次股票基本数据
    // （其他页面应当做类似的处理）。
    // 目前主要问题是需要真实有效数据配合才能测试，否则看起来结果会比较奇怪
    // （总是会先跳回到起始价格）。
    // this.refreshOptionalStockDetailList();
  }

  @OptionalPage.didLeave
  onIonViewDidLeave() {
    this.viewDidLeave.next(true);
    this.lastRealtimeStockList = [];
  }

  doSubscribe() {
    this.personalDataService.personalStockList.forEach(({ stockCode }) => {
      if (this.lastRealtimeStockList.indexOf(stockCode) !== -1) {
        return;
      }
      this.stockDataService
        .subscibeRealtimeData(stockCode, 'price', this.viewDidLeave$)
        // 终止实时数据订阅的条件：
        // 1. 离开当前视图，并且超过预设定时器的延时；
        // 2. 个人持股列表发生了变更。
        // 缺点：
        // 在反复进出本视图时，可能会产生多个重复的订阅，一定时间后才会被逐个清除。
        .takeUntil(
          Observable.merge(
            this.viewDidLeave$.delay(this.appSettings.UNSUBSCRIBE_INTERVAL),
            this.realtimeStockList$.filter(arr => arr.indexOf(stockCode) === -1)
          )
        )
        // 必须订阅，数据才会流动，即使订阅函数内部没有做任何操作。
        .subscribe();
    });
  }

  async initPersonalStockListSubscriber() {
    await this.appDataService.productsPromise;
    // 当个人中心的股票持仓列表变化时，重新进行订阅
    this.personalDataService.personalStockList$.subscribe(async data => {
      console.log('initPersonalStockListSubscriber', data); 
      // 个人中心的股票持仓列表变化时，才刷新当前页股票列表的数据源
      // console.log('initPersonalStockListSubscriber: ', data)
      this.optionalStockDetailList = await Promise.all(data
        // //个人持仓已由平台类型在请求时过滤,故这边不再做过滤
        // .filter(({ stockCode }) => {
        //   if (this.appSettings.SIM_DATA) {
        //     return true;
        //   } else {
        //     return this.appDataService.products.has(stockCode);
        //   }
        // })
        .map(async ({ stockCode, restQuantity, cost }) => ({
          productInfo: await this.stockDataService.getProduct(stockCode),
          personalData: {
            stockCode,
            restQuantity,
            cost
          },
          baseData: this.stockDataService.stockBaseData$.map(
            data => data[stockCode]
          ),
          realtimePrice: this.stockDataService
            .subscibeRealtimeData(
              `${this.appDataService.productId}-${stockCode}`,
              'price'
            )
            .map(item => {
              if (this.appDataService.productId == stockCode) {
                return {
                  ...item,
                  price: 1
                };
              } else {
                return item;
              }
            })
        })));

      //计算每日盈亏,持仓 * 涨幅 * 最新价 
      for(let i = 0 ; i < this.optionalStockDetailList.length; i++) {
        this.optionalStockDetailList[i].realtimePrice.subscribe( val => {
          if(val && this.optionalStockDetailList[i].personalData.restQuantity) {
            this.dayTotalArr[i] =  this.optionalStockDetailList[i].personalData.restQuantity * ( val.range || 0) * (val.price || 1);
            this.dayTotal = 0;
            for(let j = 0; j < this.dayTotalArr.length; j++) {
              this.dayTotal += this.dayTotalArr[j] || 0;
            }
          }
        })
      }
      
      this.lastRealtimeStockList = this.realtimeStockList.getValue().concat();
      this.realtimeStockList.next(data.map(({ stockCode }) => stockCode));
      this.doSubscribe();
      this.refreshOptionalStockDetailList();
    });
  }

  refreshOptionalStockDetailList() {
    // console.log('refreshOptionalStockDetailList')
    this.personalDataService.personalStockList.forEach(({ stockCode }) => {
      this.stockDataService.requestStockBaseData(stockCode).catch(() => {});
    });
  }

  requestAssets() {
    return this.personalDataService
      .personalAssets()
      .then(async data => {
        for (let key in data) {
          const item = data[key];
          let priceName = '';
          const product = await this.stockDataService.getProduct(item.priceId)

          if (product) priceName = `(${product.productName})`;
          item.priceName = priceName;
        }
        console.log('requestAssets', data);
        this.personalAssets = data; 
        return Promise.resolve();
      })
      .catch(err => {
        console.log('requestAssets:', err);
        this.alertCtrl.create({
          title:"获取持仓出错",
          message:err.message||"未知错误",
          buttons:[{
            text:"确定"
          }]
        }).present();
        return Promise.reject(err);
      });
  }
}
