import { Component } from '@angular/core';

import { NavController, NavParams, Events } from 'ionic-angular';
import { ChangeTradePassword } from '../change-trade-password/change-trade-password';

import { LoginService } from '../../providers/login-service';
import { AppDataService } from '../../providers/app-data-service';
import { PersonalDataService } from '../../providers/personal-data-service';

import { CreateAccountStepSecondPage } from '../create-account-step-second/create-account-step-second';
import { CreateAccountStepThirdPage } from '../create-account-step-third/create-account-step-third';
import { AccountServiceProvider } from '../../providers/account-service/account-service';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';

@Component({
  selector: 'account-center',
  templateUrl: 'account-center.html'
})
export class AccountCenterPage extends SecondLevelPage {

  private login_status: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public loginService: LoginService,
    public appDataService: AppDataService,
    public accountService: AccountServiceProvider,
    public personalDataService: PersonalDataService
  ) {
    super(navCtrl, navParams);
    this.loginService.status$.subscribe(status=>{
      this.login_status = status
      if(status) this.checkHasAccountPWD()
    })
  }

  has_account_pwd = false;
  loading_has_account_pwd = true;

  // @AccountCenterPage.willEnter
  @asyncCtrlGenerator.error('获取交易密码信息出错')
  async checkHasAccountPWD() {
    this.loading_has_account_pwd = true;
    this.has_account_pwd = await this.accountService.hasAccountPwd.getPromise();
    this.loading_has_account_pwd = false;
  }

  openPage() {
    this.navCtrl.push(ChangeTradePassword);
  }

  identify() {
    if (this.personalDataService.certifiedStatus === '101' || this.personalDataService.certifiedStatus === '103'){
      return void 0
    }
    this.navCtrl.push('submit-real-info');
  }

  financeAccount() {
    this.navCtrl.push(CreateAccountStepSecondPage);
  }

  showLogin() {
    this.events.publish('show login', 'login');
  }

  doLogout(){
    this.loginService.doLogout()
      .then(success=>{
        if(success) this.navCtrl.pop({
          animate: true,
          direction: 'back',
          animation: 'ios-transition',
        })
        this.routeTo('quotations')
      })
      .catch()
  }

}
