import { Injectable, ViewChild } from "@angular/core";

import { Http, RequestMethod, RequestOptions, Headers } from "@angular/http";

import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { AppSettings } from "./app-settings";
import { AppService } from "./app.service";
import { AppDataService } from "./app-data-service";
import { AlertService } from "./alert-service";

/*from BNLC framework*/
import { AppSettingProvider } from "../bnlc-framework/providers/app-setting/app-setting";
import { Storage } from "@ionic/storage";
import { NavController, App } from "ionic-angular";

// 使用 @Injectable 才能让所声明的类用于依赖注入，
// 而 @Component 是 @Injectable 的派生类型，不需要重复使用 @Injectable 。
// 注意在 @Injectable 后面必须使用括号。
@Injectable()
export class LoginService {
    // private _status:boolean = false;
    // _status 不创建为布尔类型，而是创建为 BehaviorSubject ，
    // 并使用该属性构造出一个可观察对象 status$ ，
    // 在相关代码（例如 /src/app/app.component.ts ）中可以订阅这个可观察对象，
    // 从而实现对该属性的监视。
    userToken = new BehaviorSubject<string>(undefined);
    status$: Observable<boolean> = this.userToken
        // 在值被设置时，
        // 使用 distinctUntilChanged() 方法保证只处理真正变化了的值
        .map(v => !!v)
        .distinctUntilChanged();

    // logout$: Observable<boolean> = this.userToken
    //   .map(v => v=='')
    // .distinctUntilChanged();

    setToken(token: string = "", expiredTime?: number) {
        //usertoken推入新值会触发登陆 所以必须先设置token
        this.appDataService.token = token;
        this.userToken.next(token);
    }
    setLoginData(data: any) {
        this.bnlcAppSetting.setUserToken(data);
        this.setToken(data.token);
    }

    GET_CUSTOMER_DATA = `/user/getCustomersData`;

    constructor(
        public http: Http,
        public appSettings: AppSettings,
        public appDataService: AppDataService,
        public appService: AppService,
        public alertService: AlertService,
        public bnlcAppSetting: AppSettingProvider,
        public storage: Storage,
        public app: App,
    ) {
        this.appDataService.dataReady
            .then(async () => {
                window["loginService"] = this;
                const token = this.appDataService.token;

                var token_use_able = false;

                if (token) {
                    // FIXME ：即使缓存中有 token ，也不应当直接使用！
                    // 因为有可能是之前登录留下的，
                    // 而一段时间后服务端有变更（例如服务器重启、用户更改密码等）！
                    // 因此需要在启动时检测一下 token 是否可用，
                    try {
                        //检测一下 token 是否可用，
                        const loginerInfo = await this.appService.request(
                            RequestMethod.Get,
                            this.GET_CUSTOMER_DATA,
                            void 0,
                            true,
                        );
                        console.log(loginerInfo);
                        token_use_able = true;
                    } catch (err) {
                        console.warn("Token过期不可用");
                        //获取保存的用户账号
                        let customerId = this.appDataService.customerId;
                        //清空登入信息,保留用户账号
                        await this.doLogout().then(success => {
                            this.appDataService.customerId = customerId;
                        });
                    }
                }
                this.setToken(token_use_able ? token : "");
            })
            .catch(err => {
                console.log(err);
                this.alertService.showAlert(
                    window["language"]["WARNING"] || "警告",
                    err.message,
                );
                // this.userToken.next('');
                this.setToken("");
            });
    }

