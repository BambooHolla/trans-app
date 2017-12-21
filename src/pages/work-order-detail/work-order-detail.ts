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
import {
	IonicPage,
	NavController,
	NavParams,
	InfiniteScroll,
	Content,
	ViewController,
	Refresher,
	ModalController
} from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {
	WorkOrderServiceProvider,
	ContactType,
	ConcatModel,
	ReplyRole,
	ReplyModel
} from '../../providers/work-order-service/work-order-service';
const MB: typeof MutationObserver =
	window['MutationObserver'] || window['WebKitMutationObserver'];

type ChatLog =
	| ReplyModel
	| {
			htmlContent: string;
			from_self: false;
		};
@Component({
	selector: 'page-work-order-detail',
	templateUrl: 'work-order-detail.html'
})
export class WorkOrderDetailPage extends SecondLevelPage
	implements AfterContentInit {
	constructor(
		public navCtrl: NavController,
		public viewCtrl: ViewController,
		public navParams: NavParams,
		public r1: Renderer,
		public r2: Renderer2,
		public workOrderService: WorkOrderServiceProvider
	) {
		super(navCtrl, navParams);
	}

	work_order: ConcatModel;
	chat_content = '';
	page = 0;
	pageSize = 5;
	enableMore = true;
	chat_logs: ChatLog[] = [];
	@WorkOrderDetailPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('获取工单内容出错')
	async getChatLogs() {
		this.work_order = this.navParams.get('work_order');
		if (this.work_order) {
		} else {
			this.navCtrl.removeView(this.viewCtrl);
		}
		this.page = 0;
		const contact_reply_list = await this._getContactReplyList();

		this.chat_logs = contact_reply_list.reverse();
	}

	@ViewChild(Refresher) refresher: Refresher;

	private async _getContactReplyList() {
		const { page, pageSize } = this;
		const list = await this._formatContactReplyList(
			await this.workOrderService.getContactReplyList(
				this.work_order.workOrderId,
				{
					page,
					pageSize
				}
			)
		);
		this.enableMore = list.length >= pageSize;
		return list;
	}

	@asyncCtrlGenerator.error('加载历史记录出错')
	async loadMoreHistoryReplyList(ref?: Refresher) {
		this.page += 1;
		const contact_reply_list = await this._getContactReplyList();
		this.chat_logs.unshift(...contact_reply_list.reverse());
		if (ref) {
			ref.complete();
		}
	}

	private async _formatContactReplyList(list: ReplyModel[]) {
		return list.map(item => {
			return {
				...item,
				htmlContent: item.content,
				from_self: ReplyRole.customer == item.senderRole
			} as ChatLog;
		});
	}

	@ViewChild(Content) content: Content;
	@ViewChild('chatLogs') chatLogs: ElementRef;

	// @WorkOrderDetailPage.onInit
	/*handleListScroll*/
	observer: MutationObserver;
	ngAfterContentInit() {
		const scrollEle = this.content.getScrollElement();
		const shouldScrollToBottom = () => {
			return (
				scrollEle.scrollHeight -
					(scrollEle.scrollTop + scrollEle.clientHeight) <
				scrollEle.clientHeight
			);
		};

		const observer = (this.observer = new MB(mutations => {
			// mutations.forEach(mutation => {
			// console.log(mutation.type);
			// this.bindEnterAniForNodes(
			// 	Array.prototype.slice.call(mutation.addedNodes)
			// );
			// });
			debugger;
			if (shouldScrollToBottom()) {
				this.content.scrollToBottom();
			}
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
			const replay = await this.workOrderService.addContactReply(
				this.work_order.workOrderId,
				{
					content: this.chat_content
				}
			);
			this.chat_content = '';
			this.chat_logs.push(
				(await this._formatContactReplyList([replay]))[0]
			);
		}
	}
}
