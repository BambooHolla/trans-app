import {
    Component,
    ViewChild,
    ElementRef,
    IterableDiffers,
    Renderer,
    Renderer2,
    AfterContentInit,
    SimpleChanges,
    SimpleChange,
} from "@angular/core";
import {
    IonicPage,
    NavController,
    NavParams,
    InfiniteScroll,
    Content,
    ViewController,
    Refresher,
    ModalController,
} from "ionic-angular";
import { SecondLevelPage } from "../../bnlc-framework/SecondLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import {
    WorkOrderServiceProvider,
    ContactType,
    ConcatModel,
    ReplyRole,
    ReplyModel,
} from "../../providers/work-order-service/work-order-service";
import { FsProvider, FileType } from "../../providers/fs/fs";
import { DomSanitizer } from '@angular/platform-browser'
const MB: typeof MutationObserver =
    window["MutationObserver"] || window["WebKitMutationObserver"];

type ChatLog =
    | ReplyModel
    | {
          htmlContent: string;
          from_self: false;
      };
@Component({
    selector: "page-work-order-detail",
    templateUrl: "work-order-detail.html",
})
export class WorkOrderDetailPage extends SecondLevelPage
    implements AfterContentInit {
    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public navParams: NavParams,
        public r1: Renderer,
        public r2: Renderer2,
        public fsService: FsProvider,
        public workOrderService: WorkOrderServiceProvider,
        public sanitizer: DomSanitizer,
    ) {
        super(navCtrl, navParams);
    }

    work_order: ConcatModel;
    work_order_attachment: any[];
    work_has_img: boolean = false;
    chat_content = "";
    page = 1;
    pageSize = 5;
    enableMore = true;
    chat_logs: ChatLog[] = [];
    contact_list: any;
    contact_status_list: any = {
        "001": window["language"]["SUBMITTED"] || "已提交",
        "002": window["language"]["FOLLOWING"] || "跟进中",
        "003": window["language"]["FEEDBACKED"] || "已反馈",
        "010": window["language"]["HANDLED"] || "已处理",
    };
    contact_status: string = "";
    @WorkOrderDetailPage.willEnter
    @asyncCtrlGenerator.loading()
    @asyncCtrlGenerator.error("@@WORK_ORDER_CONTENT_ERROR ") 
    async getChatLogs() {
        this.work_order = this.navParams.get("work_order");
        if (this.work_order) {
            this.getWorkOrderAttachment();
        } else {
            this.navCtrl.removeView(this.viewCtrl);
            return;
        }
        this.page = 1;
        this.contact_list = await this._getContactList();
        this.contact_status =
            this.contact_status_list[
                this.contact_list.contact
                    ? this.contact_list.contact.status
                    : "001"
            ] || "已提交";
        const contact_reply_list = await this._getContactReplyList();
        this.chat_logs = contact_reply_list.reverse();
    }
     getWorkOrderAttachment() {
         const imgFidArr = [];
        this.work_order.attachment.forEach( async(fid) => {
            if (fid) {
                imgFidArr.push(this.getReadImage(fid));
                this.work_has_img = true;
            }
        });
        Promise.all(imgFidArr).then( imgArr => {
            this.work_order_attachment = imgArr;
        })
    }

    @ViewChild(Refresher) refresher: Refresher;

    private async _getContactReplyList() {
        const { page, pageSize } = this;
        const list = await this._formatContactReplyList(
            await this.workOrderService.getContactReplyList(
                this.work_order.workOrderId,
                {
                    page,
                    pageSize,
                },
            ),
        );
        this.enableMore = list.length >= pageSize;
        return list;
    }

    async _getContactList() {
        const list = await this.workOrderService.getContactList(
            this.work_order.workOrderId,
        );
        return list;
    }

    @asyncCtrlGenerator.error("@@LOADING_HISTORY_RECORD_ERROR") 
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
                from_self: ReplyRole.customer == item.senderRole,
            } as ChatLog;
        });
    }

    getReadImage(fid:string):Promise<any>{
        return this.fsService.readImage(fid).then( img => {
            return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(img));
            
        }).catch( err => {
            return ''
        })
    }


    @ViewChild(Content) content: Content;
    @ViewChild("chatLogs") chatLogs: ElementRef;

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

    submitSend() {
        const { chat_content } = this;
        if(chat_content.trim()) {
            this.sendChat()
        }
    }

    @asyncCtrlGenerator.loading()
    @asyncCtrlGenerator.error("@@SENDING_ERROR")
    async sendChat() {
        const { chat_content } = this;
        let list = await this._getContactList();
        let status = list["contact"] ? list["contact"]["status"] : "001";
        if (status == "010") {
            return Promise.reject("WORK_ORDER_HAS_BEEN_DEALT");
        }
        this.chat_content = chat_content.trim();
        if (chat_content) {
            const replay = await this.workOrderService.addContactReply(
                this.work_order.workOrderId,
                {
                    content: this.chat_content,
                },
            );
            this.chat_content = "";
            this.chat_logs.push(
                (await this._formatContactReplyList([replay]))[0],
            );
        }
    }
}
