import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/map';

import { AppSettings } from "./app-settings";
import { AppService } from "./app.service";
import { AppDataService } from "./app-data-service";

/*
  Generated class for the EntrustServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class EntrustServiceProvider {

  constructor(
    public http: Http,  
    public appSettings: AppSettings,
    public appService: AppService,
    public appDataService: AppDataService,
  ) {
  }

  /**
   * 获取委托单
   * @param traderId {priceId-productId}
   * @param entrustStatus //委托状态（001挂单中、002部分成交、003已成交、004已撤单）
   */
  getEntrustsByTraderId(traderId, entrustStatus?) {
    const path = `/transaction/entrusts`

    let params = new URLSearchParams();
    
    const productId= traderId.split('-')[1]
    const priceId= traderId.split('-')[0]

    // params.set('customerId', this.appDataService.customerId);
    
    params.set('productId', productId);
    params.set('priceId', priceId);
    params.set('entrustStatus', entrustStatus);

    return this.appService.request(RequestMethod.Get, path, params, true)
      .then(data => {
        console.log('getEntrustsByTraderId: ', data);

        if (!data) {
          return Promise.reject(new Error('data missing'))
        } else if (data.error) {
          return Promise.reject(new Error(data.error))
        } else {
          data = (data as any[]).filter(item =>
            item
          )
            //id*	integer
            //customerId	string 客户id
            //accountId	string 账户id
            //entrustOperationType	string 委托操作类型（001买入、002卖出）
            //entrustType	string 委托类型（现金对产品交易、产品对产品交易）
            //priceId	string 标价实体编号（现金为空，产品为编号）,视委托类型而定
            //productId	string 产品编号（要买卖的产品编号）
            //entrustWay	string 委托方式（001网络、002柜台）
            //entrustAmount	number 委托数量
            //entrustPrice	number 委托单价
            //entrustTotalPrice	number 委托总金额
            //entrustStatus	string 委托状态（001挂单中、002部分成交、003已成交、004已撤单）
            //completeAmount	number 已成交数量
            //completeTotalPrice	number 已成交总价
            //surplusAmount	number 剩余成交数量            
            .map(item => ({
              id: item.id,
              entrustTime: item.entrustAt,
              updatedTime: item.updatedAt,
              commitPrice: item.entrustPrice,
              commitAmount: item.entrustAmount,
              completePrice: item.completeTotalPrice / item.completeAmount,
              completeTotalPrice: item.completeTotalPrice,
              completeAmount: item.completeAmount,
              operationType: item.entrustOperationType,//委托操作类型（001买入、002卖出）
              surplusAmount: item.surplusAmount,
            }))
          return Promise.resolve(data)
        }
      })
      .catch(err => {
        console.log('getEntrustsByTraderId error: ', err);
        // return Promise.reject(err);
      });
  }
  cancelEntrust(entrustId){

    // console.log('cancel',commissionId)
    const path = `/transaction/entrusts/cancel/${entrustId}`

    return this.appService.request(RequestMethod.Delete,path,'',true)
      .then(data => {
        console.log('cancelEntrust: ', data);

        if (!data) {
          return Promise.reject(new Error('data missing'))
        } else if (data.error) {
          return Promise.reject(new Error(data.error))
        } else {
          return Promise.resolve(data);
        }
      })
      .catch(err => {
        return Promise.reject(new Error(err))        
      });
  }
}
