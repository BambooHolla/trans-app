import { Injectable } from "@angular/core";

import {
    Http,
    Headers,
    RequestOptionsArgs,
    RequestOptions,
    RequestMethod,
} from "@angular/http";

import { Observable } from "rxjs/Observable";

import { AppSettings } from "./app-settings";
import { AppDataService } from "./app-data-service";
import { Events } from "ionic-angular";
// import { Events } from 'ionic-angular';
// import { LoginService } from './login-service';

@Injectable()
export class AppService {
    constructor(
        private http: Http,
        private events: Events,
        private appSettings: AppSettings,
        private appDataService: AppDataService, // private loginService: LoginService,
    ) {}
    //{cache:true,minute:3,key:''}
    request(
        method: number,
        path: string,
        params: string | object,
        withToken: boolean = false,
        options: RequestOptionsArgs = {},
        // cache:object,
    ): Promise<any> {
        let requestMethod = null;
        const url = `${this.appSettings.SERVER_URL +
            this.appSettings.SERVER_PREFIX +
            path}`;
        const token = this.appDataService.token;

        const headers =
            options.headers ||
            new Headers({
                "x-bnqkl-platform": this.appSettings.Platform_Type,
            });
        headers.append("X-DEVICE-UUID", this.appDataService.DEVICE_DATA.uuid||'');
        if (withToken) {
            if (!token) {
                // this.events.publish('show login', 'login');
                return Promise.reject(new Error("token missing!"));
            }
            headers.append("X-AUTH-TOKEN", token); 
        }
        
        options = {
            // 构造对象时，其中使用的对象扩展运算符也要遵循先后原则，
            // 即代码中写在后面的属性会覆盖掉前面的同名属性。
            // 此处 options 对象中若存在 headers 属性，会被后面的 headers 覆盖。
            ...options,
            headers: headers,
        };

        switch (method) {
            case RequestMethod.Get:
                requestMethod = this.http.get(url, {
                    ...options,
                    params,
                });
                break;
            case RequestMethod.Post:
                requestMethod = this.http.post(url, params, options);
                break;
            case RequestMethod.Put:
                requestMethod = this.http.put(url, params, options);
                break;
            case RequestMethod.Delete:
                requestMethod = this.http.delete(url, {
                    ...options,
                    body: params,
                });
                break;
            case RequestMethod.Patch:
                requestMethod = this.http.patch(url, params, options);
                break;
        }

        return requestMethod
            .timeout(this.appDataService.timeOut || 5000)
            .map(res => res.json())
            .toPromise()
            .then(data => {
                console.log(data);
                if (!data) {
                    return Promise.reject(new Error("data missing"));
                }

                const err = data.err || data.error;
                if (err) {
                    // FORBIDDEN
                    // 注入 LoginService 会导致循环依赖错误！
                    if (err.code === -1) {
                        this.events.publish('doLogout');
                        // this.events.publish('show login', 'login');
                    }
                    return Promise.reject(new Error(err.message || err));
                }

                if (data.data) {
                    return Promise.resolve(data.data);
                } else {
                    return Promise.resolve(data);
                }
            })
            .catch(error => {
                console.log(error);
                let formated_error = this._errorHandler(error, true);
                if (!formated_error) {
                    //将error转为对象,
                    let body;
                    try {
                        body = error.json() || error;
                    } catch (e) {
                        body = error ? error.toString() || error : void 0;
                    }
                    //提取error
                    const err = body ? body.error || body : void 0;
                    formated_error = this._errorHandler(err);
                }
                return Promise.reject(formated_error);
            });
    }

    private _errorHandler(error, static_return = false) {
        if (error instanceof Error) {
            if (error.message.indexOf("Timeout") != -1) {
                error = {
                    code: "999",
                    message:
                        window["language"]["REQUEST_OVERTIME"] || "请求超时",
                };
            } else {
                error = { code: "999", message: error.message };
            }
        } else if (
            (error && error instanceof ProgressEvent) ||
            error.constructor.name === "ProgressEvent" ||
            error.constructor.name === "XMLHttpRequestProgressEvent"
        ) {
            error = {
                code: "500",
                message: window["language"]["NETWORK_ERROR"] || "网络异常",
            };
        } else if (static_return) {
            error = null;
        }
        return error;
    }
}
