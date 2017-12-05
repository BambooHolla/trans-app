import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';

/**
 * Generated class for the WithdrawDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
	selector: 'page-withdraw-detail',
	templateUrl: 'withdraw-detail.html'
})
export class WithdrawDetailPage extends SecondLevelPage {
	constructor(public navCtrl: NavController, public navParams: NavParams) {
		super(navCtrl, navParams);
	}
}
