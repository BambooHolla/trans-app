import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';

/**
 * Generated class for the RechargeDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
	selector: 'page-recharge-detail',
	templateUrl: 'recharge-detail.html'
})
export class RechargeDetailPage extends SecondLevelPage {
	constructor(public navCtrl: NavController, public navParams: NavParams) {
		super(navCtrl, navParams);
	}
}
