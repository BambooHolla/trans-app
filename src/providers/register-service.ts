import { AppService } from './app.service';
import { Injectable } from '@angular/core';

import { Http, RequestMethod } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AppSettings } from './app-settings';
import { AppDataService } from './app-data-service';
import { AlertService } from './alert-service';
import { LoginService } from './login-service';

// 使用 @Injectable 才能让所声明的类用于依赖注入，
// 而 @Component 是 @Injectable 的派生类型，不需要重复使用 @Injectable 。
// 注意在 @Injectable 后面必须使用括号。
@Injectable()
export class RegisterService {
  constructor(
    public http: Http,
    public appSettings: AppSettings,
    public appDataService: AppDataService,
    public alertService: AlertService,
    public appService: AppService,
    public loginService: LoginService,
  ) {}
  SEND_SMS_CODE_URL = `/api/v1/bngj/user/sendSmsCode`;
  SEND_EMAIL_CODE_URL = `/api/v1/bngj/user/sendEmailCode`;
  CREATE_ACCOUNT = `/api/v1/bngj/user/create`;

  sendSMSCode(telephone: string, type = '201') {
    // 如果是邮箱
    if (this.appSettings.accountType(telephone) === 0) {
      return this.appService.request(
        RequestMethod.Get,
        this.SEND_EMAIL_CODE_URL,
        {
          email: telephone,
          type
        }
      );
    }
    // 否则尝试当成手机号码发送
    return this.appService.request(RequestMethod.Get, this.SEND_SMS_CODE_URL, {
      telephone,
      type
    });
  }
  doRegister(account: string, code: string, password: string) {
    return this.appService.request(RequestMethod.Post, this.CREATE_ACCOUNT, {
      //type:int 0表示邮箱,1表示手机
      type: this.appSettings.accountType(account),
      account,
      code,
      password
    }).then(data=>{
      this.appDataService.token = data;
      this.loginService._status.next(true)
      return data;
    })
  }
}
