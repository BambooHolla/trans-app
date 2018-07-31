import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { SecondLevelPage } from "../../bnlc-framework/SecondLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
import {
    AccountServiceProvider,
    ProductType,
} from "../../providers/account-service/account-service";
import { PromptControlleService } from "../../providers/prompt-controlle-service";

/**
 * Generated class for the RechargeGatewayPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
    selector: "page-recharge-gateway",
    templateUrl: "recharge-gateway.html",
})
export class RechargeGatewayPage extends SecondLevelPage {
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public accountService: AccountServiceProvider,
    ) {
        super(navCtrl, navParams);
    }
    product_list: any[];

    @RechargeGatewayPage.willEnter
    @asyncCtrlGenerator.loading()
    @asyncCtrlGenerator.error(() =>
        RechargeGatewayPage.getTranslateSync("LOADING_PRODUCT_LIST_FAIL") 
    )
    async getProducts() {
        this.product_list = await this.accountService.productList.getPromise();
    }
}
