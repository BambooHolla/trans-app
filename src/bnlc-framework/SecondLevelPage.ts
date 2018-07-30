import { FirstLevelPage } from "./FirstLevelPage";
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
// TODO: 是否隐藏tab
//   ionViewWillEnter() {
//     super.ionViewWillEnter();
//     if (this._autoHiddenTabs && this.tabs) {
//       this.tabs.hideTabs(true, this.cname);
//     }
//   }
//   ionViewDidLeave() {
//     super.ionViewDidLeave();
//     if (this._autoHiddenTabs && this.tabs) {
//       this.tabs.hideTabs(false, this.cname);
//     }
//   }
}
