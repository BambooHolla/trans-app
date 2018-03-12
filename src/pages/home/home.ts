import { Component, OnInit } from '@angular/core';

import { NavController, NavParams, Events } from 'ionic-angular';
import { FundStatementPage } from '../fund-statement/fund-statement';
import { CommissionListPage } from '../commission-list/commission-list';
import { HistoryRecordPage } from '../history-record/history-record';
import { FirstLevelPage } from '../../bnlc-framework/FirsetLevelPage'


// import { CreateAccountStepThirdPage } from '../create-account-step-third/create-account-step-third';
import { AccountCenterPage } from '../account-center/account-center';
import { AboutPage } from '../about/about';
import { HelpPage } from '../help/help';
import { TransferPage } from "../transfer/transfer";

import { PersonalDataService } from '../../providers/personal-data-service';
import { StockDataService } from '../../providers/stock-data-service';
import { InviteCommissionPage } from '../invite-commission/invite-commission';
import { LoginService } from '../../providers/login-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage extends FirstLevelPage implements OnInit{
  personalAssets: any;
  login_status: boolean;
  commandData: any[] = [
    // {
    //   icon: "gabout",
    //   name: '充值',
    //   href: 'recharge-gateway',
    //   needLogin: true,
    // },
    // {
    //   icon: "gabout",
    //   name: '提现',
    //   href: 'withdraw-gateway',
    //   needLogin: true,
    //   bottomSpace: true
    // },
    // {
    //   icon: "gtransfer",
    //   name: '银行转交易所/交易所转银行',
    //   href: TransferPage,
    //   needLogin: true,
    // },
    // {
    //   icon: "gcard",
    //   name: '身份认证/银行卡绑定',
    // },
    // {
    //   icon: "ghand",
    //   name: '我的委托/撤销',
    //   href: CommissionListPage,
    //   needLogin: true,
    // },
    // {
    //   icon: "gtrend",
    //   name: '资金变动查询',
    //   href: FundStatementPage,
    //   needLogin: true,
    // },
    {
      icon: "gdoc",
      name: '历史成交',
      href: HistoryRecordPage,
      needLogin: true,
      // bottomSpace: true,
    },
    {
      icon: "ginvite",
      name: '邀请返佣',
      href: InviteCommissionPage,
      needLogin: true,
    },
    // {
    //   icon: "gperson",
    //   name: '账户中心',
    //   href: AccountCenterPage,
    //   needLogin: true,
    // },
    // {
    //   icon: "ghelp",
    //   name: '反馈与帮助',
    //   href: HelpPage,
    //   needLogin: true,
    // },
    {
      icon: "ghelp",
      name: '反馈与帮助',
      href: 'work-order-list',
      needLogin: true,
    },
    {
      icon: "gabout",
      name: '关于我们',
      href: AboutPage,
      needLogin: false,
    },
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events,
    public loginService: LoginService,
    public personalDataService: PersonalDataService,
    public stockDataService: StockDataService,
  ) {
    super(navCtrl, navParams)
  }

  ngOnInit(){
    this.loginService.status$
      .subscribe(async status => {
        this.login_status = status
        if(status){
          await Promise.all([
            this.personalDataService.requestFundData(),
            this.requestAssets(),
          ])
        }else{
          this.personalDataService.resetData();
          this.personalAssets = {};
        }
        this.content.resize();
      })

  }

  ionViewDidEnter() {

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
        // return Promise.resolve();
      })
      .catch(err => {
        console.log('requestAssets:', err);
        // return Promise.reject(err);
      });
  }

  showLogin(){
    this.events.publish('show login', 'login');
  }

  navPush(href,needLogin = false){
    if(!this.login_status && needLogin){
      this.showLogin()
      return void 0
    }else{
      this.navCtrl.push(href)
    }
  }  

}