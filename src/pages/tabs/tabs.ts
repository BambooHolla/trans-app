import { Component, ViewChild } from '@angular/core';

import { NavController } from 'ionic-angular';

import { OptionalPage } from '../optional/optional';
import { RecommendPage } from '../recommend/recommend';
import { HomePage } from '../home/home';
import { QuotationsPage } from '../quotations/quotations';

import { AppSettings } from '../../providers/app-settings';
import { PersonalDataService } from '../../providers/personal-data-service';


//引入资讯的首页
import { InformationPage } from '../information/information';
import { TradeInterfacePage } from '../trade-interface/trade-interface';

@Component({
  selector: 'component-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  optionalRoot: any = OptionalPage;

  infoTabsRoot: any = InformationPage;

  homeRoot: any = HomePage;
  quotationsPageRoot: any = QuotationsPage;
  tradeRoot: any = TradeInterfacePage;

  @ViewChild('optionalTab') optionalTab;

  constructor(
    public navCtrl: NavController,
    public appSettings: AppSettings,
    public personalDataService: PersonalDataService,
  ) {
    // FIXME ：如何获取推荐的股票列表？
    // 后续处理的调用暂时注释掉。
    // this.checkPersonalStockListIsNull();
  }

  ionViewDidLoad() {

  }

  checkPersonalStockListIsNull() {
    if (this.personalDataService.personalStockListIsNull === true){
      this.optionalRoot = RecommendPage;
    }

    this.personalDataService.personalStockListIsNull$
      .subscribe(result => {
        if (this.optionalTab){
          const targetPage = result ? RecommendPage : OptionalPage;
          const optionalTabRoot = this.optionalTab.root;
          if (optionalTabRoot !== targetPage){
            const direction = result ? 'forward' : 'back';
            try {
              this.optionalTab.getActive().getNav().setRoot(targetPage, {}, {
                direction, animation: 'ios-transition', animate: true,
              });
            } catch (e) {
              console.log(e.message || e);
            }
          }
        }
      });
  }

}
