import { Component } from "@angular/core";
import {
    IonicPage,
    NavController,
    NavParams,
    Platform,
    ViewController,
} from "ionic-angular";
import {
    AccountType,
    AccountServiceProvider,
    PaymentCategory,
    ProductModel,
    CryptoCurrencyModel,
    DealResult,
} from "../../providers/account-service/account-service";
import { SecondLevelPage } from "../../bnlc-framework/SecondLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
import { AddAddressPage } from "../add-address/add-address";
import { PromptControlleService } from "../../providers/prompt-controlle-service";
/**
 * Generated class for the WithdrawAddressListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: "page-withdraw-address-list",
    templateUrl: "withdraw-address-list.html",
})
export class WithdrawAddressListPage extends SecondLevelPage {
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public accountService: AccountServiceProvider,
        public viewCtrl: ViewController,
        public promptCtrl: PromptControlleService,
    ) {
        super(navCtrl, navParams);
        this.productInfo = this.navParams.get("productInfo");
    }
    formData: { withdraw_address_id: CryptoCurrencyModel["id"] } = {
        withdraw_address_id: undefined,
    };

    navbar_title: string;
    productInfo: ProductModel;
    withdraw_address_list: CryptoCurrencyModel[];

    @WithdrawAddressListPage.willEnter
    initData() {
        this.productInfo = this.navParams.get("productInfo");
        this.withdraw_address_list = this.navParams.get(
            "withdraw_address_list",
        );
        this.formData.withdraw_address_id = this.navParams.get("selected_data");
        this.navbar_title = this.navParams.get("title");

        if (!this.withdraw_address_list) {
            this.navCtrl.removeView(this.viewCtrl);
        }
    }
    is_withdraw_address_list_changed = false;

    finishSelect(send_selected_data?: boolean) {
        this.viewCtrl.dismiss({
            selected_data: send_selected_data
                ? this.withdraw_address_list.find(
                      v => v.id == this.formData.withdraw_address_id,
                  )
                : null,
            withdraw_address_list: this.is_withdraw_address_list_changed
                ? this.withdraw_address_list
                : null,
        });
    }

    deleteWithdrawModel(withdraw_address: CryptoCurrencyModel) {
        this.alertCtrl
            .create({
                title: window["language"]["DELETE_ADDRESS"] || "地址删除",
                message:
                    window["language"]["CONFIRM_TO_DELETE"] || "确定删除吗？",
                buttons: [
                    {
                        text: window["language"]["CANCEL"] || "取消",
                        role: "cancel",
                        handler: () => {
                            // console.log('Cancel clicked')
                        },
                    },
                    {
                        text: window["language"]["CONFIRM"] || "确认",
                        role: "cancel",
                        handler: () => {
                            this.deleteWithdrawAddress(withdraw_address);
                        },
                    },
                ],
            })
            .present();
    }

    @asyncCtrlGenerator.loading()
    @asyncCtrlGenerator.error("@@DELETE_ADDRESS_FAIL") 
    @asyncCtrlGenerator.success("@@DELETE_ADDRESS_SUCCESSFULLY") 
    async deleteWithdrawAddress(withdraw_address: CryptoCurrencyModel) {
        await this.accountService.deleteWithdrawAddress(withdraw_address.id);
        this.is_withdraw_address_list_changed = true;
        this.withdraw_address_list = await this.accountService.getWithdrawAddress(
            this.productInfo.productId,
        ); 
        // 强行重新绑定数据来FIX ionic的ion-radio绑定错乱的BUG
        const _v = this.formData.withdraw_address_id;
        this.formData.withdraw_address_id = null;
        this.platform.raf(() => {
            this.formData.withdraw_address_id = _v;
        });
        return this.withdraw_address_list;
    }

    addWithdrawAddress() {
        // return this.routeTo("add-address", {
        // 	productInfo: this.productInfo,
        // });

        const selector = this.modalCtrl.create(AddAddressPage, {
            productInfo: this.productInfo,
        });
        selector.onDidDismiss(returnData => {
            if (
                !returnData ||
                JSON.stringify(returnData) == "{}" 
            ) {
                return;
            }
            this.formData.withdraw_address_id = returnData.id;
            this.withdraw_address_list.push(returnData ? returnData : {});
        });
        selector.present();
    }
}
