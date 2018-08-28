import {
    Component,
    ViewChild,
    OnInit,
    AfterViewInit,
    AfterContentInit,
    ElementRef,
    Renderer,
} from "@angular/core";

import { NavController, Tab, Tabs, Events } from "ionic-angular";

import { OptionalPage } from "../optional/optional";
import { RecommendPage } from "../recommend/recommend";
import { HomePage } from "../home/home";
// import { QuotationsPage } from '../quotations/quotations';
import { QuotationsPageV2 } from "../quotations-v2/quotations-v2";

import { AppSettings } from "../../providers/app-settings";
import { PersonalDataService } from "../../providers/personal-data-service";

//引入资讯的首页
import { InformationPage } from "../information/information";
// import { TradeInterfacePage } from '../trade-interface/trade-interface';
import { TradeInterfaceV2Page } from "../trade-interface-v2/trade-interface-v2";
import { NewsListPage } from "../news-list/news-list";
import { LoginService } from "../../providers/login-service";
import { AppSettingProvider } from "../../bnlc-framework/providers/app-setting/app-setting";
import { Keyboard } from "@ionic-native/keyboard";
import { AppDataService } from "../../providers/app-data-service";
import { TradeChartV2Page } from "../trade-chart-v2/trade-chart-v2";

@Component({
    selector: "component-tabs",
    templateUrl: "tabs.html",
})
export class TabsPage implements OnInit, AfterViewInit, AfterContentInit {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    optionalRoot: any = OptionalPage;

    infoTabsRoot: any = InformationPage;
    newsListPage: any = NewsListPage;

    homeRoot: any = HomePage;
    quotationsPageRoot: any = QuotationsPageV2;
    tradeRoot: any = TradeInterfaceV2Page;

    stockCode: string;
    mb: any;

    constructor(
        private events: Events,
        public navCtrl: NavController,
        public appSettings: AppSettings,
        public loginService: LoginService,
        public personalDataService: PersonalDataService,
        public appSetting: AppSettingProvider,
        public elementRef: ElementRef,
        public renderer: Renderer,
        public keyboard: Keyboard,
        public appDataService: AppDataService,
    ) {
        // FIXME ：如何获取推荐的股票列表？
        // 后续处理的调用暂时注释掉。
        // this.checkPersonalStockListIsNull();
        window["TB"] = this;
    }

    //+from BNLC framework

    @ViewChild(Tabs) tabs: Tabs;
    // @ViewChild("optionalTab") optionalTab: Tab;
    @ViewChild("quotationsTab") quotationsTab: Tab;
    @ViewChild("exchangeTab") tradeInterfaceTab: Tab;
    // @ViewChild("newsTab") newsTab: Tab;
    @ViewChild("homeTab") homeTab: Tab;
    @ViewChild("maintabs") tabRef: Tabs;
    tab_list: any[];
    tab_names: any[];
    tab_should_login: String[];
    tab_map: Map<string, Tab>;
    index_tab_name = "quotations";
    initTabs() {
        this.tab_list = [
            this.quotationsTab,
            this.quotationsTab,
            // this.newsTab,
            // this.optionalTab,
            this.homeTab,
        ];
        this.tab_names = ["quotations", "exchange", "news", "optional", "home"];
        this.tab_should_login = ["optional", "home"];
        this.tab_map = new Map();
        // this.tab_map.set("optionalTab", this.optionalTab);
        this.tab_map.set("quotationsTab", this.quotationsTab);
        this.tab_map.set("exchangeTab", this.tradeInterfaceTab);
        // this.tab_map.set("newsTab", this.newsTab);
        this.tab_map.set("homeTab", this.homeTab);
    }
    tabRoute() {
        console.group("TAB ROUTE");
        var paths = location.hash.split("/");
        console.log(paths);
        var start_index = paths.indexOf("tabs");
        if (start_index === -1) {
            paths = ["tabs", this.index_tab_name];
            start_index = 0;
        }

        const route_paths = [...new Set(paths.slice(start_index + 1)).values()];
        let tab_name = route_paths.shift();
        if (this.tab_names.indexOf(tab_name) === -1) {
            // 跳转到默认页
            tab_name = this.index_tab_name;
        }

        const tab = this[tab_name + "Tab"] as Tab;
        // // debugger
        // tab.root = tab_name;
        // // const page_name = route_paths.shift() || tab_name;
        // if (route_paths[0] === tab_name) {
        //   route_paths.shift();
        // }

        this.tabs.selectedIndex = this.tab_names.indexOf(tab_name);
        this.tabs.initTabs().then(gotoPage);

        // this.tabs.select(tab).then(gotoPage);
        function gotoPage() {
            while (route_paths.length) {
                const page_name = route_paths.shift();
                tab.push(page_name).then(gotoPage);
            }
        }
        console.groupEnd();
    }
    ngOnInit() {
        this.initTabs();
    }
    ngAfterViewInit() {}
    ngAfterContentInit() {
        console.log("TABS ngAfterContentInit");
        if (!this._disable_route_handle) {
            this.tabRoute();
        }
    }

