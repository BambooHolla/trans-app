import { Component, Renderer2, Inject, OnInit, ViewChild } from "@angular/core";
import { Platform, Events, NavController } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { AndroidFullScreen } from "@ionic-native/android-full-screen";
import { Clipboard } from "@ionic-native/clipboard";
import { Toast } from "@ionic-native/toast";
// import { App, NavController, LoadingController, Loading } from 'ionic-angular';
import {
    App,
    Config,
    LoadingController,
    Loading,
    AlertController,
    ToastController,
    ActionSheetController,
    ModalController,
} from "ionic-angular";
import { TranslateService } from "@ngx-translate/core";

// import { LoadingPage } from '../pages/loading/loading';
import { TabsPage } from "../pages/tabs/tabs";
import { LoginPage } from "../pages/login/login";
import { EntrancePage } from "../pages/entrance/entrance";

import { AppSettings } from "../providers/app-settings";
import { KeyboardService } from "../providers/keyboard-service";
import { LoginService } from "../providers/login-service";
import { AppDataService } from "../providers/app-data-service";
import { SocketioService } from "../providers/socketio-service";
import { StockDataService } from "../providers/stock-data-service";
import { TradeService } from "../providers/trade-service";
import { PersonalDataService } from "../providers/personal-data-service";
import { CommonTransition } from "./common-transition";
import { AppSettingProvider } from "../bnlc-framework/providers/app-setting/app-setting";
import { AlertService } from "../providers/alert-service";
import { GestureLockPage } from "../pages/gesture-lock/gesture-lock";
import { Storage } from "@ionic/storage";
import { AccountServiceProvider } from "../providers/account-service/account-service";
import { ContactStatus } from "../providers/work-order-service/work-order-service";
import { RegisterService } from "../providers/register-service";
import { Network } from '@ionic-native/network';
import { CustomDialogPopIn, CustomDialogPopOut } from "../pages/custom-dialog/custom-dialog.transform";
import { AccountCenterPage } from "../pages/account-center/account-center";
import { UpgradeServiceProvider } from "../providers/upgrade/upgrade-service";
import { VersionUpdateDialogPage } from "../pages/version-update-dialog/version-update-dialog";
@Component({
    templateUrl: "app.html",
})
export class PicassoApp {
    @ViewChild('myNav') nav: NavController;
    static WINDOW_MAX_HEIGHT = 0;
    private rootPage = TabsPage;
    private loginModal = this.modalController.create(LoginPage);
    private unregisterBackButton:any;
    private loader: Loading;

    private loginChecked: boolean = false;

    presentLoading(val) {
        if (!this.loginChecked) {
            this.loader = this.loadingCtrl.create({
                content: val,
            });
            this.loader.present();
        }
    }
    ngOnInit() {}
    dismissLoading() {
        if (this.loader) {
            this.loader.dismiss();
            this.loader = null;
        }
    }

