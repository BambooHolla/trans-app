import { AppService } from './app.service';
import { Injectable } from '@angular/core';

import { Http, RequestMethod } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AppSettings } from './app-settings';
import { AppDataService } from './app-data-service';
import { AlertService } from './alert-service';

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
  ) {
  }
  SEND_SMS_CODE_URL = `/api/v1/bngj/user/sendSmsCode`
  sendSMSCode(telephone: string, type = "201") {
    return this.appService.request(RequestMethod.Get, this.SEND_SMS_CODE_URL, {
      telephone,
      type,
    })
  }
}
