import { Injectable, Renderer2 } from "@angular/core";

import { Platform, App, Events } from "ionic-angular";

import { Keyboard } from "@ionic-native/keyboard";

import { AppSettings } from "./app-settings";

@Injectable()
export class KeyboardService {
    renderer2: Renderer2;

    constructor(
        public appCtrl: App,
        public keyboard: Keyboard,
        public platform: Platform,
        public appSettings: AppSettings,
        public events: Events,
    ) {
        this.bindContentHeightHandler();
    }

    // 在 constructor 中注入 Renderer 或 Renderer2 会导致报错：
    // no provider for ...
    // 因此不使用注入，改为由外部组件进行赋值。
    // 此方法必须被调用！
    init(renderer2: Renderer2) {
        this.renderer2 = renderer2;
    }

    private _fullHeight: number = 0;

    public get fullHeight() {
        if (!this._fullHeight) {
            // 有时获取到的高度会不正确！！！特别是 android 设备使用了 immersiveMode 的时候。
            const platformHeight = this.platform.height();

            const appElem = document.querySelector("ion-app");
            const computedHeight = parseFloat(
                window.getComputedStyle(appElem).height,
            );
            this._fullHeight = Math.max(platformHeight, computedHeight);
            console.log(
                "platform.height():",
                platformHeight,
                "computedHeight: ",
                computedHeight,
                platformHeight === computedHeight,
            );
        }

        return this._fullHeight;
    }

    bindContentHeightHandler() {
        // 由于 keyboard 是单例的，
        // 因此键盘事件的触发处理可以写在任意位置,
        // 但为了避免处理函数的重复绑定，因此统一写在这个服务里。
        this.keyboard.onKeyboardShow().subscribe(e => {
            const keyboardHeight =
                e.keyboardHeight || (e.detail && e.detail.keyboardHeight);
            this.toggleContentHeight(true, keyboardHeight);
            this.events.publish('hideTabs')
        });

        this.keyboard.onKeyboardHide().subscribe(e => {
            this.toggleContentHeight(false, 0);
            this.events.publish('showTabs')
        });
    }

    disableScroll() {
        // 禁止输入框获得焦点时页面自动滚动（ ios 、 windows 有效）。
        // 必须在 platform ready 之后调用此方法，才会起效！
        // 注意外部调用此方法的时机。
        this.keyboard.disableScroll(true);
    }

    // 软键盘弹出时处理 tabbar 、 scroll-content 与 ion-footer 的高度与定位问题。
    // 但是如果修改了 MainActivity.java ，设置了全屏模式，
    // 键盘弹出、收起时页面高度就不会变化，
    // 因此需要在软键盘弹出时对页面高度进行调整。
    toggleContentHeight(keyboardShow: boolean, keyboardHeight: number) {
        const renderer2 = this.renderer2;
        if (!renderer2) {
            return;
        }

        const rootComponent = document.querySelector(
            "ion-app > ng-component",
        ) as HTMLElement;
        if (!rootComponent) {
            return;
        }

        const rootHeight = keyboardHeight
            ? this.fullHeight - keyboardHeight + "px"
            : "100%";
        renderer2.setStyle(rootComponent, "height", rootHeight);
    }
}
