import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, InfiniteScroll } from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	WorkOrderServiceProvider,
	ContactType,
	ConcatModel
} from '../../providers/work-order-service/work-order-service';

@Component({
	selector: 'page-work-order-list',
	templateUrl: 'work-order-list.html'
})
export class WorkOrderListPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public workOrderService: WorkOrderServiceProvider
	) {
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
	work_order_list: ConcatModel[];
	page = 0;
	pageSize = 5;
	hasMore = true;

	@WorkOrderListPage.willEnter
	@asyncCtrlGenerator.loading(undefined, 'hide_loading_and_use_welcome')
	@asyncCtrlGenerator.error('工单列表加载失败')
	async loadWorkOrderList() {
		WorkOrderListPage._first_init_page =
			WorkOrderListPage.hide_loading_and_use_welcome;
		console.log(
			'show_welcome',
			WorkOrderListPage._first_init_page,
			this.show_welcome
		);
		if (WorkOrderListPage._first_init_page) {
			setTimeout(() => {
				WorkOrderListPage._first_init_page = false;
			}, 2500);
		}

		const work_order_list = await this._getWorkOrderList();
		this.work_order_list = work_order_list;
		return work_order_list;
	}

	// @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;

	private async _getWorkOrderList() {
		const { page, pageSize } = this;
		const list = (await this.workOrderService.getWorkOrderList({
			page,
			pageSize
		})).map(work_order_item => {
			return {
				...work_order_item,
				typeDetail: WorkOrderServiceProvider.getConcatTypeDetail(
					work_order_item.type
				),
				statusDetail: WorkOrderServiceProvider.getContactStatusDetail(
					work_order_item.status
				)
			};
		});
			this.hasMore; = list.length >= pageSize;
		return list;
	}

	@asyncCtrlGenerator.error('更多工单列表加载失败')
	async loadMoreWorkOrderList() {
		this.page += 1;
		const list = await this._getWorkOrderList();
		this.work_order_list.push(...list);
		return list;
	}

	@WorkOrderListPage.didLeave
	reset_hide_loading_and_use_welcome() {
		WorkOrderListPage.hide_loading_and_use_welcome = !(
			this.work_order_list && this.work_order_list.length
		);
	}
	getConcatTypeDetail = WorkOrderServiceProvider.getConcatTypeDetail;
	getContactStatusDetail = WorkOrderServiceProvider.getContactStatusDetail;
}
