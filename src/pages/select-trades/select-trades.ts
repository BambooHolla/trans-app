import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Platform } from 'ionic-angular';
import { AppDataService } from '../../providers/app-data-service';
import { BehaviorSubject } from 'rxjs';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';


  /**
 * Generated class for the SelectTradesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-select-trades',
  templateUrl: 'select-trades.html',
})
export class SelectTradesPage extends SecondLevelPage {
  private filterProductIndex: number = 0;
  private traderList: any[] = [];
  private show_traderList: any[] = [];
  private mainFilter: BehaviorSubject<string> = new BehaviorSubject( "ALL" );
  private traderId: string = '';
  private  _unRegisterBackButton: any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public appDataService: AppDataService,
    public viewCtrl: ViewController,
    public platform: Platform,

  ) {
    super(navCtrl,navParams)
  }

  /**
   * 初始化，监听
   */
  @SelectTradesPage.willEnter
  initData() {
    this.traderList = this.navParams.get("traderList");
    this.traderId = this.navParams.get("traderId");

    this.mainFilter
            .distinctUntilChanged()
            .subscribe(str => this._filterProduct.call(this, str));

    this._unRegisterBackButton = this.platform.registerBackButtonAction(
      () => {
          this.dismiss();
      },
    );
  }

  /**
   * 用于筛选交易对
   * @param product 筛选交易对的索引
   */
  _filterProduct(product) {
    if (product) {
        product = product.trim().toLowerCase();
        this.show_traderList = this.traderList
            .filter((item: any, index, arr) => {
                    if(item.priceName.trim().toLowerCase() == product || product == 'all') {
                      return true;
                    }
            })
            .sort((a: any, b: any) => {
                return a.priceId - b.priceId;
            });

    } else {
        this.show_traderList = this.traderList;
    }
  }

  /**
   * 筛选币种
   * @param  事件
   */
  filterMainProduct(productName?: string,index?: number) {
    this.filterProductIndex = index;
    this.mainFilter.next(productName);
  }
  
  /**
   * 选中的交易对
   * @param trade 交易对信息
   */
  checkTrade(trade?) {
    this.traderId = trade.traderId || this.traderId;
    this.appDataService.LAST_TRADER.next(trade);
  }
  
  /**
   * 页面离开
   */
  @SelectTradesPage.willLeave
  leavePage() {
    this._unRegisterBackButton && this._unRegisterBackButton();
    this.mainFilter.unsubscribe();  
    const _cb= this.navParams.get("cb");
    _cb && _cb();
  }

  dismiss(trade?) {
    setTimeout(() => {
      this.viewCtrl.dismiss();
    }, 180);
  }
}
