import { Component, DoCheck  } from "@angular/core";
import { Storage } from "@ionic/storage";
import { NavController, NavParams, Events } from "ionic-angular";
import { ChangeTradePassword } from "../change-trade-password/change-trade-password";

import { LoginService } from "../../providers/login-service";
import { AppDataService } from "../../providers/app-data-service";
import { PersonalDataService } from "../../providers/personal-data-service";

import { CreateAccountStepSecondPage } from "../create-account-step-second/create-account-step-second";
import { CreateAccountStepThirdPage } from "../create-account-step-third/create-account-step-third";
import { AccountServiceProvider } from "../../providers/account-service/account-service";
import { SecondLevelPage } from "../../bnlc-framework/SecondLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
import { SwitchNetworkPage } from "../switch-network/switch-network";
import { CurrencyTypeListPage } from "../currency-type-list/currency-type-list";
import { CurrencySettingPage } from "../_account/currency-setting/currency-setting";
@Component({
    selector: "account-center",
    templateUrl: "account-center.html",
})
export class AccountCenterPage extends SecondLevelPage {
    private login_status: boolean;
    private hasGestureLock: boolean = false;
    private hasGestureLockToggle: boolean = false;
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public events: Events,
        public loginService: LoginService,
        public appDataService: AppDataService,
        public accountService: AccountServiceProvider,
        public personalDataService: PersonalDataService,
        public storage: Storage,
    ) {
        super(navCtrl, navParams);
        this.loginService.status$.subscribe(status => {
            this.login_status = status;
            if (status) {
                this.gestureLockObj();
                this.checkHasAccountPWD();
            }
        });
        if (this.personalDataService.certifiedStatus == "1") {
            this.personalDataService.requestCertifiedStatus();
        }
    }

    has_account_pwd = false;
    loading_has_account_pwd = true;

    @AccountCenterPage.willEnter
    @asyncCtrlGenerator.error("@@GAIN_TRANSACTION_PASSWORD_ERROR") 
    async checkHasAccountPWD() {
        this.loading_has_account_pwd = true;
        this.has_account_pwd = await this.accountService.hasAccountPwd.getPromise();
        this.loading_has_account_pwd = false;
    }

    openPage() {
        this.navCtrl.push(ChangeTradePassword);
    }

    network() {
        this.navCtrl.push(SwitchNetworkPage);
    }
    currencyTypePage() {
        this.navCtrl.push(CurrencyTypeListPage)
    }
    identify() {
        if (
            this.personalDataService.certifiedStatus == "1" ||
            this.personalDataService.certifiedStatus == "2"
        ) {
            return void 0;
        }
        this.navCtrl.push("submit-real-info");
    }

    financeAccount() {
        this.navCtrl.push(CreateAccountStepSecondPage);
    }

    showLogin() {
        this.events.publish("show login", "login");
    }

    doLogout() {
        // this.storage.remove("gestureLockObj");
        this.loginService
            .doLogout()
            .then(success => {
                if (success)
                    this.navCtrl.pop({
                        animate: true,
                        direction: "back",
                        animation: "ios-transition",
                    });
                // this.routeTo('quotations')
                this.navCtrl.parent.select(0);
            })
            .catch();
    }
    async gestureLockObj() {
        await this.storage.get('gestureLockObj').then( data => {
            if(data) {
                this.hasGestureLock = true;
                this.hasGestureLockToggle = true;
                this._run_once = true;
            } else {
                this.hasGestureLock = false;
                this.hasGestureLockToggle = false;
            }
        })
    }
    goGestureLock() {
        this.navCtrl.push('gesture-lock',{
            hasGestureLock: this.hasGestureLock,
            backFn: this.gestureLockObj.bind(this)
        })
    }
    private _run_once: boolean = true;
    gestureLockFunc() {
        if(!this._run_once) {
            this._run_once = true;
            return ;
        }
        // 如果有设置，提示取消，如果没设置点击跳转
        if(this.hasGestureLock) {
            this.alertCtrl.create({
                title: "手势密码",
                message: "是否关闭手势密码？",
                buttons:[
                    {
                        text:'取消',
                        handler: () => {
                            this.hasGestureLock = true;
                            this.hasGestureLockToggle = true;
                        }
                    },{
                        text: "确定",
                        handler: () => {
                            this.hasGestureLock = false;
                            this.hasGestureLockToggle = false;
                            this.storage.remove("gestureLockObj");
                            this._run_once = true;
                        }
                    }
                ]
                
            }).present();
        } else  {
            this.goGestureLock();
        }
        this._run_once = false;
    }
  
    goCurrencySettingPage() {
        this.navCtrl.push(CurrencySettingPage)
    }
}
