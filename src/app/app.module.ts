import { NgModule, ErrorHandler } from "@angular/core";
// import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from "@angular/platform-browser";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { HttpModule } from "@angular/http";

import { IonicApp, IonicModule, IonicErrorHandler } from "ionic-angular";
import { IonicStorageModule } from "@ionic/storage";

import "intl";
import "intl/locale-data/jsonp/en";

import "rxjs/add/operator/do";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/delay";

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { PicassoApp } from "./app.component";

import { LoadingPage } from "../pages/loading/loading";
import { NewsListPage } from "../pages/news-list/news-list";
import { TabsPage } from "../pages/tabs/tabs";
import { InfoTabsPage } from "../pages/info-tabs/info-tabs";
import { AboutPageModule } from "../pages/about/about.module";
import { HelpPage } from "../pages/help/help";
import { AccountCenterPage } from "../pages/account-center/account-center";
import { ChangeTradePassword } from "../pages/change-trade-password/change-trade-password";
import { ContactPage } from "../pages/contact/contact";
import { OptionalPage } from "../pages/optional/optional";
import { EntrancePage } from "../pages/entrance/entrance";
import { LoginPage } from "../pages/login/login";
import { ForgetPwdPage } from "../pages/forget-pwd/forget-pwd";
import { ModifyPwdPage } from "../pages/modify-pwd/modify-pwd";
import { RegisterPage } from "../pages/register/register";
import { CreateAccountPromptPage } from "../pages/create-account-prompt/create-account-prompt";
import { CreateAccountStepFirstPage } from "../pages/create-account-step-first/create-account-step-first";
import { CreateAccountStepSecondPage } from "../pages/create-account-step-second/create-account-step-second";
import { CreateAccountStepThirdPage } from "../pages/create-account-step-third/create-account-step-third";
import { CreateAccountConfirmPage } from "../pages/create-account-confirm/create-account-confirm";
import { IdentificationPage } from "../pages/identification/identification";
import { AuthPendingPage } from "../pages/auth-pending/auth-pending";
import { HomePage } from "../pages/home/home";


import { SubmitRealInfoPage } from "../pages/submit-real-info/submit-real-info";
import { SetPayPwdPage } from "../pages/set-pay-pwd/set-pay-pwd";
import { WithdrawAddressListPage } from "../pages/withdraw-address-list/withdraw-address-list";
import { WorkOrderListPage } from "../pages/work-order-list/work-order-list";
import { WorkOrderAddPage } from "../pages/work-order-add/work-order-add";
import { WorkOrderDetailPage } from "../pages/work-order-detail/work-order-detail";
/**+ from BNLC framework*/
import { RechargeGatewayPage } from "../pages/recharge-gateway/recharge-gateway";
import { RechargeDetailPage } from "../pages/recharge-detail/recharge-detail";
import { WithdrawGatewayPage } from "../pages/withdraw-gateway/withdraw-gateway";
import { WithdrawDetailPage } from "../pages/withdraw-detail/withdraw-detail";
import { AccountCenterV2Page } from "../pages/account-center-v2/account-center-v2";
import { AddAddressPage } from "../pages/add-address/add-address";
import { AppSettingProvider } from "../bnlc-framework/providers/app-setting/app-setting";
import { AppFetchProvider } from "../bnlc-framework/providers/app-fetch/app-fetch";
import { DirectivesModule as BNLC_DirectivesModule } from "../bnlc-framework/directives/directives.module";

import { DirectivesModule } from "../directives/directives.module";

/**- from BNLC framework*/

// import { NewsContentModule } from '../pages/news-content/news-content.module';
// import { NoticePage } from '../pages/notice/notice';
// import { NoticeListPage } from '../pages/notice-list/notice-list';
import { QuotationDetailPage } from "../pages/quotation-detail/quotation-detail";
import { FundStatementPage } from "../pages/fund-statement/fund-statement";
import { ImagePickerPage } from "../pages/image-picker/image-picker";
import { CommissionListPage } from "../pages/commission-list/commission-list";
import { HistoryRecordPage } from "../pages/history-record/history-record";
import { QuotationsPageV2 } from "../pages/quotations-v2/quotations-v2";
import { TradeInterfacePage } from "../pages/trade-interface/trade-interface";
import { TradeInterfaceV2Page } from "../pages/trade-interface-v2/trade-interface-v2";
import { TradeChartV2Page } from "../pages/trade-chart-v2/trade-chart-v2";
import { StockDetailPage } from "../pages/stock-detail/stock-detail";

