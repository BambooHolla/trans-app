import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { FundStatementPage } from '../fund-statement/fund-statement';
import { CommissionListPage } from '../commission-list/commission-list';
import { HistoryRecordPage } from '../history-record/history-record';
import { FirstLevelPage} from '../../bnlc-framework/FirsetLevelPage'


// import { CreateAccountStepThirdPage } from '../create-account-step-third/create-account-step-third';
import { AccountCenterPage } from '../account-center/account-center';
import { AboutPage } from '../about/about';
import { HelpPage } from '../help/help';
import { TransferPage } from "../transfer/transfer";

import { PersonalDataService } from '../../providers/personal-data-service';
import { StockDataService } from '../../providers/stock-data-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage extends FirstLevelPage{
  personalAssets: any;
  commandData: any[] = [
    // {
    //   icon: "gabout",
    //   name: '充值',
    //   href: 'recharge-gateway',
    // },
    // {
    //   icon: "gabout",
    //   name: '提现',
    //   href: 'withdraw-gateway',
    //   bottomSpace: true
    // },
    // {
    //   icon: "gtransfer",
    //   name: '银行转交易所/交易所转银行',
    //   href: TransferPage,
    // },
    // {
    //   icon: "gcard",
    //   name: '身份认证/银行卡绑定',
    // },
    // {
    //   icon: "ghand",
    //   name: '我的委托/撤销',
    //   href: CommissionListPage,
    // },
    {
      icon: "gtrend",
      name: '资金变动查询',
      href: FundStatementPage,
    },
    {
      icon: "gdoc",
      name: '历史成交',
      href: HistoryRecordPage,
      bottomSpace: true,
    },
    // {
    //   icon: "gperson",
    //   name: '账户中心',
    //   href: AccountCenterPage,
    // },
    // {
    //   icon: "ghelp",
    //   name: '反馈与帮助',
    //   href: HelpPage,
    // },
    {
      icon: "gabout",
      name: '反馈与帮助',
      href: 'work-order-list',
    },
    {
      icon: "gabout",
      name: '关于我们',
      href: AboutPage,
    },
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public personalDataService: PersonalDataService,
    public stockDataService: StockDataService,
  ) {
    super(navCtrl, navParams)
  }

  ionViewDidEnter() {
    this.personalDataService.requestFundData();
    this.requestAssets();
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
        return Promise.reject(err);
      });
  }

}