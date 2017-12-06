import { Injectable } from '@angular/core';

import {
  Http,
  Headers,
  RequestOptions,
  URLSearchParams,
  RequestMethod
} from '@angular/http';

// import { Observable } from 'rxjs/Observable';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AppSettings } from './app-settings';
import { AppDataService } from './app-data-service';
import { PersonalDataService } from './personal-data-service';
import { SocketioService } from './socketio-service';
import { AlertService } from './alert-service';
import { AppService } from './app.service';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TradeService {
  public purchase(
    equityCode,
    password,
    consignmentType,
    consignmentCount,
    consignmentPrice
  ): Promise<string | boolean | AnyObject> {
    let promise: Promise<any>;
    if (!this.appSettings.SIM_DATA) {
      // console.log('start trade')
      const url = `${this.appSettings.SERVER_URL +
        this.appSettings.SERVER_PREFIX}/transaction/entrusts/create`;
      const headers = new Headers({ 'Content-Type': 'application/json' });
      headers.append('X-AUTH-TOKEN', this.appDataService.token);

      const options = new RequestOptions({ headers: headers });

      // type: string *
      // 001买入，002卖出
      // operationType: string *
      // 001现金对产品交易、002产品对产品交易
      // productId: string *
      // 交易产品id
      // priceProductId: string
      // 标的（标价产品id），产品对产品交易时有
      // price: number
      // 交易价格
      // amount: number
      // 交易数量
      // total: integer
      // 交易的总价格，如果是市价买单有值，如果是市价卖单为0
      // isMarketOrder: boolean
      // 标示：是否为市价单(true), 限价单false

      let data = {
        type: '00' + (consignmentType ? '1' : '2'), // 001买入，002卖出
        operationType: '002', //string *001现金对产品交易、002产品对产品交易
        productId: equityCode.split('-')[1], //equityCode,
        priceProductId: equityCode.split('-')[0], //string,标的（标价产品id），产品对产品交易时有
        price: consignmentPrice, // 价格
        amount: +consignmentCount * this.appSettings.Product_Price_Rate // 数量
      };

      promise = this.http
        .post(url, data, options)
        .toPromise()
        .then(response => {
          // CreateEntrustResponse {
          //   data:
          //   CreateEntrustResponseData {
          //     id: number *
          //     委托id
          //   }
          // }
          const data = response.json();
          // console.log('response: ', response)
          // console.log('data: ', data)
          if (!data.error) {
            // 下单请求成功提交后，
            // 刷新个人资金账户情况与持股情况。
            this.personalDataService.requestFundData().catch(() => {});
            this.personalDataService.requestEquityDeposit().catch(() => {});

            return Promise.resolve(data.data);
          } else {
            return Promise.reject(data.error);
          }
        })
        .catch(error => {
          console.log(error);
          let formated_error = this._errorHandler(error, true);
          if (!formated_error) {
            //将error转为对象,
            const body = error.json() || error;
            //提取error
            const err = body.error || body || error;
            formated_error = this._errorHandler(err);
          }
          return Promise.reject(formated_error);
        });
    } else {
      promise = new Promise((resolve, reject) => {
        this.alertService.presentLoading('处理中...');
        const failed = Math.random() >= 0.5;
        const interval = failed ? 5e3 : 1e3;
        setTimeout(() => {
          if (failed) {
            reject('随机失败');
          } else {
            resolve({ token: 'test' });
          }
        }, interval);
      });
    }

    return promise;
  }

  constructor(
    public http: Http,
    public appSettings: AppSettings,
    public appService: AppService,
    public appDataService: AppDataService,
    public personalDataService: PersonalDataService,
    public socketioService: SocketioService,
    public alertService: AlertService
  ) {}

  public getTradeList() {
    const path = `/transactionengine/traders`;

    this.appService
      .request(RequestMethod.Get, path, undefined, true)
      .then(async data => {
        console.log('getTradeList: ', data);
        const traderList = await this.appDataService.traderList;

        if (!data) {
          return Promise.reject(new Error('data missing'));
        } else if (data.error) {
          return Promise.reject(new Error(data.error));
        } else {
          (data as any[])
            // .filter(item =>
            //   item
            // )
            .map(async ({ priceId, productId, buyFee, saleFee }) => {
              const products = await this.appDataService.productsPromise;
              const product = products.get(productId);
              const price = products.get(priceId);
              console.log('%cGGGG','color:red',productId,priceId,product,price)

              traderList.set(`${priceId}-${productId}`, {
                traderId: `${priceId}-${productId}`,
                traderName: `${product.productName} / ${price.productName}`,
                reportRef: new Observable(), //用来存放报表中间管道
                reportArr: [],
                marketRef: new BehaviorSubject(undefined), //用来存放交易中间管道
                buyFee,
                saleFee
              });
            });
        }
        return Promise.resolve(traderList);
      })
      .catch(err => {
        console.log('getTradeList error: ', err);
        // return Promise.reject(err);
      });
  }

  private _errorHandler(error, static_return = false) {
    if (error instanceof Error) {
      error = { code: '999', message: error.message };
    } else if (error instanceof ProgressEvent) {
      error = { code: '500', message: '网络连接错误,请稍后再试' };
    } else if (static_return) {
      error = null;
    }
    return error;
  }
}
