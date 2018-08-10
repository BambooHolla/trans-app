import { Component } from "@angular/core";
import { EntrustServiceProvider } from "../../providers/entrust-service";
import {
    NavParams,
    Refresher,
    InfiniteScroll,
    AlertController,
    Events,
} from "ionic-angular";
import { AppDataService } from "../../providers/app-data-service";
import { PromptControlleService } from "../../providers/prompt-controlle-service";
// import * as echarts from 'echarts';
// import { NavController } from 'ionic-angular';

@Component({
    selector: "page-history-record",
    templateUrl: "history-record.html",
})
export class HistoryRecordPage {
    headerActive:number = 1;
    smoothlinedata: any;
    entrusts: any[];

    page = 1;
    pageSize = 10;
    hasMore: boolean = true;

    // 因为语言结构有很多不同的顺序，现在分开单独处理，以后看能不能弄更优化的办法
    private userLanguage: any = "zh";
    initData(refresher?: Refresher) {
        const smoothlinedata = [];
        const N_POINT = 30;
        for (let i = 0; i <= N_POINT; i++) {
            const x = i / N_POINT;
            const y = backInOut(x);
            smoothlinedata.push([x, y]);
        }
        function backInOut(k) {
            var s = 1.70158 * 1.525;
            if ((k *= 2) < 1) {
                return 0.5 * (k * k * ((s + 1) * k - s));
            }
            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        }
        this.smoothlinedata = smoothlinedata;

        this.page = 1;
        this.getTradeHistory() 
            .then(data => {
                // const data_show = data.filter(item =>
                //     Number(item.completeTotalPrice),
                // );
                this.entrusts = data;
                if (refresher) refresher.complete();
                this.hasMore = !(data.length < this.pageSize);
            })
            .catch(() => {
                if (refresher) refresher.complete();
                this.hasMore = false;
            });
    }

    refreshData() {
        const getInfoCb = this.navParams.data
            ? this.navParams.data.getInfoCb
            : undefined;
        if (getInfoCb) {
            getInfoCb();
        }
        this.initData();
    }

    async getTradeHistory(status?) {
        const token = this.appDataService.token;
        const traderId = this.navParams.data
            ? this.navParams.data.traderId
            : undefined;
        const productHouseId =
            false && this.navParams.data
                ? this.navParams.data.productHouseId
                : undefined;
        const priceProductHouseId =
            false && this.navParams.data
                ? this.navParams.data.priceProductHouseId
                : undefined;

        if (!token) {
            return Promise.reject(
                this.events.publish(
                    "show login",
                    "login",
                    this.refreshData.bind(this),
                ),
            ).then(res => {
                let a = res;
            });
        }

        // const traderId = this.navParams.data ? this.navParams.data.traderId : undefined;
        // const getInfoCb = this.navParams.data ? this.navParams.data.getInfoCb : undefined;
        return this.entrustServiceProvider
            .getDeliveryList(
                traderId,
                productHouseId,
                priceProductHouseId,
                this.page,
                this.pageSize,
                status
            )
            .then(data => {
                console.log("getTradeHistory data:", data);
                return data;
            })
            .catch(err => {
                console.log("getTradeHistory err");
                this.alertCtrl
                    .create({
                        title:
                            window["language"]["GAIN_RECORDS_ERROR"] ||
                            "获取记录出错",
                        subTitle: err ? err.message || "" : err,
                    })
                    .present();
                return [];
            });
    }

    constructor(
        /*public navCtrl: NavController*/
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public events: Events,
        public appDataService: AppDataService,
        public entrustServiceProvider: EntrustServiceProvider,
        private promptCtrl: PromptControlleService,
    ) {
        this.initData();
    }

    async loadMoreHistory(infiniteScroll: InfiniteScroll) {
        this.page += 1;
        const tradeHistory = await this.getTradeHistory();
        this.hasMore = !(tradeHistory.length < this.pageSize);
        const tradeHistory_show = tradeHistory.filter(item =>
            Number(item.completeTotalPrice),
        );
        this.entrusts.push(...tradeHistory_show);
        // console.log('getDeliveryList entrusts:',this.entrusts)
        infiniteScroll.complete();
        infiniteScroll.enable(this.hasMore);
    }
    getHistoryStatus(status,active) {
        this.headerActive = active;
        this.getTradeHistory(status).then(data => {
            this.entrusts = data;
            this.hasMore = !(data.length < this.pageSize);
        })
        .catch(() => {
            this.hasMore = false;
        });
    }
    confirmCancel(entrustId, entrustTime, entrustCategory) {
        entrustCategory =
            entrustCategory == "001"
                ? "买入"
                : entrustCategory == "002"
                    ? "卖出"
                    : "";
        entrustTime = new Date(entrustTime);

        entrustTime = `${entrustTime.getFullYear()}-${entrustTime.getMonth() +
            1}-${entrustTime.getDate()}`;
        let message: string = "";
        switch (this.userLanguage) { 
            case "zh":
                message = `确定要撤回${entrustTime}的${entrustCategory}委托单?`;
                break;
            case "en":
                message = `Are you sure to withdraw your ${window["language"][
                    entrustCategory
                ] || ""}order?`;
                break;
            default:
                message = `确定要撤回${entrustTime}的${entrustCategory}委托单?`;
        }
        let alert = this.alertCtrl.create({
            title: window["language"]["REVOKE_DELEGATION"] || "撤回委托",
            message: message,
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
                    handler: () => {
                        this.cancelEntrust(entrustId);
                    },
                },
            ],
        });
        alert.present();
    }

    cancelEntrust(entrustId) {
        this.entrustServiceProvider
            .cancelEntrust(entrustId)
            .then(data => {
                console.log("cancelEntrust data", data);

                this.page = 1;
                if (data && data.status) {
                    this.promptCtrl
                        .toastCtrl({
                            message:
                                window["language"][
                                    "WITHDRAW_ORDER_SUCCESSFULLY"
                                ] || `撤单成功`,
                            duration: 1000,
                            position: "middle",
                        })
                        .present();
                } else {
                    return Promise.reject(data);
                }
            })
            .catch(err => {
                console.log("cancelEntrust err", err);

                this.page = 1;
                this.initData();

                if (err && err.message) {
                    let toast = this.promptCtrl.toastCtrl({
                        message: `${err.message}`,
                        duration: 1000,
                        position: "middle",
                    });
                    toast.present();
                } else {
                    console.log("cancelEntrust err:", err);
                }
            })
            .then( data => {
                const getInfoCb = this.navParams.get('getInfoCb');
                this.initData();
                if( getInfoCb ) {
                    getInfoCb();
                }
            })
    }
}
