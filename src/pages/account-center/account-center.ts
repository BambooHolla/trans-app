import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
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
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loginService: LoginService,
    public appDataService: AppDataService,
    public accountService: AccountServiceProvider,
    public personalDataService: PersonalDataService
  ) {
    super(navCtrl, navParams);
  }

  has_account_pwd = false;
  loading_has_account_pwd = true;

  @AccountCenterPage.willEnter
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
    this.navCtrl.push('submit-real-info');
  }

  financeAccount() {
    this.navCtrl.push(CreateAccountStepSecondPage);
  }
}