    // private _binded_tab_route;
    ionViewWillEnter() {
        console.log("TABS ionViewWillEnter");
        this._disable_route_handle = false;
        // this._binded_tab_route = this.tabRoute.bind(this);
        // window.addEventListener('hashchange', this._binded_tab_route, false);
    }
    private _disable_route_handle = false;
    ionViewWillLeave() {
        console.log("TABS ionViewWillLeave");
        this._disable_route_handle = true;
        // window.removeEventListener('hashchange', this._binded_tab_route);
    }
    ionViewDidEnter() {
        this.tab_list.forEach(tab => {
            const abutton = tab.btn.getNativeElement();
            let pointerdown_eventname = "touchstart";
            if ("onpointerdown" in window) {
                pointerdown_eventname = "pointerdown";
            }

            abutton.addEventListener(
                pointerdown_eventname,
                function bindRoot() {
                    
                    const self = this as TabsPage;
                    if (
                        self.tab_should_login.includes(tab.tabUrlPath) &&
                        (!self.appSetting.getUserToken() && !self.appDataService.token)
                    ) {
                        return self.events.publish(
                            "show login",
                            "login",
                            () => {
                                self.tabs.select(tab);
                            },
                        );
                    }

                    tab.root || (tab.root = tab.tabUrlPath);

                    abutton.removeEventListener(
                        pointerdown_eventname,
                        bindRoot,
                    );
                }.bind(this),
            );
        });
        // console.log("GG",location.hash)
        // const hash = location.hash;
        // const prefix = "#/tabs/";
        // if (hash.startsWith(prefix)) {
        //   const routes = hash.substr(prefix.length).split("/");
        //   console.log("routes:", routes);
        //   routes.forEach((r) => {
        //     this.navController.push(r);
        //   })
        // }
    }
    //-from BNLC framework

    ionViewDidLoad() {
        let tabs = this.queryElement(this.elementRef.nativeElement,'.tabbar');
        this.events.subscribe('hideTabs',() => {
            this.renderer.setElementStyle(tabs,"display",'none');
            let SelectTab = this.tabRef.getSelected()._elementRef.nativeElement;
            let content = this.queryElement(SelectTab,'.scroll-content');
            this.mb = content.style['margin-bottom'];
            this.renderer.setElementStyle(content,"margin-bottom","0")
        })
        this.events.subscribe('showTabs',() => {
            this.renderer.setElementStyle(tabs,"display",'');
            let SelectTab = this.tabRef.getSelected()._elementRef.nativeElement;
            let content = this.queryElement(SelectTab,'.scroll-content');
            this.renderer.setElementStyle(content,"margin-bottom",this.mb);
        })
    }
 
    checkPersonalStockListIsNull() {
        if (this.personalDataService.personalStockListIsNull === true) {
            this.optionalRoot = RecommendPage;
        }

        // this.personalDataService.personalStockListIsNull$.subscribe(result => {
        //     if (this.optionalTab) {
        //         const targetPage = result ? RecommendPage : OptionalPage;
        //         const optionalTabRoot = this.optionalTab.root;
        //         if (optionalTabRoot !== targetPage) {
        //             const direction = result ? "forward" : "back";
        //             try {
        //                 this.optionalTab
        //                     .getActive()
        //                     .getNav()
        //                     .setRoot(
        //                         targetPage,
        //                         {},
        //                         {
        //                             direction,
        //                             animation: "ios-transition",
        //                             animate: true,
        //                         },
        //                     );
        //             } catch (e) {
        //                 console.log(e.message || e);
        //             }
        //         }
        //     }
        // });
    }
    queryElement(ele: HTMLElement, q: string) {
        return <HTMLElement>ele.querySelector(q)
    }
}
