import { NgModule, ErrorHandler } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
// import { HttpModule, Http } from '@angular/http';
import { HttpModule } from '@angular/http';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import 'intl';
import 'intl/locale-data/jsonp/en';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';

// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { GjsApp } from './app.component';

import { LoadingPage } from '../pages/loading/loading';
import { NewsListPage } from '../pages/news-list/news-list';
import { TabsPage } from '../pages/tabs/tabs';
import { InfoTabsPage } from '../pages/info-tabs/info-tabs';
import { AboutPage } from '../pages/about/about';
import { HelpPage } from '../pages/help/help';
import { AccountCenterPage } from '../pages/account-center/account-center';
import { ChangeTradePassword } from '../pages/change-trade-password/change-trade-password';
import { ContactPage } from '../pages/contact/contact';
import { OptionalPage } from '../pages/optional/optional';
import { EntrancePage } from '../pages/entrance/entrance';
import { LoginPage } from '../pages/login/login';
import { CreateAccountPromptPage } from '../pages/create-account-prompt/create-account-prompt';
import { CreateAccountStepFirstPage } from '../pages/create-account-step-first/create-account-step-first';
import { CreateAccountStepSecondPage } from '../pages/create-account-step-second/create-account-step-second';
import { CreateAccountStepThirdPage } from '../pages/create-account-step-third/create-account-step-third';
import { CreateAccountConfirmPage } from '../pages/create-account-confirm/create-account-confirm';
import { IdentificationPage } from '../pages/identification/identification';
import { AuthPendingPage } from '../pages/auth-pending/auth-pending';
import { HomePage } from '../pages/home/home';
// import { NewsContentModule } from '../pages/news-content/news-content.module';
// import { NoticePage } from '../pages/notice/notice';
// import { NoticeListPage } from '../pages/notice-list/notice-list';
import { QuotationDetailPage } from '../pages/quotation-detail/quotation-detail';
import { FundStatementPage } from '../pages/fund-statement/fund-statement';
import { ImagePickerPage } from "../pages/image-picker/image-picker";
import { CommissionListPage } from '../pages/commission-list/commission-list';
import { HistoryRecordPage } from '../pages/history-record/history-record';
import { QuotationsPage } from '../pages/quotations/quotations';
import { TradeInterfacePage } from '../pages/trade-interface/trade-interface';
import { StockDetailPage } from '../pages/stock-detail/stock-detail';



import { InputModal } from '../modals/input/input';
import { InformationModal } from '../modals/information-modal/information-modal';
import { CameraModal } from '../modals/camera/camera';

import { AppSettings } from '../providers/app-settings';
import { AppDataService } from '../providers/app-data-service';
import { HttpService } from '../providers/http-service';
import { AppService } from '../providers/app.service.ts';
import { SocketioService } from '../providers/socketio-service';
import { LoginService } from '../providers/login-service';
import { AlertService } from '../providers/alert-service';
import { KeyboardService } from '../providers/keyboard-service';
import { ImagePickerService } from '../providers/image-picker-service';
import { StockDataService } from '../providers/stock-data-service';
import { PersonalDataService } from '../providers/personal-data-service';
import { TradeService } from '../providers/trade-service';
import { NoticeListModel } from '../providers/models/notice-list-model';

import { ImageTakerController, ImageTakerCmp } from '../components/image-taker-controller';


import { BnHeaderComponent } from '../components/bn-header/bn-header';
import { BnMenuComponent } from '../components/bn-menu/bn-menu';

// import { RiseOrFallPipe } from '../pipes/rise-or-fall';
// import { NumReplacePipe } from '../pipes/num-replace';
// import { PositiveSignPipe } from '../pipes/positive-sign';

import { EchartsBaseComponent } from '../components/echarts-base/echarts-base';
import { SmoothlineComponent } from '../components/smoothline/smoothline';
import { PieComponent } from '../components/pie/pie';
import { BarComponent } from '../components/bar/bar';
import { LiquidComponent } from '../components/liquid/liquid';
import { CandlestickComponent } from '../components/candlestick/candlestick';
import { VolumnComponent } from '../components/volumn/volumn';
import { DistancelineComponent } from '../components/distanceline/distanceline';
import { RealTimeChartsComponent } from '../components/realtime-charts/realtime-charts';




import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { CameraPreview } from '@ionic-native/camera-preview';
import { ImagePicker } from '@ionic-native/image-picker';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';

//引入资讯模块
import { InformationModule } from '../pages/information/information.module';

// import { InformationSlideModule } from '../pages/information-slide/information-slide.module';

import { RecommendPage } from '../pages/recommend/recommend';
// import { TriColListComponent } from "../components/tri-col-list/tri-col-list";
// import { SearchItemPage } from "../pages/search-item/search-item-page";
import { LoopSlidesComponent } from "../components/loop-slides/loop-slides";
import { ListSharedModule } from "../shared/list-shared.module";
import { SearchItemPageModule } from "../pages/search-item/search-item-page.module";
import { BaseSharedModule } from "../shared/base-shared.module";
import { LoopSlidesBetaComponent } from '../components/loop-slides-beta/loop-slides-beta';
import { TransferPage } from "../pages/transfer/transfer";
// import { BankCode2NamePipe } from '..\pipes\bank-code2-name/bank-code2-name';
// import { FileService } from '../providers/file.service';
// import { IsLoadingDirective } from '../directives/is-loading/is-loading';

