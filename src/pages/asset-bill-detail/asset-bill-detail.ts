import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Refresher } from "ionic-angular";
import { SecondLevelPage } from "../../bnlc-framework/SecondLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
import {
    AccountServiceProvider,
    ProductType,
} from "../../providers/account-service/account-service";
import { PromptControlleService } from "../../providers/prompt-controlle-service";
import { AppDataService } from "../../providers/app-data-service";
import { StockDataService } from "../../providers/stock-data-service";
/**
 * Generated class for the RechargeGatewayPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
    selector: "page-asset-bill-detail",
    templateUrl: "asset-bill-detail.html",
})
export class AssetBillDetailPage extends SecondLevelPage {
    public productInfo: any;
    public personalData: any;
    product_list: any[];
    showNoRecord: boolean = false;
    static _hide_loading:boolean = false;
    // 法币单位符号
    private unit = this.appDataService.CURRENCY_INFO.currencyTo || "--";
    
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public accountService: AccountServiceProvider,
        public appDataService: AppDataService,
        public stockDataService: StockDataService,
    ) {
        super(navCtrl, navParams);
        this.productInfo = this.navParams.get("productInfo");
        this.personalData = this.navParams.get("personalData");
       
    }


    refreshPersonalData(refresher?: Refresher) {
        refresher&&refresher.complete()
        return this.getBillList();
    }

    @AssetBillDetailPage.willEnter
    @asyncCtrlGenerator.loading()
    @asyncCtrlGenerator.error("@@ERROR") 
    getBillList(){
        return this.accountService.getBillDetailList(this.productInfo.productHouseId).then(async data => {
            this.product_list = await Promise.all(data.map( async ({
                productHouseId,
                transAmount,
                transDate,
                transTargetProductHouseId,
                transType,
            }) => {
                return {
                    productHouseId,
                    transAmount,
                    transDate,
                    transTargetProduct: await this.stockDataService.getProduct(transTargetProductHouseId),
                    transType,
                }
            }));
        }).catch(err => {
            this.product_list = [];
        }).then( () => {
            this.showNoRecord = true;
        })
    }

    goPage(path: string) {
        return this.stockDataService.productById(this.productInfo.productHouseId).then( data => {
            this.routeTo(path,{productInfo:data[0]})
        })
    }
}
