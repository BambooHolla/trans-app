import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AppDataService } from "../../../providers/app-data-service";
import { TradeService } from "../../../providers/trade-service";

@Component({
    selector: "page-currency-setting",
    templateUrl: "currency-setting.html",
})
export class CurrencySettingPage  {

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public appDataService: AppDataService,
        public tradeService: TradeService,
        
    ) {
    }
  
    private _risefallColor_type: string = this.appDataService.risefallColor ? "red" : "green";
    changeRiseAndFallColor(type: string) {
        if(this._risefallColor_type == type ) return void 0;
        this._risefallColor_type = type;
        this.appDataService.risefallColor = this.appDataService.risefallColor ? false : true;
        this.back();
    }

    back() {
        setTimeout(() => {
            this.navCtrl.pop()
        }, 200);
    }
}
