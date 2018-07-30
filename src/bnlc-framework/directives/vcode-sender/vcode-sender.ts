import {
    Directive,
    Input,
    Output,
    EventEmitter,
    ElementRef,
    OnChanges,
    SimpleChanges,
    SimpleChange,
    OnInit,
} from "@angular/core";
import { ERROR_FROM_ASYNCERROR } from "../../Decorator";

export enum SenderStatus {
    free,
    sending,
    waitingNext,
}
export type DataSnapShot = {
    _count_down_start_time: Date;
    auto_send: boolean;
    free_template_text: string;
    sending_template_text: string;
    waiting_next_template_text: string;
    waiting_next_second: number;
    waiting_next_model: string;
    _sender_status: SenderStatus;
};

@Directive({
    selector: "[vcode-sender]", // Attribute selector
})
export class VcodeSenderDirective implements OnInit, OnChanges {
    @Output("vcode-sender") sender = new EventEmitter();
    @Input("auto-send") auto_send = false;
    @Input("free-tpl")
    free_template_text: string =
        window["language"]["GAIN_VERIFICATION_CODE"] || "获取验证码";
    @Input("sending-tpl")
    sending_template_text = window["language"]["SENDING"] || "发送中";
    @Input("waiting-next-tpl") waiting_next_template_text = "{s}s";
    @Input("waiting-next-second") waiting_next_second = 60;
    @Input("waiting-next-model") waiting_next_model = "count-down";

    // 数据快照
    getSnapshot(): DataSnapShot {
        return {
            _count_down_start_time: this._count_down_start_time,
            auto_send: this.auto_send,
            free_template_text: this.free_template_text,
            sending_template_text: this.sending_template_text,
            waiting_next_template_text: this.waiting_next_template_text,
            waiting_next_second: this.waiting_next_second,
            waiting_next_model: this.waiting_next_model,
            _sender_status: this._sender_status,
        };
    }
    setSnapshot(data: DataSnapShot) {
        for (let k in data) {
            this[k] = data[k];
        }
        // 刷新
        this.sender_status = this.sender_status;
    }

    private get _count_down_second() {
        return Math.ceil(
            (this._count_down_start_time.valueOf() - Date.now()) / 1000 +
                this.waiting_next_second,
        );
    }
    private _count_down_start_time: Date;

    private _sender_status: SenderStatus;
    private _refresh_ti: number;
    @Input("sender-status")
    set sender_status(v: SenderStatus) {
        switch (v) {
            case SenderStatus.free:
                this.buttonEle.disabled = false;
                this._innerEle.innerHTML = this.free_template_text;
                break;
            case SenderStatus.sending:
                this.buttonEle.disabled = true;
                this._innerEle.innerHTML = this.sending_template_text;
                break;
            case SenderStatus.waitingNext:
                this.buttonEle.disabled = true;
                if (this.waiting_next_model === "count-down") {
                    if (!this._count_down_start_time) {
                        this._count_down_start_time = new Date();
                    }
                    if (this._count_down_second <= 0) {
                        this._count_down_start_time = null;
                        this.sender_status = SenderStatus.free;
                        // 这里同步执行了一次set sender_status不能往下执行，否则下面的_sender_status会被覆盖
                        return;
                    } else {
                        // 渲染
                        this._innerEle.innerHTML = this.waiting_next_template_text.replace(
                            /\{s\}/g,
                            this._count_down_second + "",
                        );
                    }

                    this._refresh_ti && cancelAnimationFrame(this._refresh_ti);
                    this._refresh_ti = requestAnimationFrame(() => {
                        this._refresh_ti = null;
                        this.sender_status = this.sender_status;
                    });
                }
                break;
            default:
                return;
        }
        this.buttonEle.setAttribute("vcode-sender-status", SenderStatus[v]);
        this._sender_status = v;
    }
    get sender_status() {
        return this._sender_status;
    }
    constructor(public eleRef: ElementRef) {
        // this.sender;
        // window['vcs'] = this;
    }
    buttonEle: HTMLButtonElement;
    private _buttonEle_click_handle: any;
    private _innerEle: HTMLElement;
    private _initInnerEle() {
        const { buttonEle } = this;
        if (buttonEle.hasAttribute("ion-button")) {
            this._innerEle = buttonEle.querySelector(".button-inner");
        } else {
            this._innerEle = buttonEle;
        }
    }
    ngOnInit() {
        const buttonEle = (this.buttonEle = this.eleRef
            .nativeElement as HTMLButtonElement);
        this._initInnerEle();
        this._buttonEle_click_handle = e => {
            e["waitFor"] = (promise: Promise<any>) => {
                this.sender_status = SenderStatus.sending;
                promise 
                    .then(data => {
                        if (data === ERROR_FROM_ASYNCERROR) {
                            throw data;
                        }
                        this.sender_status = SenderStatus.waitingNext;
                    })
                    .catch(() => {
                        this.sender_status = SenderStatus.free;
                    });
            };
            this.sender.emit(e);
        };
        buttonEle.addEventListener("click", this._buttonEle_click_handle);
        if (this.free_template_text === undefined) {
            this.free_template_text = this._innerEle.innerHTML;
        }
        // 初始化状态
        this.sender_status = SenderStatus.free;
        if (this.auto_send) {
            this.trySendVCode();
        }
    }
    trySendVCode() {
        if (!this.buttonEle || this.buttonEle.disabled) {
            return;
        }
        // this.buttonEle.dispatchEvent(
        this._buttonEle_click_handle(
            new MouseEvent("click", {
                view: window,
                bubbles: false,
                cancelable: false,
            }),
        );
    }
    ngOnChanges(changes: SimpleChanges) {
        if (Object.keys(changes).some(k => k.endsWith("_template_text"))) {
            // 尝试刷新内容
            this.sender_status = this.sender_status;
        }
    }
}
