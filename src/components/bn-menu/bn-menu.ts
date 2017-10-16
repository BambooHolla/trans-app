import { Component, Input, Output, EventEmitter } from '@angular/core';

import { NavController, MenuController, Tabs } from 'ionic-angular';

import { LoginPage } from '../../pages/login/login';

import { LoginService } from '../../providers/login-service';

@Component({
  selector: 'bn-menu',
  templateUrl: 'bn-menu.html'
})
export class BnMenuComponent {

  @Input()
  tabRef: Tabs;

  @Output() selectTabEmitter:EventEmitter<number> = new EventEmitter();

  selectTab(index){
    this.menuCtrl.close();
    // this.tabRef.select(index);
    this.selectTabEmitter.emit(index);
  }

  async logout(){
    this.menuCtrl.close();
    await this.loginService.doLogout();
    this.navCtrl.setRoot(LoginPage);
  }

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public loginService:LoginService,
  ) {

  }

}
