import { Component, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';

import { NavController, Refresher } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { StockDetailPage } from "../../pages/stock-detail/stock-detail";

// import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from '../../providers/app-settings';
import { PersonalDataService } from '../../providers/personal-data-service';
import { StockDataService } from '../../providers/stock-data-service';
import { AppDataService } from '../../providers/app-data-service';

@Component({
  selector: 'page-optional',
  templateUrl: 'optional.html'
})
export class OptionalPage implements OnDestroy,AfterViewInit{

  optionalStockDetailList: any[] = [];
  personalAssets:object = {};
  scrollEventRemover:any
  stockDetailPage: any = StockDetailPage;

  private viewDidLeave: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private viewDidLeave$ = this.viewDidLeave
            .asObservable()
            .distinctUntilChanged()
            .filter(value => value === true);

  private lastRealtimeStockList: string[] = [];
  private realtimeStockList: BehaviorSubject<string[]> = new BehaviorSubject([]);
  private realtimeStockList$ = this.realtimeStockList
            .asObservable()
            .distinctUntilChanged();

  constructor(
    public navCtrl: NavController,
    public appSettings: AppSettings,
    public appDataService: AppDataService,
    public personalDataService: PersonalDataService,
    public stockDataService: StockDataService,
    // public translate: TranslateService,
  ) {
    this.initPersonalStockListSubscriber();
  }

  //标题栏滚动监听
  @ViewChild('listHeader') ionScroll
  @ViewChild('listGrid') list

  ngAfterViewInit() {
    //TODO:把时间监听转为Observable
    // this.scrollEventRemover = this.ionScroll.addScrollEventListener(($event) => {
    //   // inside the scroll event
    //   // console.dir($event)
    //   // this.printLog()
    //   this.listScroll($event.target)
    // })
  }
  ngOnDestroy() {
    // this.scrollEventRemover()
  }
  printLog(){
    console.log('printlog')
  }
  listScroll(scrollController: HTMLElement){
    this.list.nativeElement.style.left = `-${scrollController.scrollLeft}px`
  }

  initData(refresher?: Refresher){
    if (refresher) {
      // this.newsList = await this._getNewsList();
      // console.log(this.newsList);
      setTimeout(() => {        
        refresher.complete();
      }, 1e3);
    }
  }

  ionViewDidEnter() {
    this.viewDidLeave.next(false);

    this.requestAssets();

    this.personalDataService.requestFundData();

    this.doSubscribe();

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
    this.refreshOptionalStockDetailList();
  }

  ionViewDidLeave(){
    this.viewDidLeave.next(true);
    this.lastRealtimeStockList = [];
  }

  doSubscribe(){
    this.personalDataService.personalStockList.forEach(({stockCode}) => {
      if (this.lastRealtimeStockList.indexOf(stockCode) !== -1) {
        return;
      }
      this.stockDataService.subscibeRealtimeData(stockCode, 'price', this.viewDidLeave$)
        // 终止实时数据订阅的条件：
        // 1. 离开当前视图，并且超过预设定时器的延时；
        // 2. 个人持股列表发生了变更。
        // 缺点：
        // 在反复进出本视图时，可能会产生多个重复的订阅，一定时间后才会被逐个清除。
        .takeUntil(Observable.merge(
          this.viewDidLeave$.delay(this.appSettings.UNSUBSCRIBE_INTERVAL),
          this.realtimeStockList$.filter(arr => arr.indexOf(stockCode) === -1),
        ))
        // 必须订阅，数据才会流动，即使订阅函数内部没有做任何操作。
        .subscribe();
    });
  }

  initPersonalStockListSubscriber(){
    // 当个人中心的股票持仓列表变化时，重新进行订阅
    this.personalDataService.personalStockList$
      .subscribe(data => {
        console.log('initPersonalStockListSubscriber',data);
        // 个人中心的股票持仓列表变化时，才刷新当前页股票列表的数据源
        // console.log('initPersonalStockListSubscriber: ', data)
        this.optionalStockDetailList = data
          .filter(({ stockCode})=>{
            if(this.appSettings.SIM_DATA){
              return true
            }else{
              return this.appDataService.products.has(stockCode)
            }
          })
          .map(({ stockCode, restQuantity, cost}) => ({
            personalData: {
              stockCode,
              restQuantity,
              cost,
            },
            baseData: this.stockDataService.stockBaseData$.map(data => data[stockCode]),
            realtimePrice: this.stockDataService.subscibeRealtimeData(
              `${this.appDataService.productId}-${stockCode}`
              ,'price')
              .map(item=>{
                if (this.appDataService.productId == stockCode){
                  return {
                    ...item,
                    price:100,
                  }
                }else{
                  return item
                }
              })
          }));
        this.lastRealtimeStockList = this.realtimeStockList.getValue().concat();
        this.realtimeStockList.next(data.map(({stockCode}) => stockCode));
        this.doSubscribe();
        this.refreshOptionalStockDetailList();
      });
  }

  refreshOptionalStockDetailList(){
    // console.log('refreshOptionalStockDetailList')
    this.personalDataService.personalStockList.forEach(({stockCode}) => {
      this.stockDataService.requestStockBaseData(stockCode)
        .catch(() => {});
    });
  }

  requestAssets(){
    this.personalDataService.personalAssets()
      .then(data=>{
        console.log('requestAssets:',data)
        for (let key in data ) {
          const item = data[key]
          let priceName = ''
          const product = this.appDataService.products.get(item.priceId)
          if (product) priceName = `(${product.productName})`
          item.priceName = priceName
          console.log('requestAssets in', data)
        }
        console.log('requestAssets',data)
        this.personalAssets = data
      })
      .catch(err => console.log('requestAssets:',err))
  }

}
