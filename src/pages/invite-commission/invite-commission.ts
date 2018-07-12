import { Component } from "@angular/core";
import { EntrustServiceProvider } from "../../providers/entrust-service";
import {
    NavParams,
    Refresher,
    InfiniteScroll,
    AlertController,
    ModalController,
} from "ionic-angular";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
import { PersonalDataService } from "../../providers/personal-data-service";
import { InviteCommissionServiceProvider } from "../../providers/invite-commission-service/invite-commission-service";
import { Http, RequestMethod, URLSearchParams } from "@angular/http";
import { AppDataService } from "../../providers/app-data-service";
import { AppSettingProvider } from "../../bnlc-framework/providers/app-setting/app-setting";
import { CustomizeAlert } from "../../modals/customize-alert/customize-alert";
import { AlertService } from "../../providers/alert-service";
import { PromptControlleService } from "../../providers/prompt-controlle-service";
@Component({
    selector: "page-invite-commission",
    templateUrl: "invite-commission.html",
})
export class InviteCommissionPage {
    recommendCounts = "";
    recommender = "";

    ref;
    page = 1;
    pageSize = 10;
    hasMore: boolean = true;
    recharge_address = {
        index: "asdf1234",
    };
    initData(refresher?: Refresher) {
        this.requestRecommendData(); //获取邀请多少人
        this.requestRecommender();
    }

    constructor(
        /*public navCtrl: NavController*/
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public entrustServiceProvider: EntrustServiceProvider,
        public personalDataService: PersonalDataService,
        public commissionService: InviteCommissionServiceProvider,
        public appDataService: AppDataService,
        public setting: AppSettingProvider,
        public modalCtrl: ModalController,
        public alertService: AlertService,
        public promptCtrl: PromptControlleService,
    ) {
        this.initData();
        this.ref =
            this.setting.RECOMMEND_PREFIX +
            this.personalDataService.recommendCode;
    }

    @asyncCtrlGenerator.success("COPY_SUCCESSFULLY")
    @asyncCtrlGenerator.error("COPY_FAIL")
    async copyCode() {
        if (!this.recharge_address.index) {
            throw new Error(
                window["language"]["NO_AVAILABLE_ADDRESS"] || "无可用地址",
            );
        }
        if (!navigator["clipboard"]) {
            throw new Error(
                window["language"]["COPY_PLUGIN_ERROR"] || "复制插件异常",
            );
        }
        navigator["clipboard"].writeText(this.recharge_address.index);
    }

    set() {
        let modal = this.modalCtrl.create(
            CustomizeAlert,
            {
                tip:
                    window["language"]["PLEASE_INPUT_INVITATION_CODE"] ||
                    "请输入邀请码",
            },
            { showBackdrop: true, enableBackdropDismiss: true },
        );
        modal.onDidDismiss(returnData => {
            if (returnData) {
                this.setRecommender(returnData);
            }
        });
        modal.present();
    }
    //获取推荐了多少人
    requestRecommendData(): Promise<any> {
        const customerId = this.appDataService.customerId;
        return this.commissionService
            .getRecommendCount(customerId)
            .then(data => {
                if (!data) {
                    return Promise.reject(new Error("data missing"));
                }
                this.recommendCounts = data["count"][0].count;
            })
            .catch(err => {
                console.log("getCustomersData error: ", err);
            });
    }

    //获取我的推荐人
    requestRecommender(): Promise<any> {
        return this.commissionService
            .getMyRecommender()
            .then(data => {
                if (!data) {
                    return Promise.reject(new Error("data missing"));
                }
                if (data["realName"]) {
                    this.recommender = data["realName"];
                } else if (data["telephone"]) {
                    this.recommender = data["telephone"];
                } else if (data["email"]) {
                    this.recommender = data["email"];
                }
            })
            .catch(err => {
                console.log("getCustomersData error: ", err);
            });
    }

    //设置推荐人
    setRecommender(code): Promise<any> {
        return this.commissionService
            .setInvitationCode(code)
            .then(data => {
                if (!data) {
                    return Promise.reject(new Error("data missing"));
                }
                this.alertService.dismissLoading();
                this.alertService.alertTips(data["message"]);
                this.requestRecommender();
            })
            .catch(err => {
                this.alertService.dismissLoading();
                this.alertService.showAlert(
                    window["language"]["WARNING"] || "警告",
                    err.message ? err.message : err,
                );
                console.log("getCustomersData error: ", err);
            });
    }
}
