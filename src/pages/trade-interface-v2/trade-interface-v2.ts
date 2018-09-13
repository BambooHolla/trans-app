import { Component, ViewChild, ElementRef } from "@angular/core";
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
    ModalController,
    Modal,
    ActionSheetController,
} from "ionic-angular";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { AppSettings } from "../../providers/app-settings";
import { StockDataService } from "../../providers/stock-data-service";
import { PersonalDataService } from "../../providers/personal-data-service";
import { TradeService } from "../../providers/trade-service";
import { AppDataService } from "../../providers/app-data-service";
import { AlertService } from "../../providers/alert-service";
import { SocketioService } from "../../providers/socketio-service";
import { EntrustServiceProvider } from "../../providers/entrust-service";
import { HistoryRecordPage } from "../history-record/history-record";
import { StatusBar } from "@ionic-native/status-bar";
import { AndroidFullScreen } from "@ionic-native/android-full-screen";
import { AppSettingProvider } from "../../bnlc-framework/providers/app-setting/app-setting";

import { PromptControlleService } from "../../providers/prompt-controlle-service";
import { LoginService } from "../../providers/login-service";
import { BigNumber } from "bignumber.js";

import { TradeChartV2Page } from "../trade-chart-v2/trade-chart-v2";
import { AccountServiceProvider } from "../../providers/account-service/account-service";
import { SelectTradesPage } from "../select-trades/select-trades";
@Component({
    selector: "page-trade-interface-v2",
    templateUrl: "trade-interface-v2.html",
})
export class TradeInterfaceV2Page {
    tradeChart = TradeChartV2Page;
    // 拉动条 左边圆形颜色
    rangeLeftRound: boolean = false;
    // 拉动条数值
    rangeValue: number = 0;
    // 交易额
    tradeValue: string | number = ''
    // 因为语言结构有很多不同的顺序，现在分开单独处理，以后看能不能弄更优化的办法
    private userLanguage: any = "zh";
    // 数字过长，跳转大小
    public size_1rem: boolean = false;
    // 数量、价格小数位
    public amountPrecision: number = 8;
    public pricePrecision: number = 8;
   
    quickTrading: boolean = false;
    trading: boolean = false;
    marketPrice: any;
    currencyPrice:any = '--';
    _currencyPrice:any = undefined;
    // tradeType:number = 1 //1是买,0是卖
    @ViewChild(Content) content: Content;
    inputProductName:any;
    private viewDidLeave: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private viewDidLeave$ = this.viewDidLeave
        .asObservable()
        .distinctUntilChanged()
        .filter(value => value === true);
    private tradeType: number = this.appDataService.exchangeType
        ? 1
        : this.appDataService.exchangeType == 0
            ? 0
            : 1;
    private _tradeType$: BehaviorSubject<number> = new BehaviorSubject(
        this.appDataService.exchangeType
            ? 1
            : this.appDataService.exchangeType == 0
                ? 0
                : 1,
    );
    public tradeType$: Observable<number> = this._tradeType$
        .asObservable()
        .do(type => {
            let rateSrc;
            this.targetName = this.productName;
            if (type === 0) {
                rateSrc = this.sellRate;
                this.inputProductName = this.productName;
            } else if (type === 1) {
                rateSrc = this.buyRate;
                this.inputProductName = this.priceName;
            }

            this.getFee(rateSrc).then(data => (this.fee = data));
        });

    private hiddentext = "";
    private traderList = [];
    private priceName: string;
    private productName: string;
    private targetName: string;
    //traderId可以做成subject, 用setter 和getter改变 作为源头触发其他改动.
    private traderId: string = this.appSettings.SIM_DATA ? "000001" : undefined;
    // 交易对
    private productPair: string = undefined;
    private productHouseId: string = undefined;
    private priceProductHouseId: string = undefined;

    private reportArr = [];
    private candlestickArr = [];
    private entrusts = [];

    private trader_target;
    private trader_product;

    private holePrice: any = "0";

    page = 1;
    pageSize = 20;
    hasMore: boolean = false;
    public productStatus: boolean = false;
    private _cards = {
        满仓: 1,
        "1/2仓": 1 / 2,
        "1/3仓": 1 / 3,
        "1/4仓": 1 / 4,
    };
    private cards: string[] = Object.keys(this._cards);
    private buySaleActiveIndex: BehaviorSubject<number> = new BehaviorSubject(
        0,
    );
    private quickTradeSelector = this.buySaleActiveIndex
        .asObservable()
        .takeUntil(this.viewDidLeave$)
        .distinctUntilChanged()
        .do(index => {
            this.getQuickTradeData();
        });

    private buyRate;
    private sellRate;
    private fee;

    private buyTotalAmount: any = "--";
    private buyTotalQuantity: any = "0";
    private saleTotalAmount: any = "--";
    private saleTotalQuantity: any = "0";

    private _saleableQuantity$: Observable<number>;

    private _baseData$: Observable<any>;
    private _depth$: Observable<any>;
    private _depthSource$: Observable<any>;
    private _depthSource: any;
    public buy_depth: AnyObject[] = [];
    public buy_depth_2: AnyObject[] = [];
    public sale_depth: AnyObject[] = [];
    public sale_depth_2: AnyObject[] = [];
    public buyer = [
        window["language"]["BUY_1"] || "买1",
        window["language"]["BUY_2"] || "买2",
        window["language"]["BUY_3"] || "买3",
        window["language"]["BUY_4"] || "买4",
        window["language"]["BUY_5"] || "买5",
    ];
    public buyer_2 = [
        window["language"]["BUY_5"] || "买5",
        window["language"]["BUY_4"] || "买4",
        window["language"]["BUY_3"] || "买3",
        window["language"]["BUY_2"] || "买2",
        window["language"]["BUY_1"] || "买1",
    ];
    public saler = [
        window["language"]["SELL_1"] || "卖1",
        window["language"]["SELL_2"] || "卖2",
        window["language"]["SELL_3"] || "卖3",
        window["language"]["SELL_4"] || "卖4",
        window["language"]["SELL_5"] || "卖5",
    ];

    private _realtimeData$: Observable<any> = Observable.of([]);
    // private _candlestickData$: Observable<any> = Observable.of([])

    private isPortrait: boolean = true;
    private activeIndex: number = 0;

    private timeArray: string[] = ["分时", "5分", "30分", "1小时"];

    private betsHidden: boolean = false;
    @ViewChild("largeRealtimeChart") largeRealtimeChart;

    private kDataUnit: string = "";
    private candlestickOptions = {
        customTooltip: true,
        candlestickcalculateList: [
            [5, "rgba(254, 53, 53, .6)"],
            [10, "purple"],
            [20, "blue"],
            [30, "green"],
        ],
        yAxisLabel: {
            inside: true,
            showMinLabel: false,
            showMaxLabel: false,
            textStyle: {
                fontSize: 10,
                color: "#fff",
            },
        },
        ySplitLine: {
            show: false,
        },
        // ySplitNumber:4,
        yAxisShow: false,
    };

    // liquiddata:any;

    _price: BehaviorSubject<string> = new BehaviorSubject(undefined);
    set price(str) {
        this._price.next(str);
        this.checkMax(str);
    }
    get price() {
        return this._price.getValue();
    }
    amount: string = this._numberFormatAdd0('0',false);
    maxAmount: string | number;
    holdAmount: string | number;
    range = 0;
    oneRange = 0;
    tenRange = 0;
    hundredRange = 0;
    oneRange_buy_old = 0;
    oneRange_sale_old = 0;
    tenRange_buy_old = 0;
    tenRange_sale_old = 0;
    hundredRange_buy_old = 0;
    hundredRange_sale_old = 0;

    // @ViewChild('quantityRange') Range: any;
    @ViewChild("oneQuantityRange") oneQuantity: any;
    @ViewChild("tenQuantityRange") tenQuantity: any;
    @ViewChild("hundredQuantityRange") hundredQuantity: any;

    @ViewChild("priceInputer") PriceInputer: any;
    @ViewChild("amountInputer") AmountInputer: any;
    @ViewChild("priceInputer2") PriceInputer2: any;
    @ViewChild("amountInputer2") AmountInputer2: any;
    inputGroup = {
        price: "PriceInputer",
        amount: "AmountInputer",
    };
    inputGroup_2 = {
        price: "PriceInputer2",
        amount: "AmountInputer2",
    };
    inputGroupPrecision = {
        price: "pricePrecision",
        amount: "amountPrecision",
    }
    handBase = 0.01;

