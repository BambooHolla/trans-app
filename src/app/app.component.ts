import { Component, Renderer2, Inject } from "@angular/core";
import { Platform, Events } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { AndroidFullScreen } from "@ionic-native/android-full-screen";
import { Clipboard } from "@ionic-native/clipboard";
// import { App, NavController, LoadingController, Loading } from 'ionic-angular';
import {
  App,
  LoadingController,
  Loading,
  AlertController,
  ToastController,
  ModalController,
} from "ionic-angular";

// import { TranslateService } from '@ngx-translate/core';

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

@Component({
  templateUrl: "app.html",
})
export class PicassoApp {

  private rootPage = TabsPage    
  private loginModal = this.modalController.create(LoginPage)

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
    // translate: TranslateService,
    public renderer2: Renderer2,
  ) {
    window["platform"] = platform;
    window["alertCtrl"] = alertCtrl;
    window["loadingCtrl"] = loadingCtrl;
    window["toastCtrl"] = toastCtrl;
    window["modalCtrl"] = modalController;
    window["clipboard"] = clipboard;

    if (!navigator["clipboard"]) {
      navigator["clipboard"] = {
        writeText: text => clipboard.copy(text),
        readText: () => clipboard.paste(),
      };
    }
    this.screenOrientation
      .lock(this.screenOrientation.ORIENTATIONS.PORTRAIT)
      .catch(err => {
        console.log("screenOrientation error:", err.message);
      });
    
    this.statusBar.hide(); 
    platform.ready().then(() => {
      this.afterPlatformReady();
    });

    this.events.subscribe('show login', (status,cb?) => {
      this.events.unsubscribe('show login')
      if(cb){
        this.modalController
          .create(LoginPage, {cb})
          .present()
      }else{
        this.loginModal.present()
      }
      // console.log('events.subscribe:',page)
      // this.rootNav.push(page)      
    })

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
        }else{
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
        console.log("product requested then",new Date())
        await this.tradeService.getTradeList()
      })
      .catch(err => {
        console.log(
          "loginService requestProducts error: ",
          err.message || err,
        );
      });
      
      (async ()=>{
        const mainproducts = this.appDataService.mainproducts || 
          await this.tradeService.getMainProducts()
        console.log('::mainproducts::', mainproducts)
        return Promise.resolve(mainproducts)
      })()
        .then((mainproducts:AnyObject[]) =>{
          console.log('mainproducts::')
          for (const product of mainproducts){
            if (product.productId){
              console.log('mainproducts:', product)
              this.socketioService.subscribeHeaderPrice(product.productId)
                .do(data => console.log('mainproducts:::?', data))
                .filter(data=>data.type === product.productId)
                .map(data => data.data || data)
                .do(data => console.log('mainproducts:::!',data))
                .subscribe(data=>{
                  product.symbol = data.symbol
                  product.price = data.price
                  product.range = data.range
                })
            }
          }
        })
  }

  ionViewDidLoad() {
  }

  afterPlatformReady() {
    if (this.platform.is("android")) {
      // android 的全屏模式，顶部状态栏融入 APP 。
      // 不需要修改 java 文件
      const androidFullScreen = this.androidFullScreen;
      androidFullScreen
        .isImmersiveModeSupported()
        .then(() => androidFullScreen.immersiveMode())
        .then(() => androidFullScreen.showSystemUI())
        .then(() => androidFullScreen.showUnderStatusBar())
        .catch((error: any) => console.log(error.message || error));
    } else if (this.platform.is("ios")) {
      // ios 设备需要在 platform ready 之后再设置方向锁定，
      // 并且锁定的方向应为 PORTRAIT_PRIMARY 。
      this.screenOrientation
        .lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY)
        .catch(err => {
          console.log("screenOrientation error:", err.message);
        });
    }

    // this.keyboardService.disableScroll();

    this.statusBar.show()
    // Okay, so the platform is ready and our plugins are available.
    // Here you can do any higher level native things you might need.
    this.statusBar.styleLightContent();

    // if (this.platform.is('ios')){
    //   // let status bar overlay webview
      this.statusBar.overlaysWebView(true);

    //   // set status bar to white
    //   this.statusBar.backgroundColorByHexString('#00ffffff');
    // }

    //使用异步保证页面元素准备就绪
    setTimeout(()=> this.splashScreen.hide()
      , 300) 

    // translate.setDefaultLang('zh_CN');

    // this.presentLoading();
    
    //android页面高度不正确，调整
    this.tryOverlaysWebVie(2)
  }
  
  overlaysWebView(){
    this.statusBar.overlaysWebView(false);
    setTimeout(() => {
      this.statusBar.overlaysWebView(true);
    }, 50);
  }
  tryOverlaysWebVie(num:number = 0){
    if(this.platform.is('ios')){
      return ;
    }
    if(this.keyboardService.fullHeight > window.innerHeight){
      this.overlaysWebView();
    }
    if(num > 0){
      setTimeout(() => {
        this.tryOverlaysWebVie(num - 1)
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