    constructor(
        public appCtrl: App,
        private events: Events,
        public loginService: LoginService,
        public appDataService: AppDataService,
        public appSettings: AppSettings,
        public keyboardService: KeyboardService,
        public screenOrientation: ScreenOrientation,
        public androidFullScreen: AndroidFullScreen,
        public clipboard: Clipboard,
        public personalDataService: PersonalDataService,
        public stockDataService: StockDataService,
        public socketioService: SocketioService,
        public tradeService: TradeService,
        public platform: Platform,
        public statusBar: StatusBar,
        public splashScreen: SplashScreen,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public modalController: ModalController,
        public translate: TranslateService,
        public renderer2: Renderer2,
        public config: Config,
        public appSettingProvider: AppSettingProvider,
        public alertService: AlertService,
        public storage: Storage,
        public toast: Toast,
        public actionSheetCtrl: ActionSheetController,
        public registerService: RegisterService,
        private network: Network,
        public upService: UpgradeServiceProvider,
    ) {
       
        if (
            this.appDataService.APP_VERSION !=
            this.appDataService.version
        ) {
            this.appDataService.version = this.appDataService.APP_VERSION;
            // 版本更新，清除缓存的国家数据
            this.storage.remove('COUNTRY_LIST')
            //获取保存的用户账号
            let customerId = this.appDataService.customerId;
            //清空登入信息,保留用户账号
            this.loginService.doLogout().then(success => {
                this.appDataService.customerId = customerId;
            });
        }
        if(!!appSettingProvider.getUserToken()) {
            this.storage.get('gestureLockObj').then( data => {
                if(data) {
                    let gesturePage = this.modalController.create(GestureLockPage,{
                        hasGestureLock: undefined,
                    });
                    gesturePage.present();
                }
            })
        }
        // this.storage.remove('COUNTRY_LIST')
        this.storage.get('COUNTRY_LIST').then( data => {
            if(data) {
                this.appDataService.COUNTRY_LIST = data;
            } else {
                this.registerService.getCountryList().then( data => {
                    const _countrys = [];
                    for (let key in data ) {

                        data[key]['ab'] = key; 
                        _countrys.push(data[key])
                    }
                    this.appDataService.COUNTRY_LIST = _countrys;
                    this.storage.set("COUNTRY_LIST",_countrys)
                }).catch( data => {
                    
                })
            }
        })
        
        window["ac"] = this;
        window["clipboard"] = clipboard;
        window["translate"] = translate;
        window["platform"] = platform; 
        window["alertCtrl"] = alertCtrl;
        window["loadingCtrl"] = loadingCtrl;
        window["toastCtrl"] = toastCtrl;
        window["toast"] = toast;
        window["actionSheetCtrl"] = actionSheetCtrl;
        window["modalCtrl"] = modalController;
        window["picassoApp"] = this;
        // 设置语言
        window["language"] = window["language"] || {};
        this.initTranslate();
        // 获取语言后，查看是否以及有缓存汇率，如果没，以本地语言作为汇率标准
        if(appDataService.CURRENCY_INFO) {
            tradeService.getCurrencyInof(appDataService.CURRENCY_INFO.type);
        } else {
            tradeService.getCurrencyInof(appDataService.LANGUAGE);
        }
        tradeService.getCurrencys();
        if (!navigator["clipboard"]) {
            navigator["clipboard"] = {
                writeText: text => clipboard.copy(text),
                readText: () => clipboard.paste(),
            };
        }

        config.setTransition("common-transition", CommonTransition);
        config.setTransition("custom-dialog-pop-in", CustomDialogPopIn);
        config.setTransition("custom-dialog-pop-out", CustomDialogPopOut);
        // 自动更新
        (async ()=> {
            if(platform.is('android')) {
                const _version = await upService.checkVersion();
                if(_version && _version.model != 3) {
                    // 开启自动更新，且需要在wifi状态下
                    if(appDataService.auto_upgrade && this.network.type === 'wifi') {
                                let _fileTransfer = this.upService.fileTransfer;
                                const _fileDataDirectory = this.upService.fileDataDirectory;
                                const filename = "picasso.apk";
                                _fileTransfer.download(
                                    _version.url,
                                    _fileDataDirectory + filename,
                                ).then( entry => {
                                    this.upService.openAPK(entry);
                                })
                    } else {
                        this.modalController.create(
                            VersionUpdateDialogPage,
                            { version_info: {
                                version: _version.version,
                                changelogs: _version.log,
                                // hotreload_version: "",
                                download_link_android: _version.url,
                                // download_link_ios_plist:
                                //     "itms-services://?action=download-manifest&url=https://www.ifmchain.com/download.plist",
                                // download_link_web: "https://www.ifmchain.com/downloadv2.0.html",
                                // create_time: 50000,
                                // apk_size: 66666,
                                // plist_size: 13145,
                                // "//": "……",
                                // success: true,
                                model: _version.model,
                                info: _version,
                                }
                            },
                            {
                                enterAnimation: "custom-dialog-pop-in",
                                leaveAnimation: "custom-dialog-pop-out",
                            },
                            
                        ).present()
                    }
                }
        
            }
        })()
        
        this.appSettingProvider.clearUserInfo();

        this.screenOrientation
            .lock(this.screenOrientation.ORIENTATIONS.PORTRAIT)
            .catch(err => {
                console.log("screenOrientation error:", err.message);
            });

        this.overlaysWebView();
        statusBar.hide();
        platform.ready().then(() => {
            statusBar.show();
            this.overlaysWebView();
            this.afterPlatformReady();
            this.overlaysWebView();
        });

        this.events.subscribe("show login", (status, cb?) => {
            this.events.unsubscribe("show login");
            if (cb) {
                this.modalController.create(LoginPage, { cb }).present();
            } else {
                this.loginModal.present();
            } 
            // console.log('events.subscribe:',page)
            // this.rootNav.push(page)
        });

        // // 注册账户登入状态异常事件 
        this.events.subscribe("doLogout", () => {
            if(appSettingProvider.getUserToken()) {
                this.toastCtrl.create({
                    message: "您的账户已在其他设备登陆",
                    duration: 1500,
                    position: "bottom",
                }).present();
                this.loginService.doLogout();
            }
            // this.nav.parent.select(0);
            this.nav.goToRoot({})
        });
        this.loginService.status$
            // 订阅 status$ 对象，在登录状态变化时，更改 app 的根页面。
            // 初始值（ undefined ）已经在 LoginService 中被过滤，
            // 保证传递过来的值都是布尔值。
            .subscribe(status => {
                // this.setAppRootBackground(status);

                if (status) {
                    //登陆成功获取个人信息
                    this.personalDataService
                        .personalPriceId()
                        .then(data => {
                            this.appDataService.productId = data.value || "";
                        })
                        .catch(err => {
                            console.log(
                                "loginService personalPriceId error: ",
                                err.message || err,
                            );
                        });
                } else {
                    //退出登录后订阅显示登录页事件
                    // this.events.subscribe('show login', page => {
                    //   this.events.unsubscribe('show login')
                    //   this.loginModal.present()
                    //   // this.rootNav.push(page)
                    // })
                }
            });

        this.keyboardService.init(this.renderer2);
        this.stockDataService
            .requestProducts(this.appSettings.Platform_Type)
            .then(async () => {
                console.log("product requested then", new Date());
                await this.tradeService.getTradeList();
            })
            .catch(err => {
                console.log(
                    "loginService requestProducts error: ",
                    err.message || err,
                );
            });
 
        (async () => {
            const mainproducts =
                this.appDataService.mainproducts ||
                (await this.tradeService.getMainProducts());
            console.log("::mainproducts::", mainproducts);
            return Promise.resolve(mainproducts);
        })().then((mainproducts: AnyObject[]) => {
            console.log("mainproducts::");
            for (const product of mainproducts) {
                if (product.productHouseId) {
                    console.log("mainproducts:", product);
                    this.socketioService
                        .subscribeHeaderPrice(product.productHouseId)
                        .do(data => console.log("mainproducts:::?", data))
                        .filter(data => data.type === product.productHouseId)
                        .map(data => data.data || data)
                        .do(data => console.log("mainproducts:::!", data))
                        .subscribe(data => {
                            product.symbol = data.symbol;
                            product.price = data.price;
                            product.range = data.range;
                        });
                }
            }
        });
    }

