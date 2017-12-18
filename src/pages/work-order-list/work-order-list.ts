import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';

/**
 * Generated class for the WorkOrderListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-work-order-list',
	templateUrl: 'work-order-list.html'
})
export class WorkOrderListPage extends SecondLevelPage {
	constructor(public navCtrl: NavController, public navParams: NavParams) {
		super(navCtrl, navParams);
	}
	private static hide_loading_and_use_welcome = true;
	private static _first_init_page = true;
	get show_welcome() {
		return (
			WorkOrderListPage._first_init_page ||
			!this.work_order_list ||
			!this.work_order_list.length
		);
	}
	get hide_loading_and_use_welcome() {
		return WorkOrderListPage.hide_loading_and_use_welcome;
	}
	work_order_list: any[];

	@WorkOrderListPage.willEnter
	@asyncCtrlGenerator.loading(undefined, 'hide_loading_and_use_welcome')
	@asyncCtrlGenerator.error('工单列表加载失败')
	async loadWorkOrderList() {
		WorkOrderListPage._first_init_page =
			WorkOrderListPage.hide_loading_and_use_welcome;
		console.log('show_welcome', WorkOrderListPage._first_init_page,this.show_welcome);
		if (WorkOrderListPage._first_init_page) {
			setTimeout(() => {
				WorkOrderListPage._first_init_page = false;
			}, 2500);
		}
		await new Promise(cb => setTimeout(cb, 1500));
		this.work_order_list = Array.from(Array(2));
	}

	@WorkOrderListPage.didLeave
	reset_hide_loading_and_use_welcome() {
		WorkOrderListPage.hide_loading_and_use_welcome = !this.work_order_list
			.length;
	}
}