    realtimeOptions = {
        xAxisShow: true,
        axisLabelShow: false,
        yAxisStyle: {
            color: "rgba(255, 255, 255, 0.2)",
            type: "dashed",
        },
        textColor: "rgba(255, 255, 255, 1)",
    };

    //初始化数据,尽量保证不包含异步操作
    async initData() {
        console.log("trade-interface-v2");

        const traderList = [];
        (await this.appDataService.traderListPromise).forEach(
            (value, key, map) => {
                traderList[value.index] = value;
            },
        );
        this.traderList = traderList;
        await this._getRequestCertifiedStatus();
    }

    backInOut(k) {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) {
            return 0.5 * (k * k * ((s + 1) * k - s));
        }
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }

    constructor(
        public navCtrl: NavController,
        private alertCtrl: AlertController,
        public appSettings: AppSettings,
        public appDataService: AppDataService,
        private socketioService: SocketioService,
        private stockDataService: StockDataService,
        private navParams: NavParams,
        public personalDataService: PersonalDataService,
        public tradeService: TradeService,
        public alertService: AlertService,
        public entrustServiceProvider: EntrustServiceProvider,
        public appSetting: AppSettingProvider,
        public platform: Platform,
        public statusBar: StatusBar,
        public androidFullScreen: AndroidFullScreen,
        private events: Events,
        private promptCtrl: PromptControlleService,
        private loginService: LoginService,
        private accountServiceProvider: AccountServiceProvider,
        private el: ElementRef,
        private modalCtrl: ModalController,
        private actionsheetCtrl: ActionSheetController,
    ) {
        
        BigNumber.config({ EXPONENTIAL_AT: [-8, 20] });
        this.userLanguage = this.appDataService.LANGUAGE || "zh";
        //交易对
        this.appDataService.LAST_TRADER$.subscribe(trader => {
            if (trader) this.initTrader(trader);
        });  
        //用户数据
        this.loginService.status$.subscribe( status => {
            if(status) { 
                this.gotoHistoryLogin()
            } else {
                this.trader_product = {};
                this.trader_target = {};
                this.personalAssets = {};
            }
        });
        //法币更改
        this.appDataService.CHAGE_CURRENCY$.subscribe( data => {
            if(data && data.status && this._currencyPrice) {
                this.currencyPrice = !this.appDataService.CURRENCY_INFO.exchange?'--':this._currencyPrice.times(this.appDataService.CURRENCY_INFO.exchange).toString()
            }
        })
    }

    async initTrader(trader) {
        // window['TradeInterfacePage'] = this
        this.traderId = trader.traderId;
        this.productHouseId = trader.productHouseId || "";
        this.priceProductHouseId = trader.priceProductHouseId || "";

        this.productPair =
            this.priceProductHouseId && this.productHouseId
                ? this.priceProductHouseId + "-" + this.productHouseId
                : undefined;
        // if (!this.traderId) this.appDataService.products.forEach((value, key, map) => {
        //   this.traderId = key;
        //   return;
        // })
        const traderId = this.traderId;
        this.amountPrecision = trader.numberPrecision >= 0 ? trader.numberPrecision : 8;
        this.pricePrecision = trader.pricePrecision >= 0 ? trader.pricePrecision : 8;
        
        if (traderId) {
            console.log("trade-interface-v2:(constructor)", traderId);
            this.amount = this._numberFormatAdd0('0',false);
            this.productStatus = await this.stockDataService.getProductStatus(this.traderId);
            
            this._saleableQuantity$ = this.personalDataService.personalStockList$
                .map(arr => arr.filter(item => item.stockCode === traderId))
                .map(arr => (arr.length && +arr[0].saleableQuantity) || 0)
                .distinctUntilChanged();
            this.initData();
            this.getProcessEntrusts();
            this.doSubscribe();
            this.requestAssets();
            this.quickTradeSelector.subscribe();
        }
    }

    toggleVisible($event) {
        if (this.appDataService.hiddentext) {
            this.appDataService.hiddentext = "";
        } else {
            this.appDataService.hiddentext = "******";
        }
    }

    changeByStep(
        target: string,
        sign: string = "+",
        step?: any,
        precision: number = -8,
    ) {
        // const invBase = Math.pow(10, -precision);
        // 浮点数四则运算存在精度误差问题.尽量用整数运算
        // 例如 602 * 0.01 = 6.0200000000000005 ，
        // 改用 602 / 100 就可以得到正确结果。
        let length = 0;

        if (isNaN(step)) {
            // 旧要求，每次加最后一位
            // this[target] = this[target] == ''? '0' : this[target];
            // length = this[target].split('.')[1] ? this[target].split('.')[1].length : length
            // step = Math.pow(10, -length)
            // step = sign + step

            // 新要求
            if (target == "amount") {
                step = sign + Math.pow(10, -this.amountPrecision);
            } else if (target == "price") {
                step = sign +  Math.pow(10, -this.pricePrecision);
            }
        }

        //原来的方法遇到 “0.0048” *10^8,会丢失精度
        // const result = Math.max(0, Math.floor(+this[target] * invBase + step * invBase) / invBase);
        //新方法,区分价格跟数量,价格用新的，数量用旧方法
        // '11.12' -> ['11','12'] -> (11 * 10^8 * 10^(arr[1].length) + 12 * 10^8 ) / 10^8
        let result: any;

        if (step == 0) {
            // input输入
            if(this[target] == "" ) {
                if(this.appDataService.trade_type) {
                    this[this.inputGroup[target]].value = this[target];
                } else {
                    this[this.inputGroup_2[target]].value = this[target];
                }
                return ;
            }
            result =  this[target];
        } else {
            // ‘+、-’按钮
            this[target] = this[target] == "" ? "0" : this[target];
            result =
                new BigNumber(this[target]).plus(step).toNumber() < 0
                    ? "0"
                    : new BigNumber(this[target]).plus(step).toString();
        }
        result = this.numberFormat(result,false,true,this[this.inputGroupPrecision[target]]); 
        result = step == 0 && result || this._numberFormatAdd0(result,target === "price");
        // if(typeof this[target] == "string" ){
        //   result = this[target].split('.');
        //   if(result.length == 2){
        //     result = Math.max(0, Math.floor(result[0] * invBase *  Math.pow(10,result[1].length) + result[1] * invBase + step * invBase * Math.pow(10,result[1].length)) / (invBase * Math.pow(10,result[1].length)));
        //   }else{
        //     result = Math.max(0, Math.floor(result[0] * invBase + step * invBase) / invBase);
        //   }
        // } else {
        //   result = Math.max(0, Math.floor(+this[target] * invBase + step * invBase) / invBase);
        // }

        this[target] = result;
        if(this.appDataService.trade_type) {
            this[this.inputGroup[target]].value = this[target];
        } else {
            this[this.inputGroup_2[target]].value = this[target];
        }
        //强制刷新数据hack处理
        this.platform.raf(() => {
            this[target] = result;
        });
    }

    checkMax(price = this.price) {
        const productPairs = this.productPair.split("-");
        // console.log(
        //     "checkMax",
        //     this.personalDataService.personalStockList,
        //     " & ",
        //     productPairs,
        // );
        const personalStockList = this.personalDataService.personalStockList;
        if (this._tradeType$.getValue() === 1) {
            //可用资金/价格

            const target = personalStockList.filter(
                ({ stockCode }) => stockCode === productPairs[0],
            );

            // 旧方法使用Number计算，会导致计算数据出错
            // let saleableQuantity:any = (target && target.length != 0 ? target : [{ saleableQuantity:0}])[0]
            //   .saleableQuantity / this.appSettings.Product_Price_Rate;
            let saleableQuantity: any = new BigNumber(
                (target && target.length != 0
                    ? target
                    : [{ saleableQuantity: 0 }])[0].saleableQuantity,
            );
            this.maxAmount = Number(price)
                ? this.numberFormat(
                      saleableQuantity.div(price).toString(),
                      false,
                      false,
                  )
                : "0";
            if (this.maxAmount == "0") {
                this.maxAmount = 0;
            }
            if (!this.appSetting.getUserToken()) {
                this.maxAmount = "--";
            }
        } else if (this._tradeType$.getValue() === 0) {
            //最大持仓

            const target = personalStockList.filter(
                ({ stockCode }) => stockCode === productPairs[1],
            );
            console.log(target);
            let saleableQuantity: any = new BigNumber(
                (target && target.length != 0
                    ? target
                    : [{ saleableQuantity: 0 }])[0].saleableQuantity.toString(),
            );
            this.holdAmount = Number(price)
                ? this.numberFormat(saleableQuantity.toString(), false, false)
                : "0";
            if (this.holdAmount == "0") {
                this.holdAmount = 0;
            }
            if (!this.appSetting.getUserToken()) {
                this.holdAmount = "--";
            }
            // if(this.maxAmount == "0"){
            //   this.maxAmount = 0;
            // }
        } else {
        }
    }

    formatNumber(target: string, precision?: number) {
        this.changeByStep(target, undefined, 0, precision); 
        this.calculationAmount();
    }
    calculationAmount() {
        // if(this._tradeType$.getValue()) {
        //     this.tradeValue = this.price && this.amount ? this.numberFormat((new BigNumber(this.amount)).times(this.price).toString()) : '--';
        // } else {
        //     this.tradeValue = this.amount ? this.amount : '--';
        // }
        this.tradeValue = this.price && this.amount ? this.numberFormat((new BigNumber(this.amount)).times(this.price).toString()) : '';
        // if(this.tradeValue) this.tradeValue = this.tradeValue + " " + this.priceName;
    }
    setPrice(price = this.price) {
        if (!price) {
            price = "0";
        }
        this.price = this._numberFormatAdd0(price);
        this.formatNumber("price");
    }

    /**
     * 切换限价买卖类型
     *
     * @param $event 鼠标点击事件，本页面做切换使用
     * @param index k线图页面返回使用
     */
    chooseTradeType($event?: MouseEvent, index: number = undefined) {
        let dataset: any;
        if ($event) {
            dataset = ($event.target as HTMLElement).dataset
                ? Number(($event.target as HTMLElement).dataset.tradeType)
                : 1;
        } else {
            dataset = index == undefined ? 1 : index;
        }
        this._tradeType$.next(dataset);
        this.appDataService.exchangeType = dataset;
        if (dataset) {
            const _price = this.buy_depth[0]
                ? this.numberFormatDelete0(this.buy_depth[0].price)
                : this.marketPrice
                    ? this.numberFormatDelete0(this.marketPrice)
                    : "0";
            this.price = this._numberFormatAdd0(_price)
        } else {
            const _price = this.sale_depth[0]
                ? this.numberFormatDelete0(this.sale_depth[0].price)
                : this.marketPrice
                    ? this.numberFormatDelete0(this.marketPrice)
                    : "0";
            this.price = this._numberFormatAdd0(_price)
        }
        this.rangeValue = 0;
        this.amount = this._numberFormatAdd0(0,false);
        this.tradeValue = '';
        this.checkMax();
    }

    async getFee(rate) {
        if (!rate) return "";
        // const rate = this.buyRate
        // const traders = this.traderId
        let rateTarget: any;
        if (rate.tragetType) {
            rateTarget = await this.stockDataService.getProduct(
                rate.tragetType,
            );
        }

        const rateStr = rate
            ? rate.calculateType === "001"
                ? `${rate.rate * 100}%${
                      rateTarget ? rateTarget.productName : ""
                  }`
                : rate.calculateType === "002"
                    ? `${rate.rate +
                          (rateTarget ? rateTarget.productName : "")}`
                    : void 0
            : void 0;

        // const sellRate = this.sellRate
        // const sellrateTarget = sellRate.targetType === '001' ? await this.stockDataService.getProduct(traders[1]) :
        //   sellRate.targetType === '002' ? await this.stockDataService.getProduct(traders[0]) : void 0
        // const sellRateStr = sellRate ?
        //   sellRate.calculateType === '001' ? `${sellRate.rate * 100}%` :
        //     sellRate.calculateType === '002' ? `${sellRate.rate + sellrateTarget}` : void 0
        //   : void 0
        return rateStr;

        // const toast = this.toastCtrl.create({
        //   message: `买入费率:${buyRateStr}  卖出费率:${sellRateStr}`,
        //   duration: 3000,
        //   position: 'middle'
        // })
        // toast.present()
    }

    async doTrade(tradeType: number = this._tradeType$.getValue()) {
        this.productStatus = await this.stockDataService.getProductStatus(this.traderId)
        if(!this.productStatus) return;
        if (!(this.personalDataService.certifiedStatus == "2")) {
            await this.personalDataService.requestCertifiedStatus();
        }
        if (!(this.personalDataService.certifiedStatus == "2")) {
            return this.validateIdentify();
        }
        if (this.trading) {
            return void 0;
        }

        // 界面按钮已根据是否 可买/可卖 进行了限制，
        // 此处没有再进行判断。

        // const amount =new BigNumber(this.amount);

        // let tradeText = tradeType === 1 ? '买入':
        //                 tradeType === 0 ? '卖出': '委托'
        let tradeText: string = "";
        if (tradeType === 1) {
            switch (this.userLanguage) {
                case "zh":
                    tradeText = "买入";
                    break;

                case "en":
                    tradeText = "buy";
                    break;
                case "ja":
                    tradeText = "buy";
                    break;
                default:
                    tradeText = "購入";
            }
        } else if (tradeType === 0) {
            switch (this.userLanguage) {
                case "zh":
                    tradeText = "卖出";
                    break;

                case "en":
                    tradeText = "sell";
                    break;
                case "ja":
                    tradeText = "販売";
                    break;

                default:
                    tradeText = "卖出";
            }
        } else {
            switch (this.userLanguage) {
                case "zh":
                    tradeText = "委托";
                    break;

                case "en":
                    tradeText = "delegate";
                    break;

                default:
                    tradeText = "委託";
            }
        }

        let show_warning = true;
        let toast = this.promptCtrl.toastCtrl({
            duration: 1000,
            position: "middle",
        });

        //获取价格，总数数据
        let price: BigNumber;
        let amount: BigNumber;
        let isNaNData = {
            price: false,
            amount: false,
        };

        //捕捉错误，如果bigNumber转化不了就是不是数字类型
        try {
            price = new BigNumber(this.price);
        } catch (e) {
            if (
                e instanceof Error &&
                e.message.indexOf("[BigNumber Error]") === 0
            ) {
                isNaNData.price = true;
            }
        }

        try {
            amount = new BigNumber(this.amount);
        } catch (e) {
            if (
                e instanceof Error &&
                e.message.indexOf("[BigNumber Error]") === 0
            ) {
                isNaNData.amount = true;
            }
        }

        if (isNaNData.price || price.comparedTo(0) != 1) {
            // toast.setMessage(`请输入正确的${tradeText}价格`)
            switch (this.userLanguage) {
                case "zh":
                    toast.setMessage(`请输入正确的${tradeText}价格`);
                    break;
                case "en":
                    toast.setMessage(`Please input correct ${tradeText} price`);
                    break;
                case "ja":
                    toast.setMessage(`正しい${tradeText}価格を入力して下さい`);
                    break;
                default:
                    toast.setMessage(`请输入正确的${tradeText}价格`);
            }
        } else if (isNaNData.amount || amount.comparedTo(0) != 1) {
            // toast.setMessage(`请输入正确的${tradeText}数量`)
            switch (this.userLanguage) {
                case "zh":
                    toast.setMessage(`请输入正确的${tradeText}数量`);
                    break;
                case "en":
                    toast.setMessage(`Please input correct ${tradeText} price`);
                    break;
                case "ja":
                    toast.setMessage(`正しい${tradeText}数量を入力して下さい`);
                    break;
                default:
                    toast.setMessage(
                        `Please input correct ${tradeText} quantity`,
                    );
            }
        } else if (
            amount.comparedTo(
                tradeType == 1 ? this.maxAmount : this.holdAmount,
            ) == 1
        ) {
            // toast.setMessage(`${tradeText}数量超过可${tradeText}上限`)

            switch (this.userLanguage) {
                case "zh":
                    toast.setMessage(`${tradeText}数量超过可${tradeText}上限`);
                    break;
                case "ja":
                    toast.setMessage(
                        `${tradeText}可能数量が${tradeText}可能数量の上限を越えています`,
                    );
                    break;
                case "en":
                    toast.setMessage(
                        `${tradeText} quantity is beyond ${tradeText} ceiling`,
                    );
                    break;
                default:
                    toast.setMessage(`${tradeText}数量超过可${tradeText}上限`);
            }
        } else {
            show_warning = false;
        }

        if (show_warning) {
            toast.present();
            return false;
        }

        console.log(
            "doTrade:",
            this.traderId,
            " | ",
            tradeType,
            " | ",
            amount,
            " | ",
            price,
        );

        // let thanText = tradeType === 1 ? '高于' :
        //                tradeType === 0 ? '低于' : '超出'

        let thanText: string = "";
        if (tradeType === 1) {
            switch (this.userLanguage) {
                case "zh":
                    thanText = "高于";
                    break;

                case "en":
                    thanText = "higher";
                    break;
                case "ja":
                    thanText = "より高い";
                    break;
                default:
                    thanText = "高于";
            }
        } else if (tradeType === 0) {
            switch (this.userLanguage) {
                case "zh":
                    thanText = "低于";
                    break;
                case "ja":
                    thanText = "より低い";
                    break;
                case "en":
                    thanText = "lower";
                    break;

                default:
                    thanText = "低于";
            }
        } else {
            switch (this.userLanguage) {
                case "zh":
                    thanText = "超出";
                    break;

                case "en":
                    thanText = "beyond";
                    break;
                case "ja":
                    thanText = "超えた";
                    break;
                default:
                    thanText = "超出";
            }
        }

        let flag = false;
        if (
            tradeType === 1 &&
            price.comparedTo((1.1 * this.marketPrice).toString()) == 1
        ) {
            flag = true;
        } else if (
            tradeType === 0 &&
            price.comparedTo((0.9 * this.marketPrice).toString()) == -1
        ) {
            flag = true;
        }

        if (flag) {
            let message: string = "";
            switch (this.userLanguage) {
                case "zh":
                    message = `您的${tradeText}价格${thanText}当前市场价10%,确认提交委托？`;
                    break;
                case "en":
                    message = `Your ${tradeText}ing price is 10% ${thanText} than the current market price, confirm the submission?`;
                    break;
                case "ja":
                    message = `あなたの${tradeText}の価格は現在の市場価格より10%${thanText}、委託を提出しますか？`;
                    break;
                default:
                    message = `您的${tradeText}价格${thanText}当前市场价10%,确认提交委托？`;
            }
            let alert = this.alertCtrl.create({
                title: window["language"]["PRICE_CONFIRMATION"] || "价格确认",
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
                            this._doTrade(
                                this.traderId,
                                "",
                                tradeType,
                                amount.toString(),
                                price.toString(),
                                this.productHouseId,
                                this.priceProductHouseId,
                            );
                        },
                    },
                ],
            });
            alert.present();
            return void 0;
        }

        this._doTrade(
            this.traderId,
            "",
            tradeType,
            amount.toString(),
            price.toString(),
            this.productHouseId,
            this.priceProductHouseId,
        );
    }

    _doTrade(
        traderId,
        password,
        tradeType,
        amount,
        price,
        productHouseId,
        priceProductHouseId,
    ) {
        this.trading = true;
        this.tradeService
            .purchase(
                traderId,
                password,
                tradeType,
                amount,
                price,
                productHouseId,
                priceProductHouseId,
            )
            .then(resData => {
                console.log("doTrade:", resData);
                // [{ "FID_CODE": "1", "FID_MESSAGE": "委托成功,您这笔委托的合同号是:201" }]
                const result = resData instanceof Array ? resData[0] : resData;

                if (typeof result === "object" && result.id) {
                    let toast = this.promptCtrl.toastCtrl({
                        message:
                            window["language"][
                                "DELEGATED_ORDER_HAS_BEEN_SUBMITTED"
                            ] || "委托单已提交", //`${result.id}`,
                        duration: 1000,
                        position: "middle",
                    });
                    toast.present();
                    //初始化数据
                    this.amount = this._numberFormatAdd0(0,false);
                    this.tradeValue = "";
                    this.rangeValue = 0;
                    //下单成功刷新委托单
                    this.page = 1;
                    this.getProcessEntrusts(); 
                } else {
                    return Promise.reject(result);
                }
                console.log("doTrade done:", result.id);
                this.alertService.dismissLoading();
            })
            .catch(err => {
                console.log("doTrade err:", err);
                if (err && err.message) {
                    let toast = this.promptCtrl.toastCtrl({
                        message: `${err.message}`,
                        duration: 1000,
                        position: "middle",
                    });
                    this.alertService.dismissLoading();
                    toast.present();
                }
                console.log(err.statusText || err.message || err);
            })
            .then(() => {
                this.refreshPersonalData();
                this.trading = false;
            });
    }

    private _getRequestCertifiedStatus() {
        this.loginService.status$.subscribe(status => {
            if (status) {
                if (this.personalDataService.certifiedStatus == "1") {
                    this.personalDataService.requestCertifiedStatus();
                }
            }
        });
    }

    private refreshPersonalData(refresher?: Refresher) {
        //TODO 添加了 this.doSubscribe()，看是否可行
        this.page = 1;
        Promise.all([
            this.personalDataService.requestFundData().catch(() => {}),
            this.personalDataService.requestEquityDeposit().catch(() => {}),
            // this.doSubscribe(),
        ]) 
            .then(
                () => (
                    this.checkMax(),
                    this.requestAssets(),
                    this.getProcessEntrusts()
                ),
            )
            .then(() => (refresher ? refresher.complete() : void 0))
            .catch(() => (refresher ? refresher.complete() : void 0));
    }
    ionViewWillLeave() {}

    ionViewDidLeave() {
        this.selectTradesModal && this.showSelectTrades();
    }
    async ionViewDidEnter() {
        // window["confirmChangeTradingMode"] = this.confirmChangeTradingMode
        this.viewDidLeave.next(false);
        
        if(this.traderId) {
            this.productStatus = await this.stockDataService.getProductStatus(this.traderId);
        }
        if (this.tradeType != this.appDataService.exchangeType) {
            this.chooseTradeType(
                undefined,
                this.appDataService.exchangeType
                    ? 1
                    : this.appDataService.exchangeType == 0
                        ? 0
                        : 1,
            );
        }

        // console.log('pricetarget', this.PriceInputer)
        // console.log('pricetarget', this.PriceInputer.getElementRef())
        // console.log('pricetarget', this.PriceInputer.getNativeElement())
        // this.subscribeTradeData() //暂时没用 用另一种方式保证刷新数值

        // this.initData();
        // this.getProcessEntrusts();
        // this.doSubscribe();
        // this.liquiddata = [{
        //   name: '1机',
        //   value: 0.7
        // }, 0.69];

        // this.quickTradeSelector.subscribe()
    }

    // subscribeTradeData() {
    //   Observable.combineLatest(
    //     this._tradeType$,
    //     this._price,
    //     // Observable.fromEvent(this.Price.getNativeElement(),'input') ,
    //   )
    //     .distinctUntilChanged()
    //     .debounceTime(300)
    //     .subscribe(([tradeType, price]) => {
    //       // console.log('pricetarget result ', tradeType,
    //       //   ' | ', price
    //       // )
    //       //TODO:交易类型,价格 变动触发 最大可交易量变动
    //       if(tradeType === 1){

    //         this.maxAmount
    //         this.amount
    //       }else if(tradeType === 0){

    //       }
    //     })
    // }

    // 订阅实时数据。
    // 由于 DataSubscriber 装饰器的作用，
    // 会在 ionViewDidEnter() 事件处理函数中被自动调用。
    private _hasGetPrice: boolean = false;
    async doSubscribe() {
        // window['temp_traderId'] = this.traderId
        const traderId = this.traderId;
        this._hasGetPrice = false;
        console.log("trade-interface-v2:(doSubscribe) ", traderId);
        if (traderId) {
            const traderList = await this.appDataService.traderListPromise;
            const trader = this.appDataService.traderList.get(traderId);
            if (!trader) return void 0;
            const names = trader.traderName.split(" / ");
            this.productName = this.targetName = names[0];
            this.priceName = names[1];
            // this._baseData$ = this.stockDataService.subscibeRealtimeData(traderId, 'price', this.viewDidLeave$)
            this._baseData$ = trader.marketRef
                .do(data => console.log("trade-interface-v2:1", data))
                //初始化买卖价格
                .do(data => {
                    // console.log('doSubscribe do')
                    if (!data) return false;
                    if (!this.price) {
                        const _price = new BigNumber(
                            data.price ? data.price : "0",
                        ).toString();
                        this.price = this._numberFormatAdd0(_price);
                    }
                    this.marketPrice = data.price;
                    this.buyRate = data.buyRate;
                    this.sellRate = data.sellRate;
                    this._tradeType$.next(this._tradeType$.getValue());
                   
                    this._currencyPrice = new BigNumber(data.instPrice);
                    this.currencyPrice = !this.appDataService.CURRENCY_INFO.exchange?'--':this._currencyPrice.times(this.appDataService.CURRENCY_INFO.exchange).toString();
                   
                });
            // this.stockDataService.stockBaseData$.map(data => data[stockCode])
            //   .do(data => console.log('final data:', stockCode, data))
            //   .do(data=>{
            //     //若无数据,则订阅.
            //     if(!data){
            //       this.stockDataService.subscibeRealtimeData(stockCode, 'price', this.viewDidLeave$)
            //         .takeUntil(this.viewDidLeave$.delay(this.appSettings.UNSUBSCRIBE_INTERVAL))
            //         // 必须订阅，数据才会流动，即使订阅函数内部没有做任何操作。
            //         .subscribe();
            //     }
            //   })
            console.log(
                "trade-interface-v2:(doSubscribe):depth ",
                this._depth$,
            );
            // if(!this._depth$){
           if(this._depthSource) {
                this._depthSource.unsubscribe()
                this._depthSource = null;
            }
                
            this._depthSource$ = this.socketioService
                .subscribeEquity(traderId, "depth")
                .do(data => console.log("trade-interface-v2:depth:", data));
            
            //旧的行情图 所需要的数据，已不需要
            // this._depth$ = this._depthSource$
            //   // .map(data =>data.data)
            //   .map(data => {
            //     let arr = []
            //     const length = 5
            //     //todo:买五卖五档数据处理,需要知道后端返回顺序.
            //     //{buy: Array(0), sale: Array(0)}
            //     if(!data.sale || !data.buy){
            //       return arr = Array.from({length:length*2})
            //     }

            //     for (let i = 0; i < length; i++) {
            //       arr[i] = data.sale[length - 1 - i]
            //       arr[i + length] = data.buy[i]
            //     }
            //     return arr
            //   })
            // this._depth$.subscribe()
            this._depthSource = this._depthSource$.subscribe(data => {
                if (data) {
                    this.size_1rem = false;
                    if (data.buy) {
                        this.buy_depth_2 = []
                        for (let i = 0; i < data.buy.length; i++) {
                            //剔除掉数量为0的数据
                            if (
                                data.buy[i].amount &&
                                new BigNumber(data.buy[i].amount).comparedTo(
                                    "0.00000001",
                                ) == -1
                            ) {
                                data.buy.splice(i, 1);
                                --i;
                            }
                             //检查长度
                            //  if(!this.size_1rem && (data.buy[i].amount || data.buy[i].price)) {
                            //     let _amount:string | string[] = (new BigNumber(data.buy[i].amount||0)).toString();
                            //     let _price:string | string[] = (new BigNumber(data.buy[i].price||0)).toString();
                            //     _amount = _amount.split('.');
                            //     _price = _price.split('.');
                            //     this.size_1rem = _amount[1] && _amount[1].length > 5 ? true : false;
                            //     this.size_1rem = _price[1] && _price[1].length > 5 ? true : false;
                            // }
                            // 格式
                            if(data.buy[i].amount) data.buy[i].amount = this.numberFormat(data.buy[i].amount,false,true,this.amountPrecision);
                            if(data.buy[i].price) data.buy[i].price = this.numberFormat(data.buy[i].price,false,true,this.pricePrecision);
                            // 竖版深度
                            if(i < 5) {
                                this.buy_depth_2[4-i] = data.buy[i];
                            }
                        }
                        this.buy_depth = data.buy;

                        if (this._tradeType$.getValue() == 1) {
                            if(!this._hasGetPrice) {
                                this._hasGetPrice = true;
                                const _price = "" + this.marketPrice;
                                this.price = this._numberFormatAdd0(_price);
                            }
                            if (this.buy_depth[0]) {
                                const _price = this.buyTotalQuantity = this.numberFormatDelete0(
                                    this.buy_depth[0].price,
                                );
                                this.price = this._numberFormatAdd0(_price);
                            }
                        }
                        // 快捷交易 0 的时候
                        this.buyTotalQuantity = this.buy_depth[0]
                            ? this.numberFormatDelete0(this.buy_depth[0].price)
                            : "" + this.marketPrice;
                    }
                    if (data.sale) {
                        this.sale_depth_2 = []
                        for (let i = 0; i < data.sale.length; i++) {
                            //剔除掉数量为0的数据
                            if (
                                data.sale[i].amount &&
                                new BigNumber(data.sale[i].amount).comparedTo(
                                    "0.00000001",
                                ) == -1
                            ) {
                                data.sale.splice(i, 1);
                                --i;
                            }
                            //检查长度
                            // if(!this.size_1rem && (data.sale[i].amount || data.sale[i].price)) {
                            //     let _amount:string | string[] = (new BigNumber(data.sale[i].amount||0)).toString();
                            //     let _price:string | string[] = (new BigNumber(data.sale[i].price||0)).toString();
                            //     _amount = _amount.split('.');
                            //     _price = _price.split('.');
                            //     this.size_1rem = _amount[1] && _amount[1].length > 5 ? true : false;
                            //     this.size_1rem = _price[1] && _price[1].length > 5 ? true : false;
                            // }
                            //格式
                            if(data.sale[i].amount) data.sale[i].amount = this.numberFormat(data.sale[i].amount,false,true,this.amountPrecision);
                            if(data.sale[i].price) data.sale[i].price = this.numberFormat(data.sale[i].price,false,true,this.pricePrecision);
                            // 竖版深度
                            if(i < 5) {
                                this.sale_depth_2[4-i] = data.sale[i];
                            }
                        }
                        this.sale_depth = data.sale;
                        if (this._tradeType$.getValue() == 0) {
                            if(!this._hasGetPrice) {
                                this._hasGetPrice = true;
                                const _price = "" + this.marketPrice;
                                this.price = this._numberFormatAdd0(_price);
                            }
                            if (this.sale_depth[0]) {
                                const _price = this.saleTotalQuantity = this.numberFormatDelete0(
                                    this.sale_depth[0].price,
                                );
                                this.price = this._numberFormatAdd0(_price);
                            }
                        }
                        // 快捷交易 0 的时候
                        this.saleTotalQuantity = this.sale_depth[0]
                            ? this.numberFormatDelete0(this.sale_depth[0].price)
                            : "" + this.marketPrice;
                    }
                }
            });
            // }

            // this._realtimeData$ = this.stockDataService.stockRealtimeData$.map(data => data[stockCode]);
            console.log(
                "trade-interface-v2_realtimeData:reportArr: ",
                this.reportArr,
            );
            // this._realtimeData$ = this.socketioService.subscribeRealtimeReports([this.traderId])
            //   .do(data => console.log('trade-interface-v2_realtimeData: ',data))
            //   .takeUntil(this.viewDidLeave$)
            //   .filter(({ type }) => type === this.traderId)
            //   .map(data => data.data)
            //   .map(data => {
            //     //处理增量更新
            //     const srcArr = this.reportArr
            //     srcArr.push(...data)//使用push+解构赋值,预期echarts动画实现
            //     const length = srcArr.length
            //     if (length > this.appSettings.Charts_Array_Length) {
            //       srcArr.splice(0, length - this.appSettings.Charts_Array_Length)
            //     }
            //     console.log('trade- interface_realtimeData:srcArr:', srcArr)
            //     return srcArr.concat()
            //   })
        }
    }

    gotoChart($event) {
        if(this.selectTradesModal) {
            this.showSelectTrades();
        }
        this.navCtrl.push(TradeChartV2Page, {
            traderId: this.traderId,
            changeTransaction: this.chooseTradeType.bind(this),
            pricePrecision: this.pricePrecision,
        });
    }
    async gotoHistoryLogin(goHistory: boolean = false) {
        await this.refreshPersonalData();
        this.buyTotalAmount = "0";
        this.saleTotalAmount = "0";
        this.getQuickTradeData();
        if (goHistory) {
            this.gotoHistory(undefined);
        }
    }
    gotoHistory($event) {
        const token = this.appDataService.token;
        if (!token) {
            return this.events.publish(
                "show login",
                "login",
                this.gotoHistoryLogin.bind(this, true),
            );
        }
        this.navCtrl
            .push(HistoryRecordPage, {
                traderId: this.traderId,
                productHouseId: this.productHouseId,
                priceProductHouseId: this.priceProductHouseId,
                getInfoCb: this.refreshPersonalData.bind(this),
            })
            .then(() => {});
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
        this.entrustServiceProvider
            .cancelEntrust(entrustId)
            .then(data => {
                console.log("cancelEntrust data", data);

                this.page = 1;
                this.getProcessEntrusts();
                this.gotoHistoryLogin();
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
                this.getProcessEntrusts();

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
            .then(() => {
                this.refreshPersonalData();
            });
    }

    getProcessEntrusts(infiniteScroll?: InfiniteScroll) {
        this.entrustServiceProvider
            .getEntrusts(this.traderId, "001,002", this.page, this.pageSize)
            .then(data => {
                console.log("getProcessEntrusts data:", data);
                if (this.page == 1) {
                    this.entrusts = data;
                } else {
                    this.entrusts.push(...data);
                }
                this.hasMore = !(data.length < this.pageSize);
                if (infiniteScroll) {
                    infiniteScroll.complete();
                    // infiniteScroll.enable(this.hasMore)
                }
            })
            .catch(() => {
                console.log("getProcessEntrusts err");
                this.hasMore = false;
                if (infiniteScroll) infiniteScroll.enable(this.hasMore);
            });
    }

    changeTrader($event?) {
        console.log("traderChanged", this.traderId, this.traderList);
        this.rangeValue = 0;
        this.tradeValue = '';
        this.amount = this._numberFormatAdd0(0,false);
        this.traderList.find(item => {
            if (item.traderId == this.traderId) {
                this.appDataService.LAST_TRADER.next(item);
                return true;
            }
            return false;
        });
    }
    confirmChangeTradingMode() {
        console.log("confirmChangeTradingMode");
        if (this.appDataService.show_onestep_trade) {
            this.appDataService.show_onestep_trade = false;
        } else {
            if (this.appDataService.show_onestep_warning) {
                const alert = this.alertCtrl.create({
                    title: window["language"]["RISK_WARNING"] || "风险提示",
                    message: `
            ${window["language"]["FAST_TRADING_REMINDER"] ||
                "快捷交易会优先以当前您见到的市场上最优价格买入或卖出，但可能因为网络延迟或他人优先下单的情况导致实际成交价格与看到的价格有所差别，可能会出现更高价买入或更低价卖出的情况，为了您的资金安全，请谨慎使用快捷交易。"}
            <a>${window["language"]["REVIEW_TRANSACTION_RULES"] ||
                "查看交易规则"}</a><br/>
          `,
                    inputs: [
                        {
                            name: "nowarning",
                            type: "checkbox",
                            label:
                                window["language"]["NO_REMIND_AGAIN"] ||
                                "不再提醒",
                            value: "nowarning",
                        },
                    ],
                    buttons: [
                        {
                            text: window["language"]["CANCEL"] || "取消",
                            role: "cancel",
                            handler: () => {
                                // console.log('Cancel clicked')
                            },
                        },
                        {
                            text: window["language"]["AGREE"] || "同意",
                            handler: data => {
                                this.appDataService.show_onestep_trade = true;
                                if (data.indexOf("nowarning") >= 0) {
                                    this.appDataService.show_onestep_warning = false;
                                }
                            },
                        },
                    ],
                });
                alert.present();
            } else {
                this.appDataService.show_onestep_trade = true;
            }
        }
    }
    // loadMoreHistory(infiniteScroll: InfiniteScroll)
    loadMoreHistory() {
        this.page += 1;
        //  this.getProcessEntrusts(infiniteScroll)
        this.getProcessEntrusts();
    }

    //行情详情图表
    toggleBets() {
        this.betsHidden = !this.betsHidden;

        if (this.largeRealtimeChart) {
            this.largeRealtimeChart.resize();
        }
    }

    switchOrientation(toPortrait: boolean) {
        this.isPortrait = toPortrait;
        (<any>window).screenSimLandscape = !toPortrait;
        if (toPortrait) {
            this.statusBar.show();
            // statusBar 隐藏后再显示，在 android 上会变成单独的状态条，
            // 不会融入 APP 的界面。
            // 即使设置 overlaysWebView 为 true 也无效。
            // this.statusBar.overlaysWebView(true);

            // 因此改用 androidFullScreen 来处理 android 设备的状态条问题，
            // 基本表现尚可，但偶尔会出现以下设置不生效的情况。
            // ios 设备的效果待测。
            if (this.platform.is("android")) {
                this.androidFullScreen
                    .isImmersiveModeSupported()
                    .then(() => this.androidFullScreen.immersiveMode())
                    .then(() => this.androidFullScreen.showSystemUI())
                    .then(() => this.androidFullScreen.showUnderStatusBar())
                    .catch((error: any) => console.log(error.message || error));
            }
            //tofix:关闭旋屏时需要重新watch分时图数据,临时处理待优化
            // console.log('switchOrientation subscribeRealtimeReports ')
            // this.socketioService.subscribeRealtimeReports([this.traderId])
            this.doSubscribe();
        } else {
            this.statusBar.hide();
        }
    }

    changeTime(index) {
        if (index === this.activeIndex) {
            return;
        }

        this.activeIndex = index;
        const KDATA_UNITS = this.appSettings.KDATA_UNITS;
        if (index > 0 && index <= KDATA_UNITS.length) {
            const kDataUnit = (this.kDataUnit = KDATA_UNITS[index - 1]);
            // FIXME ：切换 K 线图形态时，强制要求重新获取数据，
            // 这样会比较费流量。
            // 可以考虑增加判断，数据已存在就不要重新获取。
            // this.stockDataService.requestKData(this._stockCode, kDataUnit);
            this.candlestickArr = [];
            let theDate = new Date();
            let timespan, startTime;
            switch (index) {
                case 1:
                    timespan = "5m";
                    startTime = theDate.setDate(theDate.getDate() - 5);
                    break;
                case 2:
                    timespan = "30m";
                    startTime = theDate.setDate(theDate.getDate() - 30);
                    break;
                case 3:
                    timespan = "1h";
                    startTime = theDate.setDate(theDate.getDate() - 60);
                    break;
                default:
                    timespan = "5m";
                    startTime = theDate.setDate(theDate.getDate() - 5);
                    break;
            }
            // this._candlestickData$ = this.socketioService.subscribeRealtimeReports([this.traderId],undefined,{
            //   // var reportType = {
            //   //   Year: '1y',//年报
            //   //   HalfYear: '6M',//半年报
            //   //   Quarter: '1q',//季报
            //   //   Month: '1M',//月报
            //   //   Week: '1w',//周报
            //   //   Day: '1d',//日报
            //   //   Hour: '1h',//时报
            //   //   HalfHour: '30m',//30分报
            //   //   FifteenMinute: '15m',//15分报
            //   //   FiveMinute: '5m',//5分报
            //   //   Minute: '1m'//1分报
            //   // }
            //   timespan: timespan,
            //   type: '001',
            //   start: startTime,
            //   keepcontact : false,
            //   rewatch : true,
            // })
            //   .takeUntil(this.viewDidLeave$)
            //   .filter(({ type }) => type === this.traderId)
            //   .map(data => data.data)
            //   .map(data => {
            //     //处理增量更新
            //     const srcArr = this.candlestickArr
            //     const resData = data.map(item => {
            //       const value = item.value
            //       const time = new Date(item.beginTime)
            //       return{
            //         startPrice: value.start,
            //         endPrice: value.end,
            //         minPrice: value.min,
            //         maxPrice: value.max,
            //         date: `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${time.getMinutes()}`,
            //         turnoverAmount: value.amount * value.avg / this.appSettings.Product_Price_Rate,
            //         turnoverQuantity: value.amount / this.appSettings.Product_Price_Rate,
            //         // yesterdayPrice:4.78,
            //       }
            //     })
            //     srcArr.push(...resData)//使用push+解构赋值,预期echarts动画实现
            //     const length = srcArr.length
            //     if (length > this.appSettings.Charts_Array_Length) {
            //       srcArr.splice(0, length - this.appSettings.Charts_Array_Length)
            //     }
            //     console.log('trade- interface_candlestickData:srcArr:', srcArr)
            //     return srcArr.concat()
            //   })
        }
    }

    //快捷交易三个拉动条
    rangeQuickTradeData(dataRange: any, rangeType: Number) {
        if (!this.appSetting.getUserToken()) {
            return;
        }
        if (!this.maxAmount) {
            this.maxAmount = "0";
        }
        if (!this.holdAmount) {
            this.holdAmount = "0";
        }

        // 快捷交易  买
        if (new BigNumber(dataRange || "0").toString()) {
            let buy_amount: any;
            if (rangeType == 1) {
                buy_amount =
                    this.oneRange > this.oneRange_buy_old
                        ? new BigNumber(this.buyTotalAmount).plus(1)
                        : new BigNumber(this.buyTotalAmount).minus(1);
                this.oneRange_buy_old = this.oneRange;
            } else if (rangeType == 10) {
                buy_amount =
                    this.tenRange > this.tenRange_buy_old
                        ? new BigNumber(this.buyTotalAmount).plus(10)
                        : new BigNumber(this.buyTotalAmount).minus(10);
                this.tenRange_buy_old = this.tenRange;
            } else if (rangeType == 100) {
                buy_amount =
                    this.hundredRange > this.hundredRange_buy_old
                        ? new BigNumber(this.buyTotalAmount).plus(100)
                        : new BigNumber(this.buyTotalAmount).minus(100);
                this.hundredRange_buy_old = this.hundredRange;
            }
            if (buy_amount.comparedTo(this.holePrice) != 1) {
                buy_amount =
                    buy_amount.comparedTo(0) == 1
                        ? buy_amount
                        : new BigNumber(0);
                this.buyTotalAmount =
                    dataRange == 0 ? "0" : buy_amount.toString();
            } else {
                this.buyTotalAmount = this.holePrice;
            }
        }

        // 快捷交易  卖
        if (new BigNumber(dataRange || "0").toString()) {
            let sale_amount: any;
            if (rangeType == 1) {
                sale_amount =
                    this.oneRange > this.oneRange_sale_old
                        ? new BigNumber(this.saleTotalAmount).plus(1)
                        : new BigNumber(this.saleTotalAmount).minus(1);
                this.oneRange_sale_old = this.oneRange;
            } else if (rangeType == 10) {
                sale_amount =
                    this.tenRange > this.tenRange_sale_old
                        ? new BigNumber(this.saleTotalAmount).plus(10)
                        : new BigNumber(this.saleTotalAmount).minus(10);
                this.tenRange_sale_old = this.tenRange;
            } else if (rangeType == 100) {
                sale_amount =
                    this.hundredRange > this.hundredRange_sale_old
                        ? new BigNumber(this.saleTotalAmount).plus(100)
                        : new BigNumber(this.saleTotalAmount).minus(100);
                this.hundredRange_sale_old = this.hundredRange;
            }
            if (sale_amount.comparedTo(this.holdAmount) != 1) {
                sale_amount =
                    sale_amount.comparedTo(0) == 1
                        ? sale_amount
                        : new BigNumber(0);
                this.saleTotalAmount =
                    dataRange == 0 ? "0" : sale_amount.toString();
            } else {
                this.saleTotalAmount = this.holdAmount;
            }
        }
    }

    //快捷交易 满仓等
    getQuickTradeData() {
        console.log("getQuickTradeData");
        if(!this.productPair) return;
        const rate = 1;
        const productPairs = this.productPair.split("-");
        let priceProduct, productProduct;

        this.personalDataService.personalStockList.forEach(item => {
            //获取交易信息
            if (item.stockCode === productPairs[0]) {
                priceProduct = item;
            } else if (item.stockCode === productPairs[1]) {
                productProduct = item;
            }
        });
        if (this.appSetting.getUserToken()) {
            this.buyTotalAmount = "0";
            this.saleTotalAmount = "0";
            return;
        }

        //下面代码 已废弃
        // if (priceProduct) {
        //   //可买数量
        //   this.buyTotalAmount = '0';
        //   // priceid productid totalprice
        //   this.tradeService.getQuickTradeData('001', traders[1], traders[0], priceProduct.saleableQuantity * rate)
        //     .then(data => {
        //       if (data) {
        //         // 等待二兵排查
        //         // this.buyTotalQuantity = data.forecastAmount
        //         // this.buyTotalAmount = data.forecastPrice

        //       }
        //       // else {
        //       //   this.buyTotalQuantity = 0
        //       // }
        //     })
        // }
        // if (productProduct) {
        //   //卖出总持仓
        //   // this.saleTotalQuantity = productProduct.saleableQuantity * rate
        //   this.saleTotalAmount = '0';
        //   this.tradeService.getQuickTradeData('002', traders[1], traders[0], this.saleTotalQuantity)
        //     .then(data => {
        //       if (data) {
        //          // 等待二兵排查
        //         // this.saleTotalQuantity = data.forecastAmount
        //         // this.saleTotalAmount = data.forecastPrice

        //       }
        //       // else {
        //       //   this.saleTotalQuantity = 0
        //       // }
        //     })
        // }
    }

    async alterQuickTrade(tradeType) {
        if (this.quickTrading) {
            return void 0;
        }
        this.productStatus = await this.stockDataService.getProductStatus(this.traderId)
        if(!this.productStatus) return;
        if (!this.appSetting.getUserToken()) {
            return this.goLogin();
        }
        let type = {
            buy: window["language"]["CONFIRM_TO_BUY"] || "委托买单",
            sale: window["language"]["CONFIRM_TO_SELL"] || "委托卖单",
        };
        this.alertCtrl
            .create({
                title: window["language"]["QUICK_TRANSACTION"] || "快捷交易",
                message: type[tradeType],
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
                            this.quickTrade(tradeType);
                        },
                    },
                ],
            })
            .present();
    }
    async quickTrade(tradeType) {
        if (!this.appSetting.getUserToken()) {
            return this.goLogin();
        }
        await this.personalDataService.requestCertifiedStatus();
        if (!(this.personalDataService.certifiedStatus == "2")) {
            return this.validateIdentify();
        }

        if (this.quickTrading) {
            return void 0;
        }
        let transactionType = "";
        let amount: any = 0;
        let text: string = "";
        if (tradeType === "buy") {
            transactionType = "001";
            amount = new BigNumber(this.buyTotalAmount).toString();
            text =
                window["language"]["SET_THE_TRANSACTION"] || "请拖动选择交易额";
        } else if (tradeType === "sale") {
            transactionType = "002";
            amount = new BigNumber(this.saleTotalAmount).toString();
            text = window["language"]["SET_THE_SELL"] || "请拖动选择卖出数量";
        } else {
            return void 0;
        }
        if (!Number(amount)) {
            this.alertCtrl
                .create({
                    title: window["language"]["QUICK_FAILS"] || "快捷交易失败",
                    message: text,
                    buttons: [
                        {
                            text: window["language"]["CONFIRM"] || "确认",
                            handler: () => {},
                        },
                    ],
                })
                .present();
            return void 0;
        }

        this.alertService.presentLoading("");

        try {
            const index = this.buySaleActiveIndex.getValue();
            const rate = this._cards[Object.keys(this._cards)[index]];
            const traders = this.traderId;
            const priceProductHouseId = this.priceProductHouseId;
            const productHouseId = this.productHouseId;

            this.quickTrading = true;
            this.tradeService
                .quickTrade(
                    transactionType,
                    traders,
                    productHouseId,
                    priceProductHouseId,
                    amount,
                )
                .then(async data => {
                    if (!data.id) {
                        return Promise.reject({
                            message:
                                window["language"]["NO_DELEGATED_ORDER"] ||
                                "无委托提交",
                        });
                    }
                    //刷新账户信息
                    await this.personalDataService
                        .requestFundData()
                        .catch(() => {});
                    await this.personalDataService
                        .requestEquityDeposit()
                        .catch(() => {});
                    this.getQuickTradeData();

                    this.alertService.dismissLoading();

                    const toast = this.promptCtrl.toastCtrl({
                        message:
                            window["language"]["QUICK_ORDER_SUCCESS"] ||
                            `快捷下单成功`,
                        duration: 1000,
                        position: "middle",
                    });
                    toast.present();

                    //下单成功刷新委托单
                    this.page = 1;
                    this.getProcessEntrusts();
                })
                .catch(err => {
                    this.alertService.dismissLoading();
                    if (err && err.message) {
                        this.alertService.showAlert(
                            window["language"]["ORDER_FAILED"] || "下单失败",
                            err.message,
                        );
                    }
                })
                .then(() => {
                    this.quickTrading = false;
                    this.refreshPersonalData();
                });
        } finally {
            // this.alertService.dismissLoading()
        }
    }

    private personalAssets: object = {};
    requestAssets() {
        const productPairs = this.productPair.split("-");
        if(this.personalDataService.personalStockList.length) {
            this.personalDataService.personalStockList.forEach(item => {
                if (item.stockCode === productPairs[0]) {
                    this.trader_target = item;
                    this.holePrice = this.numberFormat(
                        new BigNumber(item.restQuantity || "0").toString(),
                    );
                } else if (item.stockCode === productPairs[1]) {
                    this.trader_product = item;
                    this.holdAmount = this.numberFormat(
                        new BigNumber(
                            item.restQuantity ? item.restQuantity : "0",
                        ).toString(),
                        false,
                        false,
                    );
                }
            });
        } else {
            this.holePrice = '0';
            this.holdAmount = '0';
        }
        

        this.personalDataService
            .personalAssets()
            .then(async data => {
                for (let key in data) {
                    const item = data[key];
                    let priceName = "";
                    const product = await this.stockDataService.getProduct(
                        item.instPriceProductHouseId,
                    );

                    if (product) priceName = `${product.productName}`;
                    item.priceName = priceName;
                }
                console.log("requestAssets", data);
                this.personalAssets = data;
            })
            .catch(err => {
                console.log("requestAssets:", err);
            });
    }

    async goLogin() {
        this.productStatus = await this.stockDataService.getProductStatus(this.traderId)
        if(!this.productStatus) return;
        this.events.publish(
            "show login",
            "login",
            this.gotoHistoryLogin.bind(this),
        );
    }

    validateIdentify() {
        if (this.personalDataService.certifiedStatus == "2") {
            return;
        }
        let alert: any = {};
        //title 不能设置在初始化中，会没掉
        if (
            this.personalDataService.certifiedStatus == "0" ||
            this.personalDataService.certifiedStatus == "3"
        ) {
            alert["title"] =
                window["language"]["TRANSACTION_FAIL"] || `交易失败`;
            alert["subTitle"] = `${window["language"][
                "REAL_NAME_AUTHENTICATION"
            ] || "实名认证"}`;
            alert["message"] = `${this.personalDataService.realname ||
                this.personalDataService.certifiedMsg}`;
            alert["buttons"] = [
                {
                    text: window["language"]["CANCEL"] || "取消",
                    role: "cancel",
                    handler: () => {
                        // console.log('Cancel clicked')
                    },
                },
                {
                    text: window["language"]["VERIFICATION_1"] || "认证",
                    handler: () => {
                        this.navCtrl.push("submit-real-info");
                    },
                },
            ];
        } else if (this.personalDataService.certifiedStatus == "1") {
            alert["title"] =
                window["language"]["TRANSACTION_FAIL"] || `交易失败`;
            alert["subTitle"] = `${window["language"][
                "REAL_NAME_AUTHENTICATION"
            ] || "实名认证"}`;
            alert["message"] = `${this.personalDataService.realname ||
                this.personalDataService.certifiedMsg}`;
            alert["buttons"] = [
                {
                    text: window["language"]["CONFIRM"] || "确认",
                    role: "cancel",
                    handler: () => {
                        // console.log('Cancel clicked')
                    },
                },
            ];
        } else {
            alert["title"] =
                window["language"]["TRANSACTION_FAIL"] || `交易失败`;
            alert["message"] =
                window["language"]["SELECT_USER_STATE_ERROR"] ||
                `获取用户状态出错`;
            alert["buttons"] = [
                {
                    text: window["language"]["CONFIRM"] || "确认",
                    role: "cancel",
                    handler: () => {
                        // console.log('Cancel clicked')
                    },
                },
            ];
        }
        // 避免空白提示
        alert["cssClass"] = "trade-alert-color";
        if (!(JSON.stringify(alert) == "{}")) {
            this.alertCtrl.create(Object.assign(alert)).present();
        }
    }

    //格式处理18位，整数18，小数10+8
    numberFormat(
        number: any = "0",
        delete0: boolean = false,
        input: boolean = true,
        step: number = 8,
    ) {
        let saveNumber = number;
        number = typeof number == "string" ? number : number.toString();
        if (delete0) {
            number = this.numberFormatDelete0(number);
        }
        number = number.split(".");

        if (!number[0]) {
            return saveNumber;
        }
        if (number[0].length > 1) {
            number[0] = number[0].replace(/\b(0+)/gi, "");
            number[0] = number[0] == "" ? "0" : number[0];
        }
        if (!input && number[1]) {
            number[1] =
                number[1].length > step ? number[1].substr(0, step) : number[1];
            return number[0] + "." + number[1];
        }
        if (number[1]) {
            number[0] =
                number[0].length > 10 ? number[0].substr(-10) : number[0];
            number[1] =
                number[1].length > step ? number[1].substr(0, step) : number[1];
            return number[0] + (number[1] ? "." + number[1]:"");
        } else if (number[1] == "") {
            return number[0];
        } else {
            return number[0].length > 18 ? number[0].substr(-18) : number[0];
        }
    }
    _numberFormatAdd0( number: string | number,isPrice: boolean = true) {
        const precision = isPrice ? this.pricePrecision : this.amountPrecision;
        let numberArr = ('' + number).split(".");
        let zero: string = "";
        if (numberArr.length > 1) {
            for (let i = 0; i < precision - numberArr[1].length; i++) {
                zero += "0";
            }
            return number + zero;
        } else {
            zero = ".";
            for (let i = 0; i < precision; i++) {
                zero += "0";
            }
            return number + zero;
        }
    }
    numberFormatDelete0(number: string | number) {
        let arrExp: any;
        let numberArr: Array<string>;
        if (typeof number == "number") number = number.toString();
        numberArr = number.split(".");
        number = number
            .split("")
            .reverse()
            .join("");
        arrExp = /[1-9|\.]/gi.exec(number);

        if (arrExp && numberArr.length == 2) {
            if (arrExp[0] == ".") {
                number = number.substring(arrExp.index + 1);
            } else {
                number = number.substring(arrExp.index);
            }
            return number
                .split("")
                .reverse()
                .join("");
        }
        return number
            .split("")
            .reverse()
            .join("");
    }
    rangeMaxNumber(base: number = 1) {
        let rangNumber: any;
        let buy: any = this.holePrice;
        let sale: any = this.holdAmount;
        let number: number;
        buy = isNaN(buy) ? 0 : parseFloat(buy);
        sale = isNaN(sale) ? 0 : parseFloat(sale);
        number = buy > sale ? buy : sale;
        //进位处理，123.3 ->124 or 130 or 200
        //         base = 1 or 10 or 100
        rangNumber =
            base == 1
                ? parseInt(Math.ceil(number / base).toString()) * base
                : parseInt(
                      Math.ceil(
                          number / base < 1 ? 0 : number / base,
                      ).toString(),
                  ) * base;

        return rangNumber;
    }
    tradeRangeChange($event) {
        const value = $event.value / 100;
        if(value > 0) {
            this.rangeLeftRound = true;
        } else {
            this.rangeLeftRound = false;
        }
        
        if(this._tradeType$.getValue()) {
            if(!this.price || parseFloat(this.price) == 0) return ;
            if(!this.trader_target.availableAmount) return ;
            this.amount = this._numberFormatAdd0( this.numberFormat((new BigNumber(this.trader_target.availableAmount||0)).div(this.price).times(value).toString(),false,true,this.amountPrecision),false)
        } else {
            if(!this.trader_product.availableAmount) return ;
            this.amount = this._numberFormatAdd0(this.numberFormat((new BigNumber(this.trader_product.availableAmount||0)).times(value).toString(),false,true,this.amountPrecision),false)
        }
        this.calculationAmount();
    }
    tradeRangeDisabled() {
        let buy: any = this.holePrice;
        let sale: any = this.holdAmount;
        buy = isNaN(buy) ? 0 : parseFloat(buy);
        sale = isNaN(sale) ? 0 : parseFloat(sale);
        if(this._tradeType$.getValue()) {
            return buy;
        } else {
            return sale;
        }
    }

    _reEntrusts: boolean = false;
    reEntrusts() {
        if(this._reEntrusts) return;
        this.page = 1;
        this._reEntrusts = true;
        this.getProcessEntrusts();
        setTimeout(() => {
            this._reEntrusts = false;
        }, 1800);
    }
    changeTradeType() {
        this.appDataService.trade_type = this.appDataService.trade_type ? false : true;

    }
    changeLeftOrRight() {
        this.appDataService.left_or_right = this.appDataService.left_or_right ? false : true;
    }
    changePriceType() {
        this.actionsheetCtrl.create({
            buttons: 
            [
                {
                    text: "限价",
                    handler: () => {
                    },
                },
            ]
        }).present();
    }
    scrollFixInput() {
        const position_y = this.el.nativeElement.querySelector('#scroll-dom').offsetTop;
        this.content.scrollTo(0, position_y);
    }

    public selectTradesModal: Modal;
    @ViewChild("selectTrader")  selectTrader;
    showSelectTrades() {
        if(this.selectTradesModal) {
            this.selectTradesModal.dismiss();
            this.selectTradesModal = null;
            this.appSetting.hasTabBlur = false;
            return ;
        }
        this.selectTradesModal =  this.modalCtrl.create(
            SelectTradesPage,
            {
                traderList: this.traderList,
                traderId: this.traderId,
            },
            {
                enterAnimation: "custom-dialog-pop-in",
                leaveAnimation: "custom-dialog-pop-out",
                cssClass: "select-trades-page show-page",
            },
        );
        this.appSetting.hasTabBlur = true;
        this.selectTradesModal.onWillDismiss( () => {
            this.selectTradesModal = null;
            this.appSetting.hasTabBlur = false;
            this.rangeValue = 0;
            this.tradeValue = '';
            this.amount = this._numberFormatAdd0(0,false);
            this.selectTrader && this.selectTrader.close();
        })
        this.selectTradesModal.present();
    }
}