    ionViewDidLoad() {
        
    }

    async initTranslate() {
        // Set the default language for translation strings, and the current language.
        this.translate.setDefaultLang("en");
        const browserLang = 0 ? 0 : this.translate.getBrowserLang();
        let language: any;
        // language = await this.translate.use("en").toPromise();
        // this.appDataService.LANGUAGE = "en";
        language = await this.translate.use("zh").toPromise();
        this.appDataService.LANGUAGE = "zh";
        // if (browserLang) {
        //     if (browserLang === "zh") {
        //         // 简体繁体判断，当前只有简体
        //         // const browserCultureLang = this.translate.getBrowserCultureLang();
        //         // if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
        //         //   this.translate.use("zh-cmn-Hant");
        //         // } else {
        //         //   this.translate.use("zh-cmn-Hans");
        //         // }
        //         language = await this.translate.use("zh").toPromise();
        //         this.appDataService.LANGUAGE = "zh";
        //     } else {
        //         const langs = this.translate.getLangs();
        //         const current_lang = this.translate.getBrowserLang();
        //         if (langs.indexOf(current_lang) !== -1) {
        //             language = await this.translate.use(current_lang);
        //             this.appDataService.LANGUAGE = current_lang;
        //         } else {
        //             const maybe_lang =
        //                 langs.find(lang => current_lang.startsWith(lang)) ||
        //                 "en";
        //             language = await this.translate.use(maybe_lang);
        //             this.appDataService.LANGUAGE = maybe_lang;
        //         }
        //     }
        // } else {
        //     language = await this.translate.use("en").toPromise(); // Set your language here
        //     this.appDataService.LANGUAGE = "en";
        // }
        window["language"] = language;
    }

