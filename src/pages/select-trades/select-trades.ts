import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AppDataService } from '../../providers/app-data-service';
import { FirstLevelPage } from '../../bnlc-framework/FirstLevelPage';
import { BehaviorSubject } from 'rxjs';
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
export class SelectTradesPage extends FirstLevelPage {
  private filterProductIndex: number = 0;
  private traderList: any[] = [];
  private show_traderList: any[] = [];
  private mainFilter: BehaviorSubject<string> = new BehaviorSubject( "ALL" );
  private traderId: string = '';
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public appDataService: AppDataService,
    public viewCtrl: ViewController,

  ) {
    super(navCtrl,navParams)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SelectTradesPage');
  }
  /**
   * 页面离开，解除监听
   */
  ionViewDidLeave() {
    this.mainFilter.unsubscribe();
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
    setTimeout(() => {
      this.dismiss()
    }, 500);
  }
  dismiss(trade?) {
    this.viewCtrl.dismiss();
  }
}
