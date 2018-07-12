// import { App, ViewController, NavOptions } from 'ionic-angular';
import { App, ViewController } from "ionic-angular";

import { ImageTakerCmp } from "./image-taker-component.ts";

export class ImageTaker extends ViewController {
    private _app: App;

    constructor(app: App, opts: any = {}) {
        super(ImageTakerCmp, opts, null);
        this._app = app;
        this.isOverlay = true;
    }

    present(): Promise<any> {
        // 必须将 animate 指定为 false ，不显示 nav 切换的动画，
        // 否则会执行组件元素无意义的动画，出现一秒多钟的延迟。
        return this._app.present(this, {
            animate: false,
            // enableBackdropDismiss: false,
        });
    }
}