    afterPlatformReady() {
        if (this.platform.is("android")) {
            // android 的全屏模式，顶部状态栏融入 APP 。
            // 不需要修改 java 文件
            // const androidFullScreen = this.androidFullScreen;
            // androidFullScreen
            //   .isImmersiveModeSupported()
            //   .then(() => androidFullScreen.immersiveMode())
            //   .then(() => androidFullScreen.showSystemUI())
            //   .then(() => androidFullScreen.showUnderStatusBar())
            //   .catch((error: any) => console.log(error.message || error));
        } else if (this.platform.is("ios")) {
            // ios 设备需要在 platform ready 之后再设置方向锁定，
            // 并且锁定的方向应为 PORTRAIT_PRIMARY 。
            this.screenOrientation
                .lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY)
                .catch(err => {
                    console.log("screenOrientation error:", err.message);
                });
        }

        //ios 交易页面 会把视图顶出，需要用这个禁止
        if (this.platform.is("ios")) {
            this.keyboardService.disableScroll();
        }

        // this.statusBar.show()
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        this.statusBar.styleLightContent();

        // if (this.platform.is('ios')){
        //   // let status bar overlay webview
        this.statusBar.overlaysWebView(true);

        //   // set status bar to white
        // this.statusBar.backgroundColorByHexString('#00ffffff');
        // }

        // //开始判断，调整状态栏
        // this.tryOverlaysWebView(3);
        //使用异步保证页面元素准备就绪
        setTimeout(() => {
            this.splashScreen.hide();
        }, 500);

        // translate.setDefaultLang('zh_CN');

        // this.presentLoading();
    }

    _isIOS?: boolean;
    get isIOS() {
        if (this._isIOS === undefined) {
            this._isIOS = this.platform.is("ios");
        }
        return this._isIOS;
    }
    overlaysWebView() {
        this.statusBar.overlaysWebView(false);
        setTimeout(() => {
            this.statusBar.overlaysWebView(true);
            this.statusBar.styleLightContent();
        }, 50);
    }
    private _is_hide = false;
    hideSplashScreen() {
        if (this._is_hide) {
        return;
        } 
        this.splashScreen.hide();
        this._is_hide = true;
    }
    tryOverlaysWebView(loop_times: number = 0) {
        if (this.isIOS) {
          return;
        }
        if (window.innerHeight < PicassoApp.WINDOW_MAX_HEIGHT) {
          // 如果高度不对劲的话，尽可能重新搞一下
          this.overlaysWebView();
        }
        if (loop_times > 0) {
          // 等一下再看看是否修正正确了，不行就再来一次
          setTimeout(() => {
            this.tryOverlaysWebView(loop_times - 1);
          }, 500);
        }
      }

    // 设置根元素的背景，与当前激活页的背景保持大致相同，
    // 避免在软键盘弹出/收起时短暂闪现难看的背景。
    // setAppRootBackground(status: boolean) {
    //   const className = status ? "bg-in" : "bg-out";
    //   const oldClassName = status ? "bg-out" : "bg-in";
    //   const rootElem = this.appCtrl._appRoot._elementRef.nativeElement;
    //   this.renderer2.removeClass(rootElem, oldClassName);
    //   this.renderer2.addClass(rootElem, className);
    // }
}
/*获取window正确的最大高度，可能对于分屏支持有问题*/
var resizeInfo = document.createElement("div");
function onresize() {
    if (!resizeInfo.parentElement && document.body) {
        resizeInfo.style.cssText =
            "display:none;position:fixed;top:100px;left:100px;background:rgba(0,0,0,0.5);color:#FFF;opacity:0.3;pointer-events:none;";
        document.body.appendChild(resizeInfo);
    }
    resizeInfo.innerHTML += `<p>${[
        window.innerHeight,
        document.body.clientHeight,
    ]}</p>`;
    PicassoApp.WINDOW_MAX_HEIGHT = Math.max(
        PicassoApp.WINDOW_MAX_HEIGHT,
        window.innerHeight,
    );
}
onresize();
window.addEventListener("resize", onresize);
