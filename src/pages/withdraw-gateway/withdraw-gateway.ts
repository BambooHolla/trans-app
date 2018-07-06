import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	AccountServiceProvider,
	PaymentCategory
} from '../../providers/account-service/account-service';

/**
 * Generated class for the WithdrawGatewayPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
	selector: 'page-withdraw-gateway',
	templateUrl: 'withdraw-gateway.html'
})
export class WithdrawGatewayPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public accountService: AccountServiceProvider
	) {
		super(navCtrl, navParams);
	}

	product_list: any[];

	@WithdrawGatewayPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('LOAD_PRODUCT_LIST_ERROR')
	async getProducts() {
		this.product_list = await this.accountService.productList.getPromise();
		debugger
	}
}
