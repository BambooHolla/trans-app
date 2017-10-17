import { Injectable } from '@angular/core';

import { Http, Headers, RequestOptions } from '@angular/http';

// import { Observable } from 'rxjs/Observable';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AppSettings } from './app-settings';
import { AppDataService } from './app-data-service';
import { PersonalDataService } from './personal-data-service';
import { SocketioService } from './socketio-service';
import { AlertService } from './alert-service';

@Injectable()
export class TradeService {

  private fakeTrade: boolean = false;
  
  public purchase(
    equityCode,
    password,
    consignmentType,
    consignmentCount,
    consignmentPrice,
  ): Promise<string | boolean | AnyObject > {
    let promise: Promise<any>;
    if (!this.fakeTrade){
      // console.log('start trade')
      const url = `${this.appSettings.SERVER_URL + this.appSettings.SERVER_PREFIX}/transactions/create`
      const headers = new Headers({ 'Content-Type': 'application/json' });
      headers.append('X-AUTH-TOKEN', this.appDataService.token);

      const options = new RequestOptions({ headers: headers });

      let data = {
        productId:equityCode,
        transactionType: '00' + consignmentType.toString(),// 1 买入申报 2 卖出申报 59 买入确认 60 卖出确认
        amount: +consignmentCount,// 数量
        price: consignmentPrice * 100,// 价格
      }

      promise = this.http
        .post(url, data, options)
        .toPromise()
        .then(response => {
          const data = response.json()
          // console.log('response: ', response)
          // console.log('data: ', data)
          if (!data.err){
            // 下单请求成功提交后，
            // 刷新个人资金账户情况与持股情况。
            this.personalDataService.requestFundData()
              .catch(() => {});
            this.personalDataService.requestEquityDeposit()
              .catch(() => {});

            return Promise.resolve(data.data);
          } else {
            return Promise.reject(data.err);
          }
        })
    } else {
      promise = new Promise((resolve, reject) => {
        this.alertService.presentLoading('处理中...');
        const failed = Math.random() >= 0.5;
        const interval = failed ? 5e3 : 1e3;
        setTimeout(() => {
          if (failed){
            reject('随机失败');
          } else {
            resolve({token: 'test'})
          }
        }, interval);
      });
    }

    return promise
  }

  constructor(
    public http: Http,
    public appSettings: AppSettings,
    public appDataService: AppDataService,
    public personalDataService: PersonalDataService,
    public socketioService: SocketioService,
    public alertService: AlertService,
  ){

  }
}
