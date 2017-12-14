import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { ChangeTradePassword } from '../change-trade-password/change-trade-password';

import { LoginService } from '../../providers/login-service';
import { AppDataService } from '../../providers/app-data-service';
import { PersonalDataService } from '../../providers/personal-data-service';

import { CreateAccountStepSecondPage } from '../create-account-step-second/create-account-step-second';
import { CreateAccountStepThirdPage } from '../create-account-step-third/create-account-step-third';

@Component({
  selector: 'account-center',
  templateUrl: 'account-center.html'
})
export class AccountCenterPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loginService: LoginService,
    public appDataService: AppDataService,
    public personalDataService: PersonalDataService
  ) {}

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
