import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
// import 'rxjs/add/operator/map';
import { AsyncBehaviorSubject, Executor } from "../../RxExtends";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AppDataService } from "../../../providers/app-data-service";

/*
  Generated class for the AppSettingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AppSettingProvider {
    static SERVER_URL =
        JSON.parse(localStorage.getItem("SERVER_URL_APP")) ||
        "https://test.picaex.com"; 

    static SERVER_PREFIX = "/api/v1/bngj";
    static Platform_Type = "10011001";
    public RECOMMEND_PREFIX = "www.picaex.com?ref=";
    public get Platform_Type() {
        return AppSettingProvider.Platform_Type;
    }
    APP_URL(path: string) {
        return (
            AppSettingProvider.SERVER_URL +
            AppSettingProvider.SERVER_PREFIX +
            "/" +
            path 
        );
    }

    // 是否模糊底部tab
    public hasTabBlur: boolean = false;

    constructor(public http: Http, public appDataService: AppDataService) {
        AppSettingProvider.SERVER_URL = JSON.parse(
            localStorage.getItem("SERVER_URL_APP") ||
                JSON.stringify("https://test.picaex.com"),
        ); 
        // AppSettingProvider.SERVER_URL = 'https://test.picaex.com'; // 测试网络
        // AppSettingProvider.SERVER_URL = 'https://www.picaex.com'; // 正式网络
        // AppSettingProvider.SERVER_URL = 'http://192.168.18.23:40001'; // 本地网络
        // AppSettingProvider.SERVER_URL = "http://192.168.16.15:40001"; // erbing
        // AppSettingProvider.SERVER_URL =  "http://192.168.16.197:40001"; // chenfeng
        // AppSettingProvider.SERVER_URL =  "http://192.168.16.107:40001"; // yongming
        // AppSettingProvider.SERVER_URL = "http://192.168.16.183:40001"; // yanhui
        // AppSettingProvider.SERVER_URL = "http://192.168.16.122:40001"; // lsy 

        console.log("Hello AppSettingProvider Provider");
        this.user_token = new BehaviorSubject<string>(this.getUserToken());
    }
    private USER_TOKEN_STORE_KEY = "BNGJ_USER_LOGIN_TOKEN";
    user_token: BehaviorSubject<string>;
    private _token_timeout_ti: any;
    getUserToken() {
        try {
            clearTimeout(this._token_timeout_ti);
            var tokenJson = localStorage.getItem(this.USER_TOKEN_STORE_KEY);
            if (!tokenJson) {
                return "";
            }
            var obj = JSON.parse(tokenJson);
            if (obj.expiredTime && obj.expiredTime < Date.now()) {
                return "";
            }
            this._token_timeout_ti = setTimeout(() => {
                console.log("User Token 过期：", obj);
                document.cookie = `X-AUTH-TOKEN=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                this.clearUserToken();
                let customerId = this.appDataService.customerId || "";
                this.appDataService.resetCustomization();
                this.appDataService.customerId = customerId;
            }, obj.expiredTime - Date.now());
            return obj.token || "";
        } catch (e) {
            return "";
        }
    }
    async setUserToken(obj: any) {
        if (typeof obj !== "string") {
            obj = JSON.stringify(obj);
        }
        await localStorage.setItem(this.USER_TOKEN_STORE_KEY, obj);
        this._setUserToken(this.getUserToken());
    }
    async clearUserToken() {
        await localStorage.removeItem(this.USER_TOKEN_STORE_KEY);
        this._setUserToken(this.getUserToken());
    }
    private _setUserToken(token: string) {
        this.user_token.next(this.getUserToken());
    }
    clearUserInfo() {
        try {
            let tokenJson = localStorage.getItem(this.USER_TOKEN_STORE_KEY);
            let customerId = this.appDataService.customerId || "";
            if (
                !tokenJson ||
                (JSON.parse(tokenJson).expiredTime &&
                    JSON.parse(tokenJson).expiredTime < Date.now())
            ) {
                this.appDataService.resetCustomization();
                this.appDataService.customerId = customerId;
                this.clearUserToken();
            }
        } catch (e) {
            let customerId = this.appDataService.customerId || "";
            this.appDataService.resetCustomization();
            this.appDataService.customerId = customerId;
            this.clearUserToken();
        }
    }
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log("Query variable %s not found", variable);
}

const server_host =
    getQueryVariable("SERVER_HOST") ||
    localStorage.getItem("SERVER_HOST") ||
    "";
if (location.hostname === "dev-bnlc.bnqkl.cn") {
    AppSettingProvider.SERVER_URL = "http://dev-bnlc.bnqkl.cn:40001";
} else if (server_host.startsWith("HOME")) {
    let home_ip = location.hostname;
    if (server_host.startsWith("HOME:")) {
        home_ip = server_host.replace("HOME:", "").trim();
    }
    AppSettingProvider.SERVER_URL = `http://${home_ip}:40001`;
} else if (location.hostname === "wzx-bnlc.bnqkl.cn" || server_host === "WZX") {
    AppSettingProvider.SERVER_URL = "http://192.168.16.216:40001";
}
console.log(
    "%cSERVER_URL:",
    "font-size:2em;color:green;background-color:#DDD",
    AppSettingProvider.SERVER_URL,
);
/**
 * 基于token的AsyncBehaviorSubjuet类型的属性/方法生成器
 * tokenBaseAsyncBehaviorSubjectGenerator
 *
 * @export
 * @param {any} target
 * @param {any} name
 * @param {any} descriptor
 */
export function TB_AB_Generator(target_prop_name: string, need_token = true) {
    return (target, name, descriptor) => {
        var executor: Executor<any> = descriptor.value;
        let _v: AsyncBehaviorSubject<any>;
        Object.defineProperty(target, target_prop_name, {
            get() {
                if (!_v) {
                    if (!(this.appSetting instanceof AppSettingProvider)) {
                        throw new Error(
                            `${
                                this.constructor.name
                            } 需要注入依赖： (appSetting)AppSettingProvider`,
                        );
                    }
                    this.appSetting.user_token.subscribe(token => {
                        if (need_token && !token) {
                            return;
                        }
                        if (!_v) {
                            _v = new AsyncBehaviorSubject(executor.bind(this));
                        } else {
                            _v.refresh();
                        }
                    });
                }
                return _v;
            },
        });
        return descriptor;
    };
}
