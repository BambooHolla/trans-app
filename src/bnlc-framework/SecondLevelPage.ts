import { FirstLevelPage } from "./FirsetLevelPage";
import { TabsPage } from "../pages/tabs/tabs";
import { NavController, NavParams } from "ionic-angular";

export class SecondLevelPage extends FirstLevelPage {
    PAGE_LEVEL = 2;
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private _autoHiddenTabs: boolean = true,
        public tabs?: TabsPage,
    ) {
        super(navCtrl, navParams);
    }
    // ionViewWillEnter() {
    //   super.ionViewWillEnter();
    //   if (this._autoHiddenTabs && this.tabs) {
    //     this.tabs.hideTabs(true, this.cname);
    //   }
    // }
    // ionViewDidLeave() {
    //   super.ionViewDidLeave();
    //   if (this._autoHiddenTabs && this.tabs) {
    //     this.tabs.hideTabs(false, this.cname);
    //   }
    // }
    // getNativeTransitionOptions(type: 'push' | 'leave', path?: string, params?: any, opts?: any) {
    //   let res;
    //   if (type === "push") {
    //     res = super.getNativeTransitionOptions(type, path, params, opts);
    //   } else {
    //     const preView = this.navCtrl.getByIndex(this.navCtrl.length() - 2);
    //     console.log("will leave and pop to ", preView);
    //     // if (preView)
    //     res = {
    //       options: {
    //         direction: 'right',
    //         duration: 250,
    //         // slowdownfactor: 3,
    //         // slidePixels: 20,
    //         iosdelay: 10,
    //         androiddelay: 10,
    //         // fixedPixelsTop: 0,
    //         fixedPixelsBottom: 0
    //       },
    //       tranType: 'slide'
    //     }
    //   }
    //   res.fixedPixelsTop = 68;
    //   return res;
    // }
}
