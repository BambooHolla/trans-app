import { Component, ViewChild } from "@angular/core";
// import { Component } from '@angular/core';

import { NavController, Tabs } from "ionic-angular";
// import { NavController } from 'ionic-angular';

// import { LoginPage } from '../login/login';

import { NoticeListPage } from "../notice-list/notice-list";
import { NewsListPage } from "../news-list/news-list";

@Component({
    templateUrl: "info-tabs.html",
})
export class InfoTabsPage {
    noticeListRoot: any = NoticeListPage;
    newsRoot: any = NewsListPage;

    @ViewChild("infotabs") infotabsRef: Tabs;

    test() {
        alert("test");
    }

    // gotoPage(page){
    //   this.menuCtrl.close();
    //   this.navCtrl.push(page);
    // }

    // logout(){
    //   this.loginService.doLogout();
    // }

    // ionViewDidEnter(){
    //   console.log('ionViewDidEnter');
    // }

    constructor(public navCtrl: NavController) {}
}
