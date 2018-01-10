import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  commandData: any[] = [
    {
      icon: "gemail",
      name: 'bngj@bnqkl.com',
    }, {
      icon: "gphone",
      name: '0591-87275881',
    }, {
      icon: "gcompany",
      name: '厦门本能管家科技有限公司',
    }, {
      icon: "gaddress",
      name: '厦门市思明区湖滨北路72号中闽大厦38楼',
    },
  ]

  constructor(public navCtrl: NavController) {

  }

}
