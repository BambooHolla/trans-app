import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { FundStatementPage } from '../fund-statement/fund-statement';
import { CommissionListPage } from '../commission-list/commission-list';
import { HistoryRecordPage } from '../history-record/history-record';



// import { CreateAccountStepThirdPage } from '../create-account-step-third/create-account-step-third';
import { AccountCenterPage } from '../account-center/account-center';
import { AboutPage } from '../about/about';
import { HelpPage } from '../help/help';
import { TransferPage } from "../transfer/transfer";

import { PersonalDataService } from '../../providers/personal-data-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  commandData: any[] = [
    // {
    //   icon: "gtransfer",
    //   name: '银行转交易所/交易所转银行',
    //   href: TransferPage,
    // },
    {
      icon: "gcard",
      name: '身份认证/银行卡绑定',
    },
    // {
    //   icon: "ghand",
    //   name: '我的委托/撤销',
    //   href: CommissionListPage,
    // },
    {
      icon: "gdoc",
      name: '历史成交记录',
      href: HistoryRecordPage,
      bottomSpace: true
    },
    {
      icon: "gtrend",
      name: '资金变动查询',
      href: FundStatementPage,
    },
    {
      icon: "gperson",
      name: '账户中心',
      href: AccountCenterPage,
      bottomSpace: true,
    },
    {
      icon: "ghelp",
      name: '反馈与帮助',
      href: HelpPage,
    },
    {
      icon: "gabout",
      name: '关于币加所',
      href: AboutPage,
    },
    {
      icon: "gabout",
      name: '充值',
      href: 'recharge-gateway',
    },
    {
      icon: "gabout",
      name: '提现',
      href: 'withdraw-gateway',
    },
    {
      icon: "gabout",
      name: '我的工单',
      href: 'work-order-list',
    },
  ];

  constructor(
    public navCtrl: NavController,
    public personalDataService: PersonalDataService,
  ) {

  }

  ionViewDidEnter() {
    this.personalDataService.requestFundData();
  }

}