import { InputModal } from "../modals/input/input";
import { InformationModal } from "../modals/information-modal/information-modal";
import { CameraModal } from "../modals/camera/camera";

import { AppSettings } from "../providers/app-settings";
import { AppDataService } from "../providers/app-data-service";
import { HttpService } from "../providers/http-service";
import { AppService } from "../providers/app.service";
import { SocketioService } from "../providers/socketio-service";
import { LoginService } from "../providers/login-service";
import { RegisterService } from "../providers/register-service";
import { AlertService } from "../providers/alert-service";
import { KeyboardService } from "../providers/keyboard-service";
import { ImagePickerService } from "../providers/image-picker-service";
import { StockDataService } from "../providers/stock-data-service";
import { PersonalDataService } from "../providers/personal-data-service";
import { TradeService } from "../providers/trade-service";
import { NoticeListModel } from "../providers/models/notice-list-model";

import {
    ImageTakerController,
    ImageTakerCmp,
} from "../components/image-taker-controller";

import { BnHeaderComponent } from "../components/bn-header/bn-header";
import { BnMenuComponent } from "../components/bn-menu/bn-menu";
import { CommonAlert } from "../components/common-alert/common-alert";
import { CustomizeAlert } from "../modals/customize-alert/customize-alert";

// import { RiseOrFallPipe } from '../pipes/rise-or-fall';
// import { NumReplacePipe } from '../pipes/num-replace';
// import { PositiveSignPipe } from '../pipes/positive-sign';
import { QuantityConversionPipe } from "../pipes/quantity-conversion";
import { PriceConversionPipe } from "../pipes/price-conversion";

import { EchartsBaseComponent } from "../components/echarts-base/echarts-base";
import { KlineEchartsBaseComponent } from "../components/kline-base/kline-base";
import { SmoothlineComponent } from "../components/smoothline/smoothline";
import { PieComponent } from "../components/pie/pie";
import { BarComponent } from "../components/bar/bar";
import { LiquidComponent } from "../components/liquid/liquid";
import { CandlestickComponent } from "../components/candlestick/candlestick";
import { VolumnComponent } from "../components/volumn/volumn";
import { DistancelineComponent } from "../components/distanceline/distanceline";
import { RealTimeChartsComponent } from "../components/realtime-charts/realtime-charts";
import { ComponentsModule } from "../components/components.module";

import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Keyboard } from "@ionic-native/keyboard";
import { CameraPreview } from "@ionic-native/camera-preview";
import { ImagePicker } from "@ionic-native/image-picker";
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { AndroidFullScreen } from "@ionic-native/android-full-screen";
import { Clipboard } from "@ionic-native/clipboard";
import { Device } from "@ionic-native/device";
import { Geolocation } from "@ionic-native/geolocation";
//引入资讯模块
import { InformationModule } from "../pages/information/information.module";

// import { InformationSlideModule } from '../pages/information-slide/information-slide.module';

import { RecommendPage } from "../pages/recommend/recommend";
// import { TriColListComponent } from "../components/tri-col-list/tri-col-list";
// import { SearchItemPage } from "../pages/search-item/search-item-page";
import { LoopSlidesComponent } from "../components/loop-slides/loop-slides";
import { ListSharedModule } from "../shared/list-shared.module";
import { SearchItemPageModule } from "../pages/search-item/search-item-page.module";
import { BaseSharedModule } from "../shared/base-shared.module";
import { LoopSlidesBetaComponent } from "../components/loop-slides-beta/loop-slides-beta";
import { TransferPage } from "../pages/transfer/transfer";
import { LoginPageModule } from "../pages/login/login.module";
import { ForgetPwdPageModule } from "../pages/forget-pwd/forget-pwd.module";
import { ModifyPwdPageModule } from "../pages/modify-pwd/modify-pwd.module";
import { RegisterPageModule } from "../pages/register/register.module";
import { RealtimeReportComponent } from "../components/realtime-report/realtime-report";
import { KlineReportComponent } from "../components/kline-report/kline-report";
import { AccountServiceProvider } from "../providers/account-service/account-service";
import { KjuaQrcodeComponent } from "../components/kjua-qrcode/kjua-qrcode";
import { EntrustServiceProvider } from "../providers/entrust-service";
import { FsProvider } from "../providers/fs/fs";
import { ProductId2namePipe } from "../pipes/product-id2name";
import { IdentificationNumberCheckerProvider } from "../providers/identification-number-checker/identification-number-checker";
import { NewsServiceProvider } from "../providers/news-service/news-service";
import { InviteCommissionServiceProvider } from "../providers/invite-commission-service/invite-commission-service";
import { WorkOrderServiceProvider } from "../providers/work-order-service/work-order-service";
import { InviteCommissionPage } from "../pages/invite-commission/invite-commission";
import { QuotationsPage } from "../pages/quotations/quotations";
import { PromptControlleService } from "../providers/prompt-controlle-service";
import { CryptoService } from "../providers/crypto-service";
import { SwitchNetworkPage } from "../pages/switch-network/switch-network";
import { GestureLockPage } from "../pages/gesture-lock/gesture-lock";
import { CurrencyTypeListPage } from "../pages/currency-type-list/currency-type-list";

