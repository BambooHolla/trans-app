import { Component, ViewChild } from "@angular/core";
import { EntrustServiceProvider } from "../../providers/entrust-service";
import {
    NavParams,
    Refresher,
    InfiniteScroll,
    AlertController,
    Events,
    NavController,
    Slides,
} from "ionic-angular";
import { AppDataService } from "../../providers/app-data-service";
import { PromptControlleService } from "../../providers/prompt-controlle-service";
import { SecondLevelPage } from "../../bnlc-framework/SecondLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
// import * as echarts from 'echarts';
// import { NavController } from 'ionic-angular';
@Component({
    selector: "page-history-record",
    templateUrl: "history-record.html",
})
export class HistoryRecordPage extends SecondLevelPage{
    headerActive:number = 0;
    smoothlinedata: any;
    entrusts: any[];
    entrustsAll: any[];
    entrustsBuy: any[];
    entrustsSale: any[];
    disableSwatchStatus: boolean = false;
    // page = 1;
    pageSize = 10;

    entrusts_type: any[] = [
        {
            type: '全部订单',
            status: '',
            active: 0,
            page: 1,
            entrust: [],
            has_more: true,
        },{
            type: '委托买入',
            status: '001',
            active: 1,
            page: 1,
            entrust: [],
            has_more: true,
        },{
            type: '委托卖出',
            status: '002',
            active: 2,
            page: 1,
            entrust: [],
            has_more: true,
        }
    ]
    
    @HistoryRecordPage.didEnter
    @asyncCtrlGenerator.loading()
    initData() {
        const index = this.headerActive;
        return this.getTypeTradeHistory(this.entrusts_type[index])
        .then( data => {

            this.entrusts_type[index].entrust = data;
            this.entrusts_type[index].has_more = !(this.entrusts_type[index].entrust.length < this.pageSize);
            return data
        })
        .catch( err => {
            this.alertCtrl
                .create({
                    title:
                        window["language"]["GAIN_RECORDS_ERROR"] ||
                        "获取记录出错",
                    subTitle: err ? err.message || "" : err,
                })
                .present();
           this.entrusts_type[index].has_more = false;
           return [];
        })
    }
    // 因为语言结构有很多不同的顺序，现在分开单独处理，以后看能不能弄更优化的办法
    private userLanguage: any = "zh";


    @ViewChild('Slides') slides: Slides;
    slideDidChange($event?) {
        if(this.slides.getActiveIndex() >= this.entrusts_type.length) return ;
        const entrust = this.entrusts_type[this.slides.getActiveIndex()];
        this.headerActive = entrust.active;
        if(entrust.entrust.length === 0) {
            this.initData();
        }
    }
    //用于控制 是否启用下拉刷新
    refresherEnabled: boolean = true;
    refresherSwitch: any;
    slideDrag($event) {
        clearTimeout(this.refresherSwitch);
        this.refresherEnabled = false;
        if ($event) {
            this.refresherSwitch = setTimeout(() => {
                this.refresherEnabled = true;
            }, 100);
        }
    }

    // initData(refresher?: Refresher) {
    //     const smoothlinedata = [];
    //     const N_POINT = 30;
    //     for (let i = 0; i <= N_POINT; i++) {
    //         const x = i / N_POINT;
    //         const y = backInOut(x);
    //         smoothlinedata.push([x, y]);
    //     }
    //     function backInOut(k) {
    //         var s = 1.70158 * 1.525;
    //         if ((k *= 2) < 1) {
    //             return 0.5 * (k * k * ((s + 1) * k - s));
    //         }
    //         return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    //     }
    //     this.smoothlinedata = smoothlinedata;
    //     this.entrusts_type[this.headerActive].page = 1;

    //     this.getTradeHistory() 
    //         .then(data => {
    //             // const data_show = data.filter(item =>
    //             //     Number(item.completeTotalPrice),
    //             // );
    //             this.entrusts_type[this.headerActive].entrust = data;
    //             if (refresher) refresher.complete();
    //             this.hasMore = !(data.length < this.pageSize);
    //         })
    //         .catch(() => {
    //             if (refresher) refresher.complete();
    //             this.hasMore = false;
    //         });

    // }

    refreshData() {
        const getInfoCb = this.navParams.data
            ? this.navParams.data.getInfoCb
            : undefined;
        if (getInfoCb) {
            getInfoCb();
        }
        this.initData();
    }
    
    async getTypeTradeHistory(typeItem) {
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
        return this.entrustServiceProvider
            .getDeliveryList(
                traderId,
                productHouseId,
                priceProductHouseId,
                typeItem.page,
                this.pageSize,
                typeItem.status,
            )
    }
    // @asyncCtrlGenerator.loading()
    async getTradeHistory() {
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
        this.disableSwatchStatus = true;
        // const traderId = this.navParams.data ? this.navParams.data.traderId : undefined;
        // const getInfoCb = this.navParams.data ? this.navParams.data.getInfoCb : undefined;
        return this.entrustServiceProvider
            .getDeliveryList(
                traderId,
                productHouseId,
                priceProductHouseId,
                this.entrusts_type[this.headerActive].page,
                this.pageSize,
                this.entrusts_type[this.headerActive].status,
            )
            .then(data => {
                console.log("getTradeHistory data:", data);
                this.disableSwatchStatus = false;
                return data;
            })
            .catch(err => {
                console.log("getTradeHistory err");
                this.disableSwatchStatus = false; 
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
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public events: Events,
        public appDataService: AppDataService,
        public entrustServiceProvider: EntrustServiceProvider,
        private promptCtrl: PromptControlleService,
    ) {
        super(navCtrl, navParams);
    }

    async loadMoreHistory(infiniteScroll: InfiniteScroll) {
        const index = this.headerActive;
        this.entrusts_type[index].page += 1;
        const tradeHistory = await this.getTradeHistory();

        this.entrusts_type[index].has_more = !(tradeHistory.length < this.pageSize);
        const tradeHistory_show = tradeHistory.filter(item =>
            item.completeTotalPrice
        );
        this.entrusts_type[this,this.headerActive].entrust.push(...tradeHistory_show);
        // console.log('getDeliveryList entrusts:',this.entrusts)
        infiniteScroll.complete();
        infiniteScroll.enable(this.entrusts_type[index].has_more);
    }
    getHistoryStatus(active) {
        if(this.disableSwatchStatus) return;
        this.slides.slideTo(active);
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
                message = `确定要撤回当前委托？`;
                break;
            case "en":
                message = `确定要撤回当前委托？`;
                break;
            default:
                message = `确定要撤回当前委托？`;
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
        const index = this.headerActive;
        this.entrustServiceProvider
            .cancelEntrust(entrustId)
            .then(data => {
                console.log("cancelEntrust data", data);
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
                this.entrusts_type[index].page = 1;
                this.initData();
                if( getInfoCb ) {
                    getInfoCb();
                }
            })
    }
}
