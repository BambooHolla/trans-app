import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AppDataService } from "../../providers/app-data-service";
import { TradeService } from "../../providers/trade-service";

@Component({
    selector: "page-currency-type-list",
    templateUrl: "currency-type-list.html",
})
export class CurrencyTypeListPage  {
    currency_list: any[];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public appDataService: AppDataService,
        public tradeService: TradeService,
        
    ) {
        this.init();
        console.log(this.currency_list)
    }
    init() {
        this.currency_list = [];
        for(let key in this.appDataService.CURRENCYS_TYPE) {
            this.currency_list.push({ 
                name: this.appDataService.CURRENCYS_TYPE[key],
                value: key,
                hidden: this.appDataService.CURRENCY_INFO.type != key,
            })
        }
    }
    ionChange(data: any) {
        if (!data.hidden) return;
        this.tradeService.getCurrencyInof(data.value)
        .then( () => {
            this.init();
        });
        
    }
    
}
