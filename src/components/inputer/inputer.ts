import {
    Component,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy,
} from "@angular/core";

// import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";

@Component({
    selector: "inputer",
    templateUrl: "inputer.html",
})
export class Inputer implements OnInit, OnDestroy {
    @Output() sendMessage = new EventEmitter<string>();

    inputValue: string;

    private sendTermStream = new Subject<string>();
    private streamSubscription: Subscription;

    constructor() {}
    checkInput(event: KeyboardEvent) {
        if (event.keyCode === 13) {
            this.sendMessageReq(this.inputValue);
        }
    }

    sendMessageReq(str: string) {
        this.sendTermStream.next(str);
    }

    sendMessageEmit(str: string) {
        this.sendMessage.emit(str);
    }

    ngOnInit() {
        this.streamSubscription = this.sendTermStream
            .debounceTime(300)
            // .filter(value => value != undefined)
            .map(value => value && value.trim())
            .filter(value => !!value)
            .distinctUntilChanged()
            // .do(value => console.dir(value))
            .subscribe((term: string) => {
                this.sendMessageEmit(term);
                /**
                 * 通过双向绑定清除输入框内容
                 * TODO:根据发送成功后才清除.
                 */
                this.inputValue = "";
            });
    }

    ngOnDestroy() {
        this.streamSubscription.unsubscribe();
    }
}
