import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams, Refresher, InfiniteScroll } from "ionic-angular";
import { SecondLevelPage } from "../../bnlc-framework/SecondLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
import {
    AccountServiceProvider,
    ProductType,
    AccountType,
} from "../../providers/account-service/account-service";
import { PromptControlleService } from "../../providers/prompt-controlle-service";
import { AppDataService } from "../../providers/app-data-service";
import { StockDataService } from "../../providers/stock-data-service";
import { TipSelectPoint } from "../gesture-lock/gesture-lock";
import { defineLocale } from "moment";
import { BigNumber } from "bignumber.js";
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
    public hasMore: boolean = false;
    public bill_logs_page_info = {
        has_more : true,
        page: 1,
        page_size: 10,
    }
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
        refresher && refresher.complete()
        const { bill_logs_page_info } = this;
        bill_logs_page_info.page = 1;
        return this.initDate();
    }

    @AssetBillDetailPage.willEnter
    @asyncCtrlGenerator.loading()
    @asyncCtrlGenerator.error("@@ERROR") 
    initDate() {
        this.getAccountProduct();
        return this.getBillList().then( (data) => {
            const { bill_logs_page_info } = this;
            console.log(data)
            this.product_list = data;
            this.showNoRecord = true;
        });
    }
    
    getAccountProduct() {
        return this.accountService.getAccountProduct({
            productHouseId: this.productInfo.productHouseId,
            accountType: AccountType.Product,
        }).then(data => {
            this.personalData.availableAmount =  data.balance;
            this.personalData.freezeQuantity =  data.freezeBalance;
            this.personalData.restQuantity = (new BigNumber(data.balance)).plus(data.freezeBalance).toString();
            this.personalData.totalPrice = (new BigNumber(this.personalData.restQuantity)).times(this.personalData.currentPrice).toString();
            
        })
    }
    getBillList() { 
        const { bill_logs_page_info } = this;
        return this.accountService.getBillDetailList(
            this.productInfo.productHouseId,
            bill_logs_page_info.page,
            bill_logs_page_info.page_size,
        ).then(async data => {
            const _product_list = await Promise.all(data.map( async ({
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
            bill_logs_page_info.has_more = data.length === bill_logs_page_info.page_size;
            return _product_list;
        }).catch(err => {
            
            return [];
        })
    }

    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    async loadMoreBills(scrollCtrl?: InfiniteScroll) {
        const { bill_logs_page_info } = this;
        try {
            bill_logs_page_info.page += 1;
            const _product_list = await this.getBillList();
            this.product_list.push(..._product_list);
        } catch(err) {
            console.log('load more bills :',err)
        } finally {
            scrollCtrl.complete();
        }

    }

    goPage(path: string) {
        return this.stockDataService.productById(this.productInfo.productHouseId).then( data => {
            this.routeTo(path,{productInfo:data[0]})
        })
    }
}
