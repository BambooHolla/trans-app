import {
	Component,
	ViewChild,
	ElementRef,
	IterableDiffers,
	Renderer,
	Renderer2,
	AfterContentInit,
	SimpleChanges,
	SimpleChange
} from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const MB: typeof MutationObserver =
	window['MutationObserver'] || window['WebKitMutationObserver'];

@Component({
	selector: 'page-work-order-detail',
	templateUrl: 'work-order-detail.html'
})
export class WorkOrderDetailPage extends SecondLevelPage
	implements AfterContentInit {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public r1: Renderer,
		public r2: Renderer2
	) {
		super(navCtrl, navParams);
	}

	chat_content = '';
	chat_logs = [];
	@WorkOrderDetailPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('获取工单内容出错')
	async getChatLogs() {
		await new Promise(cb => setTimeout(cb, 1000));
		this.chat_logs = [
			{
				from_self: false,
				content: '您好，谢谢您支持毕加所我是为您解答的管理员小b,我司产品无需手续费安全可靠放心使用。'
			},
			{
				from_self: true,
				content: '好的，谢谢！'
			}
		];
	}
	@ViewChild(Content) content: Content;
	@ViewChild('chatLogs') chatLogs: ElementRef;

	// @WorkOrderDetailPage.onInit
	/*handleListScroll*/
	observer: MutationObserver;
	ngAfterContentInit() {
		const scrollEle = this.content.getScrollElement();
		const isScrollToBottom = () =>
			scrollEle.scrollHeight - scrollEle.clientHeight ==
			scrollEle.scrollTop;

		const observer = (this.observer = new MB(mutations => {
			mutations.forEach(mutation => {
				console.log(mutation.type);
				// this.bindEnterAniForNodes(
				// 	Array.prototype.slice.call(mutation.addedNodes)
				// );
				this.content.scrollToBottom();
			});
		}));
		// 传入目标节点和观察选项
		observer.observe(this.chatLogs.nativeElement, { childList: true });
	}
	/**
	  * 下一次更新的时候是否强制滚动到底部
	  * 在用户发送新的内容后，就会自动滚动到底部
	  * 如果用户自己将内容滚上去，处于浏览历史记录，那么不会导致页面强制滚动
	  */
	// is_force_to_bottom = false;

	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('发送出错')
	async sendChat() {
		const { chat_content } = this;
		this.chat_content = chat_content.trim();
		if (chat_content) {
			await new Promise(cb => setTimeout(cb, 200));
			this.chat_content = '';
			this.chat_logs.push({
				from_self: true,
				content: chat_content
			});
			setTimeout(() => {
				this.chat_logs.push({
					from_self: false,
					content: 'ECHO:' + chat_content
				});
			}, 1000);
		}
	}
}
