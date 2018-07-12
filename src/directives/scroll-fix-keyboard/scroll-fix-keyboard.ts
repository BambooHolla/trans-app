import {
    Directive,
    ElementRef,
    Renderer2,
    Input,
    AfterViewInit,
    OnInit,
    OnDestroy,
} from "@angular/core";
import { Keyboard } from "@ionic-native/keyboard";
import { Content } from "ionic-angular";
import { Subscription } from "rxjs/Subscription";
/**
 * Generated class for the ScrollFixKeyboardDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
    selector: "[scroll-fix-keyboard]", // Attribute selector
})
export class ScrollFixKeyboardDirective implements OnInit, OnDestroy {
    @Input("scroll-fix-keyboard") content: Content;

    constructor(
        private el: ElementRef,
        private keyboard: Keyboard,
        private renderer2: Renderer2,
        public content2: Content,
    ) {}
    private _sub?: Subscription;
    ngOnInit() {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        console.log("Hello ScrollFixKeyboardDirective Directive", this.content);
        this._sub = this.keyboard.onKeyboardShow().subscribe(e => {
            let position_y = (this.el.nativeElement as HTMLElement).offsetTop;
            const scroll_parent = (this.el.nativeElement as HTMLElement)
                .offsetParent;
            // this.content.scrollTo(undefined, position_y, 300)
            this.content2.scrollTo(0, position_y);
        });
    }
    ngOnDestroy() {
        this._sub && this._sub.unsubscribe();
    }
}
