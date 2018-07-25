import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { SecondLevelPage } from "../../bnlc-framework/SecondLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
import {
    AccountServiceProvider,
    PaymentCategory,
} from "../../providers/account-service/account-service";

@Component({
    selector: "page-currency-type-list",
    templateUrl: "currency-type-list.html",
})
export class CurrencyTypeListPage extends SecondLevelPage {
    currency_list: any[];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public accountService: AccountServiceProvider,
    ) {
        super(navCtrl, navParams);
        
    }
    @CurrencyTypeListPage.willEnter
    @asyncCtrlGenerator.loading()
    @asyncCtrlGenerator.error("LOAD_PRODUCT_LIST_ERROR")
    async getProducts() {
        this.currency_list = await this.accountService.productList.getPromise();
    }
}
