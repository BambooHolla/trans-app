import { Component, Renderer2 } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';

// import { App, NavController, LoadingController, Loading } from 'ionic-angular';
import { App, LoadingController, Loading } from 'ionic-angular';

// import { TranslateService } from '@ngx-translate/core';

// import { LoadingPage } from '../pages/loading/loading';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { EntrancePage } from '../pages/entrance/entrance';

import { AppSettings } from '../providers/app-settings';
import { KeyboardService } from '../providers/keyboard-service';
import { LoginService } from '../providers/login-service';
import { AppDataService } from '../providers/app-data-service';
import { SocketioService } from '../providers/socketio-service';
import { StockDataService } from '../providers/stock-data-service';
import { TradeService } from '../providers/trade-service';
import { PersonalDataService } from "../providers/personal-data-service";

@Component({
  templateUrl: 'app.html'
})
export class GjsApp {
  rootPage: any;

  private loader: Loading;

  private loginChecked: boolean = false;

  presentLoading(val) {
    if (!this.loginChecked) {
      this.loader = this.loadingCtrl.create({
        content: val
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
    public loginService: LoginService,
    public appDataService: AppDataService,
    public appSettings: AppSettings,
    public keyboardService: KeyboardService,
    public screenOrientation: ScreenOrientation,
    public androidFullScreen: AndroidFullScreen,
    public personalDataService:PersonalDataService,
    public stockDataService: StockDataService,
    public socketioService: SocketioService,
    public tradeService: TradeService,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    // translate: TranslateService,
    public renderer2: Renderer2
  ) {
    this.screenOrientation
      .lock(this.screenOrientation.ORIENTATIONS.PORTRAIT)
      .catch(err => {
        console.log('screenOrientation error:', err.message);
      });

    this.loginService.status$
      // 订阅 status$ 对象，在登录状态变化时，更改 app 的根页面。
      // 初始值（ undefined ）已经在 LoginService 中被过滤，
      // 保证传递过来的值都是布尔值。
      .subscribe(status => {
        // console.log('login status changed: ', status);

        const targetPage = status ? TabsPage : LoginPage; //EntrancePage;
        if (!this.rootPage) {
          if (location.hash.length > 2) {
            // 如果有hash，使用默认的deeplink来进行路由
          } else {
            this.rootPage = targetPage;
          }

          // rootPage 为空，表示刚刚进入 app ，
          // 需要在登录状态确认后进行初始化操作。
          platform.ready().then(() => {
            this.afterPlatformReady();
          });
        } else {
          const rootNav = this.appCtrl.getRootNav();
          const topPage = rootNav.last().component;

          if (targetPage !== topPage) {
            const direction = status ? 'forward' : 'back';
            rootNav.setRoot(
              targetPage,
              {},
              {
                direction,
                animation: 'ios-transition',
                animate: true
              }
            );
          }
        }

        this.setAppRootBackground(status);

        //登陆成功获取股票列表
        if(status){
          this.stockDataService.requestProducts(this.appSettings.Platform_Type)
            .then(()=>{
              this.tradeService.getTradeList()
            })
            .catch(err => {
              console.log('loginService requestProducts error: ', err.message || err);
            });
          this.personalDataService.personalPriceId()
            .then(data=>{
              this.appDataService.productId = data.value || ''
            })
            .catch(err => {
              console.log('loginService personalPriceId error: ', err.message || err);
            });
        }
      });

    this.keyboardService.init(this.renderer2);
  }

  ionViewDidLoad() {}

  afterPlatformReady() {
    if (this.platform.is('android')) {
      // android 的全屏模式，顶部状态栏融入 APP 。
      // 不需要修改 java 文件
      const androidFullScreen = this.androidFullScreen;
      androidFullScreen
        .isImmersiveModeSupported()
        .then(() => androidFullScreen.immersiveMode())
        .then(() => androidFullScreen.showSystemUI())
        .then(() => androidFullScreen.showUnderStatusBar())
        .catch((error: any) => console.log(error.message || error));
    } else if (this.platform.is('ios')) {
      // ios 设备需要在 platform ready 之后再设置方向锁定，
      // 并且锁定的方向应为 PORTRAIT_PRIMARY 。
      this.screenOrientation
        .lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY)
        .catch(err => {
          console.log('screenOrientation error:', err.message);
        });
    }

    this.keyboardService.disableScroll();

    // Okay, so the platform is ready and our plugins are available.
    // Here you can do any higher level native things you might need.
    this.statusBar.styleLightContent();

    // if (this.platform.is('ios')){
    //   // let status bar overlay webview
    //   this.statusBar.overlaysWebView(true);

    //   // set status bar to white
    //   this.statusBar.backgroundColorByHexString('#00ffffff');
    // }

    this.splashScreen.hide();

    // translate.setDefaultLang('zh_CN');

    // this.presentLoading();
  }

  // 设置根元素的背景，与当前激活页的背景保持大致相同，
  // 避免在软键盘弹出/收起时短暂闪现难看的背景。
  setAppRootBackground(status: boolean) {
    const className = status ? 'bg-in' : 'bg-out';
    const oldClassName = status ? 'bg-out' : 'bg-in';
    const rootElem = this.appCtrl._appRoot._elementRef.nativeElement;
    this.renderer2.removeClass(rootElem, oldClassName);
    this.renderer2.addClass(rootElem, className);
  }
}
