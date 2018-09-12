import { Component, ViewChild } from "@angular/core";
// import * as echarts from 'echarts';
import {
    NavParams,
    AlertController,
    NavController,
    InfiniteScroll,
    Platform,
    Content,
    Events,
    Refresher,
} from "ionic-angular";

import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AppDataService } from "../../providers/app-data-service";
import { SocketioService } from "../../providers/socketio-service";
import { AppSettings } from "../../providers/app-settings";
import { StockDataService } from "../../providers/stock-data-service";
import * as echarts from "echarts";

// 未完成，完成后整理代码格式与调用逻辑
@Component({
    selector: "page-trade-chart-v2",
    templateUrl: "trade-chart-v2.html",
})
export class TradeChartV2Page {
    
    private product: any = "--- / ---";
    private traderId: any;
    private pricePrecision: number = 0;
    public nowTimeArr: any = {};
    public productStatus: boolean = false;
    public quotaArr: Array<object> = [
        {
            title: "MA",
            active: this.appDataService.KlineParameter.MA,
        },
    ];
    public quota: any = {
        title: "MA",
        active: this.appDataService.KlineParameter.MA,
    };
    private timeArray: string[] = [
        window["language"]["1M"] || "1分",
        window["language"]["5M"] || "5分",
        window["language"]["15M"] || "15分",
        window["language"]["30M"] || "30分",
        window["language"]["1H"] || "1小时",
        window["language"]["1D"] || "1天",
        window["language"]["1W"] || "1周",
    ];
    private timeTypeArr: string[] = [
        "1m",
        "5m",
        "15m",
        "30m",
        "1h",
        "1d",
        "1w",
    ];
    public timeType: string = "1m";

    private _baseData$: Observable<any>;
    private _reportsData$: Observable<any> = Observable.of([]);

    private viewDidLeave: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private viewDidLeave$ = this.viewDidLeave
        .asObservable()
        .distinctUntilChanged()
        .filter(value => value === true);

    realtimeOptions = 1;
    _first_time_report: boolean = true;
    @ViewChild("largeRealtimeChart") largeRealtimeChart;

    constructor(
        private navParams: NavParams,
        public appDataService: AppDataService,
        private socketioService: SocketioService,
        public appSettings: AppSettings,
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public stockDataService: StockDataService,
    ) {
        
        this.init(); 
        
    }

    async init() {
        this.traderId = this.navParams.data
            ? this.navParams.data.traderId
            : undefined;
        this.pricePrecision = this.navParams.data ? this.navParams.data.pricePrecision : 8;
        this.productStatus = await this.stockDataService.getProductStatus(this.traderId);
        this.product = this.appDataService.traderList.get(this.traderId);
        const traderId = this.traderId;
        console.log("trade-chart-v2:(doSubscribe) ", traderId);
        if (traderId) {
            const trader = this.appDataService.traderList.get(traderId);
            this._baseData$ = trader.marketRef;
            this.changeTime(this.appDataService.KlineParameter.timeType);
        }
    }

    activeIndex;
    public changeTimeEnable: boolean = true;
    changeTime(index) {
        if (this.activeIndex == index || !this.changeTimeEnable) return;
        this.appDataService.KlineParameter.timeType = index;
        this._first_time_report = true;
        this.activeIndex = index;
        this.changeTimeEnable = false;
        this.timeType = this.timeTypeArr[index];

        this.changeReportType(index);
    }

    showIndex = false;
    onShowIndex() {
        this.showIndex = !this.showIndex;
    }

    changeReportType(index) {
        this._first_time_report = true;
        this._reportsData$ = this.socketioService
            .subscribeRealtimeReports(
                [this.traderId],
                "reportK",
                { timespan: this.timeTypeArr[index] },
                true,
            )
            .do(data => console.log("trade-chart-v2_reportsData: ", data))
            .takeUntil(this.viewDidLeave$)
            .filter(({ type }) => type === this.traderId)
            .map(data => data.data)
            .map(data => {
                //处理增量更新
                const srcArr = [];
                srcArr.push(...data); //使用push+解构赋值,预期echarts动画实现
                const length = srcArr.length;
                if (length > this.appSettings.Charts_Array_Length) {
                    srcArr.splice(
                        0,
                        length - this.appSettings.Charts_Array_Length,
                    );
                }
                if (data.length == 0 && !this.changeTimeEnable) {
                    this.changeTimeEnable = true;
                }
                console.log("trade- chart_reportsData:srcArr:", srcArr);
                return srcArr.concat();
            });
        // this.stockDataService
        // .subscibeRealtimeData(value.traderId, 'chartPrice',undefined,'1m')
        // .subscribe(value.chartRef)//, this.viewDidLeave$)
    }
    ionViewDidLeave() {}
   
    activeQuota(index: number, type: string) {
        if (!this.changeTimeEnable) return;
        this.quotaArr[index]["active"] = this.quotaArr[index]["active"]
            ? false
            : true;
        this.appDataService.KlineParameter[type] = this.quotaArr[index][
            "active"
        ];
        this.quota = Object.assign({}, this.quotaArr[index]);
        this.onShowIndex();
    }
    goExchangePage(index: number = 1) {
        if(!this.productStatus) return;
        this.navCtrl.pop({
            animate: true,
            direction: "back",
            animation: "ios-transition",
        });
        this.appDataService.exchangeType = index;
        this.navCtrl.parent.select(1);
    }
    
}