// export function createTranslateLoader(http: Http) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

// const appRoutes: Routes = [
//   {
//     path: '',
//     component: TabsPage,
//     // data: { title: 'Heroes List' }
//   },
//   {
//     path: 'login',
//     component: LoginPage,
//     // redirectTo: '/heroes',
//     // pathMatch: 'full',
//   },
//   // { path: '**', component: PageNotFoundComponent }
// ];

// 使用 @NgModule 装饰器注入的 entryComponents 以及 providers 等可以在整个应用中被访问
@NgModule({
  declarations: [
    LoopSlidesComponent,
    GjsApp,
    TransferPage,
    // MyselfPage,
    CreateAccountPromptPage,
    CreateAccountStepFirstPage,
    CreateAccountStepSecondPage,
    CreateAccountStepThirdPage,
    CreateAccountConfirmPage,
    IdentificationPage,
    AuthPendingPage,
    EntrancePage,
    LoadingPage,
    TabsPage,
    InfoTabsPage,
    AboutPage,
    HelpPage,
    AccountCenterPage,
    ChangeTradePassword,
    ContactPage,
    OptionalPage,
    // TriColListComponent,
    LoginPage,
    HomePage,
    QuotationDetailPage,
    FundStatementPage,
    CommissionListPage,
    HistoryRecordPage,
    QuotationsPage,
    TradeInterfacePage,
    StockDetailPage,
    // NoticeListPage,
    // NoticePage,
    // NewsContent,
    // SearchItemPage,
    ImagePickerPage,
    InformationModal,
    InputModal,
    CameraModal,
    BnHeaderComponent,
    BnMenuComponent,
    // RiseOrFallPipe,
    // NumReplacePipe,
    // PositiveSignPipe,
    RecommendPage,
    // RichText,
    EchartsBaseComponent,
    SmoothlineComponent,
    PieComponent,
    BarComponent,
    LiquidComponent,
    CandlestickComponent,
    VolumnComponent,
    DistancelineComponent,
    RealTimeChartsComponent,
    // ImageTakerController,
    ImageTakerCmp,
    LoopSlidesBetaComponent,
    // BankCode2NamePipe,
    // IsLoadingDirective,
  ],
  imports: [
    // NewsContentModule,
    IonicModule.forRoot(GjsApp,  {
      backButtonText: '',
      iconMode: 'ios', // ui 统一使用 ios platform 模式
      //modalEnter: 'modal-fade-in',
      //modalLeave: 'modal-slide-out',
      // tabsPlacement: 'bottom',
      // pageTransition: 'ios-transition',
      tabsHideOnSubPages: true,
    }),
    IonicStorageModule.forRoot(),
    BrowserModule,
    HttpModule,
    // TranslateModule.forRoot({
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: (createTranslateLoader),
    //     deps: [Http]
    //   }
    // }),
    ListSharedModule,
    InformationModule,
    BaseSharedModule,

    SearchItemPageModule,
    // InformationSlideModule,
    // RouterModule.forChild(appRoutes),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    NewsListPage,
    LoopSlidesComponent,
    GjsApp,
    TransferPage,
    // MyselfPage,
    CreateAccountPromptPage,
    CreateAccountStepFirstPage,
    CreateAccountStepSecondPage,
    CreateAccountStepThirdPage,
    CreateAccountConfirmPage,
    IdentificationPage,
    AuthPendingPage,
    EntrancePage,
    LoadingPage,
    TabsPage,
    InfoTabsPage,
    AboutPage,
    HelpPage,
    AccountCenterPage,
    ChangeTradePassword,
    ContactPage,
    HomePage,
    QuotationDetailPage,
    FundStatementPage,
    CommissionListPage,
    HistoryRecordPage,
    QuotationsPage,
    TradeInterfacePage,
    StockDetailPage,
    OptionalPage,
    // SearchItemPage,
    LoginPage,
    // NoticeListPage,
    // NoticePage,
    ImagePickerPage,
    InformationModal,
    InputModal,
    CameraModal,
    // RichText,
    RecommendPage,
    BnHeaderComponent,
    BnMenuComponent,
    EchartsBaseComponent,
    SmoothlineComponent,
    PieComponent,
    BarComponent,
    LiquidComponent,
    CandlestickComponent,
    VolumnComponent,
    DistancelineComponent,
    ImageTakerCmp,
    RealTimeChartsComponent,
  ],
  providers: [
    AppService,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Keyboard,
    CameraPreview,
    ImagePicker,
    AndroidPermissions,
    ScreenOrientation,
    AndroidFullScreen,
    AppSettings,
    AppDataService,
    HttpService,
    SocketioService,
    LoginService,
    AlertService,
    KeyboardService,
    ImagePickerService,
    StockDataService,
    PersonalDataService,
    TradeService,
    // CameraModal,
    ImageTakerController, 
    // FileService,
    // RiseOrFallPipe,
    // NumReplacePipe,
    // PositiveSignPipe,
    NoticeListModel,
  ]
})
export class AppModule {}