    private async _doLogin(
        customerId: string,
        password: string,
        savePassword: boolean = true,
        type?: number,
        codeHeader?,
    ): Promise<any> {
        let promise: Promise<{ token }>;
        let headers: any = {};
        if (type === void 0) {
            type = this.appSettings.accountType(customerId);
        }
        headers["x-bnqkl-platform"] = this.appSettings.Platform_Type;
        if (codeHeader["x-bnqkl-captchaId"]) {
            headers["x-bnqkl-captchaId"] = codeHeader["x-bnqkl-captchaId"];
            headers["x-bnqkl-captchaToken"] =
                codeHeader["x-bnqkl-captchaToken"];
        }
        const options = new RequestOptions({
            headers: new Headers(headers),
        });
        debugger;
        let app_geolocation: any = await this.appDataService.getAppCoords();

        promise = this.http
            .post(
                this.appSettings.LOGIN_URL,
                {
                    type: type,
                    account: customerId,
                    password,
                    deviceSerialNum: this.appDataService.DEVICE_DATA.uuid || "",
                    deviceInfo: this.appDataService.DEVICE_DATA,
                    deviceType: this.appDataService.DEVICE_DATA.model || "",
                    operateSystem:
                        this.appDataService.DEVICE_DATA.platform || "",

                    ip: this.appDataService.APP_IP,
                    location:
                        app_geolocation.status == "success"
                            ? {
                                  latitude: app_geolocation.coords.latitude,
                                  longitude: app_geolocation.coords.longitude,
                              }
                            : {
                                  latitude: "",
                                  longitude: "",
                              },
                },
                options,
            )
            .map(res => res.json())
            .toPromise()
            .then(data => {
                console.log("login:", data);
                const err = data.error || data.err;
                if (!err) {
                    document.cookie = `X-AUTH-TOKEN=${data.data.token}`;
                    return Promise.resolve(data.data);
                } else {
                    return Promise.reject(err);
                }
            });

        return promise;
    }
    public doLogin(
        customerId: string,
        password: string,
        savePassword: boolean = false,
        type?: number,
        codeHeader?,
    ): Promise<boolean | string> {
        return this._doLogin(
            customerId,
            password,
            savePassword,
            type,
            codeHeader,
        )
            .then(data => {
                debugger;
                Object.assign(this.appDataService, {
                    token: data.token,
                    customerId,
                    // password,
                    savePassword,
                });

                this.setLoginData(data);

                // this.storage.get('gestureLockObj').then( data => {
                //     if(!data) {
                //         window['alertCtrl'].create({
                //             title: window["language"]["WARNING"]||'警告',
                //             message: window["language"]["GESTURE_NO_PASSWORD"]||"手势密码未设置",
                //             buttons: [
                //                 {
                //                     text: window["language"]["GESTURE_CANCEL"]||"取消",
                //                     role: "cancel",
                //                     handler: () => {
                                      
                //                     },
                //                 },
                //                 {
                //                     text: window["language"]["GESTURE_SETTINGS"]||"设置",
                //                     handler: () => {
                //                         let activeNav: NavController = this.app.getActiveNav();
                //                         activeNav.push('gesture-lock',{
                //                             hasGestureLock: false,
                //                         })
                //                     },
                //                 },
                //             ],
                //         }).present();
                //     }
                // })



                return true;
            })
            .catch(error => {
                debugger;
                //将error转为对象,
                let body: any;
                try {
                    body = error.json() || error;
                } catch (e) {
                    body = error;
                }
                //提取error
                const err = body.error || body || error;
                console.log("login err:", err);
                const message =
                    err.message ||
                    err.statusText ||
                    window["language"]["LOGIN_FAILED"] ||
                    "登录失败！";
                this.alertService.showAlert(
                    window["language"]["WARNING"] || "警告",
                    message,
                );
                //清空登入信息
                // this.doLogout(); 
                return err.message || err.statusText || err;
            });
    }

    public async doLogout() {
        document.cookie = `X-AUTH-TOKEN=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        await this.bnlcAppSetting.clearUserToken();
        return new Promise(async resolve => {
            await this.appDataService.resetCustomization();

            await this.userToken.next("");

            resolve(true);
        });
    }

    // 重置密码
    RESET_PASSWORD = `/user/resetPassword`;

    async doResetPWD(account: string, code: string, resetPwd: string) {
        let app_geolocation: any = await this.appDataService.getAppCoords();
        return this.appService.request(
            RequestMethod.Post,
            this.RESET_PASSWORD,
            {
                type: this.appSettings.accountType(account),
                account,
                code,
                resetPwd,
                deviceSerialNum: this.appDataService.DEVICE_DATA.uuid || "",
                deviceInfo: this.appDataService.DEVICE_DATA,
                deviceType: this.appDataService.DEVICE_DATA.model || "",
                operateSystem: this.appDataService.DEVICE_DATA.platform || "",

                ip: this.appDataService.APP_IP,
                location:
                    app_geolocation.status == "success"
                        ? {
                              latitude: app_geolocation.coords.latitude,
                              longitude: app_geolocation.coords.longitude,
                          }
                        : {
                              latitude: "",
                              longitude: "",
                          },
            },
        );
    }

    MODIFY_PASSWORD = `/user/modifyLoginPassword`;
    // 修改密码
    async doModifyPWD(oldPassword: string, newPassword: string) {
        let app_geolocation: any = await this.appDataService.getAppCoords();
        return this.appService.request(
            RequestMethod.Post,
            this.MODIFY_PASSWORD,
            {
                oldPassword,
                newPassword,
                deviceSerialNum: this.appDataService.DEVICE_DATA.uuid || "",
                deviceInfo: this.appDataService.DEVICE_DATA,
                deviceType: this.appDataService.DEVICE_DATA.model || "",
                operateSystem: this.appDataService.DEVICE_DATA.platform || "",

                ip: this.appDataService.APP_IP,
                location:
                    app_geolocation.status == "success"
                        ? {
                              latitude: app_geolocation.coords.latitude,
                              longitude: app_geolocation.coords.longitude,
                          }
                        : {
                              latitude: "",
                              longitude: "",
                          },
            },
            true,
        );
    }

    // 获取验证码
    GETCODE_PASSWORD = `/captcha/getCaptcha`;
    // 获取验证码
    async getCode() {
        return this.appService
            .request(RequestMethod.Get, this.GETCODE_PASSWORD, {})
            .catch(error => {
                //将error转为对象,
                let body: any;
                try {
                    body = error.json() || error;
                } catch (e) {
                    body = error;
                }
                //提取error
                const err = body.error || body || error;
                const message =
                    err.message ||
                    err.statusText ||
                    window["language"]["GET_CODE_ERR"] ||
                    "获取验证码失败";
                this.alertService.showAlert(
                    window["language"]["WARNING"] || "警告",
                    message,
                );
                return err.message || err.statusText || err;
            });
    }
}
