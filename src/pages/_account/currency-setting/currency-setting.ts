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
  
    changeRiseAndFallColor(type: boolean) {
        if(this.appDataService.risefallColor == type ) return;
        this.appDataService.risefallColor = type;
        this.back();
    }

    back() {
        setTimeout(() => {
            this.navCtrl.pop()
        }, 200);
    }
}