// import { BankCode2NamePipe } from '..\pipes\bank-code2-name/bank-code2-name';
// import { FileService } from '../providers/file.service';
// import { IsLoadingDirective } from '../directives/is-loading/is-loading';
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
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
        RechargeGatewayPage,
        RechargeDetailPage,
        WithdrawGatewayPage,
        WithdrawDetailPage,
        AccountCenterV2Page,
        AddAddressPage,
        LoopSlidesComponent,
        PicassoApp,
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
        HelpPage,
        AccountCenterPage,
        ChangeTradePassword,
        ContactPage,
        OptionalPage,
        // TriColListComponent,
        // LoginPage,
        // RegisterPage,
        SubmitRealInfoPage,
        SetPayPwdPage,
        WithdrawAddressListPage,
        WorkOrderListPage,
        WorkOrderAddPage,
        WorkOrderDetailPage,
        HomePage,
        GestureLockPage,
        QuotationDetailPage,
        FundStatementPage,
        CommissionListPage,
        HistoryRecordPage,
        QuotationsPage, //v2版本中其实不需要这个页面.但是angular编译会遍历目录,从而报错没有引入此页面的(即使项目中实际上并没有用到!贼傻逼!)
        QuotationsPageV2,
        TradeInterfacePage,
        TradeInterfaceV2Page,
        TradeChartV2Page,
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
        KlineEchartsBaseComponent,
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
        RealtimeReportComponent,
        KlineReportComponent,
        QuantityConversionPipe,
        PriceConversionPipe,
        ProductId2namePipe,
        KjuaQrcodeComponent,
        // BankCode2NamePipe,
        // IsLoadingDirective,
        CommonAlert,
        InviteCommissionPage,
        CustomizeAlert,
        SwitchNetworkPage,
        CurrencyTypeListPage,
    ],
    imports: [
        // NewsContentModule,

        IonicModule.forRoot(
            PicassoApp,
            {
                backButtonText: "",
                mode: "ios",
                iconMode: "ios", // ui 统一使用 ios platform 模式
                //modalEnter: 'modal-fade-in',
                //modalLeave: 'modal-slide-out',
                // tabsPlacement: 'bottom',
                // pageTransition: 'ios-transition',
                pageTransition: "common-transition",
                statusbarPadding: true,
                tabsHideOnSubPages: true,
            },
            {
                links: [
                    //+ from BNLC framwork
                    { component: TabsPage, name: "tabs" },
                    {
                        component: OptionalPage,
                        name: "optional",
                        defaultHistory: [TabsPage],
                    },
                    {
                        component: TradeInterfaceV2Page,
                        name: "exchange",
                        defaultHistory: [TabsPage],
                    },
                    {
                        component: QuotationsPageV2,
                        name: "quotations",
                        defaultHistory: [TabsPage],
                    },
                    {
                        component: NewsListPage,
                        name: "news",
                        defaultHistory: [TabsPage],
                    },
                    {
                        component: HomePage,
                        name: "home",
                        defaultHistory: [TabsPage],
                    },
                    {
                        component: RechargeGatewayPage,
                        name: "recharge-gateway",
                    },
                    { component: RechargeDetailPage, name: "recharge-detail" },
                    {
                        component: WithdrawGatewayPage,
                        name: "withdraw-gateway",
                    },
                    { component: WithdrawDetailPage, name: "withdraw-detail" },
                    {
                        component: AccountCenterV2Page,
                        name: "account-center-v2",
                    },
                    { component: AddAddressPage, name: "add-address" },
                    {
                        component: AccountCenterPage,
                        name: "account-center-old",
                    },
                    { component: SubmitRealInfoPage, name: "submit-real-info" },
                    { component: SetPayPwdPage, name: "set-pay-pwd" },
                    {
                        component: WithdrawAddressListPage,
                        name: "withdraw-address-list",
                    },
                    { component: WorkOrderListPage, name: "work-order-list" },
                    { component: WorkOrderAddPage, name: "work-order-add" },
                    {
                        component: WorkOrderDetailPage,
                        name: "work-order-detail",
                    },
                    //- from BNLC framwork

                    { component: LoginPage, name: "login" },
                    { component: ForgetPwdPage, name: "forget-pwd" },
                    { component: ModifyPwdPage, name: "modify-pwd" },
                    { component: RegisterPage, name: "register" },
                    { component: GestureLockPage, name: "gesture-lock"}
                ],
            },
        ),
        IonicStorageModule.forRoot(),
        LoginPageModule,
        RegisterPageModule,
        AboutPageModule,
        ForgetPwdPageModule,
        ModifyPwdPageModule,
        BrowserModule,
        HttpModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            },
        }),
        ListSharedModule,
        InformationModule,
        BaseSharedModule,

        SearchItemPageModule,
        ComponentsModule,
        BNLC_DirectivesModule,
        DirectivesModule,

        // InformationSlideModule,
        // RouterModule.forChild(appRoutes),
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        SubmitRealInfoPage,
        SetPayPwdPage,
        WithdrawAddressListPage,
        WorkOrderListPage,
        WorkOrderAddPage,
        WorkOrderDetailPage,

        RechargeGatewayPage,
        RechargeDetailPage,
        WithdrawGatewayPage,
        WithdrawDetailPage,
        AccountCenterV2Page,
        AddAddressPage,
        NewsListPage,
        LoopSlidesComponent,
        PicassoApp,
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
        HelpPage,
        AccountCenterPage,
        ChangeTradePassword,
        ContactPage,
        HomePage,
        GestureLockPage,
        QuotationDetailPage,
        FundStatementPage,
        CommissionListPage,
        HistoryRecordPage,
        QuotationsPageV2,
        TradeInterfacePage,
        TradeInterfaceV2Page,
        TradeChartV2Page,
        StockDetailPage,
        OptionalPage,
        // SearchItemPage,
        LoginPage,
        RegisterPage,
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
        KlineEchartsBaseComponent,
        SmoothlineComponent,
        PieComponent,
        BarComponent,
        LiquidComponent,
        CandlestickComponent,
        VolumnComponent,
        DistancelineComponent,
        ImageTakerCmp,
        RealTimeChartsComponent,
        CommonAlert,
        InviteCommissionPage,
        CustomizeAlert,
        SwitchNetworkPage,
        CurrencyTypeListPage,
    ],
    providers: [
        AppService,
        StatusBar,
        SplashScreen,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        Keyboard,
        CameraPreview,
        ImagePicker,
        AndroidPermissions,
        ScreenOrientation,
        AndroidFullScreen,
        Clipboard,
        AppSettings,
        AppDataService,
        HttpService,
        SocketioService,
        LoginService,
        RegisterService,
        AlertService,
        KeyboardService,
        ImagePickerService,
        StockDataService,
        PersonalDataService,
        TradeService,
        Device,
        Geolocation,
        // CameraModal,
        ImageTakerController,
        // FileService,
        // RiseOrFallPipe,
        // NumReplacePipe,
        // PositiveSignPipe,
        /*from BNLC framework*/
        AppSettingProvider,
        AppFetchProvider,
        NoticeListModel,
        EntrustServiceProvider,
        AccountServiceProvider,
        FsProvider,
        IdentificationNumberCheckerProvider,
        NewsServiceProvider,
        InviteCommissionServiceProvider,
        WorkOrderServiceProvider,
        PromptControlleService,
        CryptoService,
    ],
})
export class AppModule {}
