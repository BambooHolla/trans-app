import { Injectable } from "@angular/core";
import { Http, URLSearchParams, RequestMethod } from "@angular/http";
import "rxjs/add/operator/map";

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
    ) {}

    /**
     * 获取委托单
     * @param traderId {priceId-productId}
     * @param entrustStatus //委托状态（001挂单中、002部分成交、003已成交、004已撤单）
     */
    getEntrusts(traderId?, entrustStatus?, page?, pageSize = 10) {
        const path = `/transaction/entrusts`;

        let params = new URLSearchParams();

        if (traderId) {
            params.set("productId", traderId);
        }

        if (entrustStatus) {
            params.set("entrustStatus", entrustStatus);
        }

        if (page) {
            params.set("page", page);
            params.set("pageSize", pageSize.toString());
        }

        return this.appService
            .request(RequestMethod.Get, path, params, true)
            .then(data => {
                console.log("getEntrusts: ", data);

                if (!data) {
                    return Promise.reject(new Error("data missing"));
                } else if (data.error) {
                    return Promise.reject(new Error(data.error));
                } else {
                    data = (data as any[])
                        .filter(item => item)
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
                            productId: item.productId,
                            priceId: item.priceId,
                            entrustTime: item.entrustAt,
                            updatedTime: item.updatedAt,
                            commitPrice: item.entrustPrice,
                            commitAmount: item.entrustAmount,
                            completePrice:
                                item.completeTotalPrice / item.completeAmount,
                            completeTotalPrice: item.completeTotalPrice,
                            completeAmount: item.completeAmount,
                            operationType: item.entrustOperationType, //委托操作类型（001买入、002卖出）
                            surplusAmount: item.surplusAmount,
                            isMarketOrder: item.isMarketOrder,
                            surplusTotalPrice: item.surplusTotalPrice,
                            entrustTotalPrice: item.entrustTotalPrice,
                            entrustAmount: item.entrustAmount,
                        }));
                    return Promise.resolve(data);
                }
            })
            .catch(err => {
                console.log("getEntrusts error: ", err);
                // return Promise.reject(err);
            });
    }
    cancelEntrust(entrustId) {
        // console.log('cancel',commissionId)
        const path = `/transaction/entrusts/cancel/${entrustId}`;

        return this.appService
            .request(RequestMethod.Delete, path, "", true)
            .then(data => {
                console.log("cancelEntrust: ", data);

                if (!data) {
                    return Promise.reject(new Error("data missing"));
                } else if (data.error) {
                    return Promise.reject(data.error);
                } else {
                    return Promise.resolve(data);
                }
            })
            .catch(err => {
                return Promise.reject(err);
            });
    }

    /**
     * 获取委托单
     * @param traderId {priceId-productId}
     * @param entrustStatus //委托状态（001挂单中、002部分成交、003已成交、004已撤单）
     */
    getDeliveryList(
        traderId?,
        productHouseId?,
        priceProductHouseId?,
        page?,
        pageSize = 10,
        status?
    ) {
        const path = `/transaction/entrusts`;

        let params = new URLSearchParams();

        if (traderId) {
            params.set("productId", traderId);
        }
        if (productHouseId) {
            params.set("productHouseId", productHouseId);
        }
        if (priceProductHouseId) {
            params.set("priceProductHouseId", priceProductHouseId);
        }

        if (page) {
            params.set("page", page);
            params.set("pageSize", pageSize.toString());
        }
        if(status) {
            params.set("entrustOperationType", status);
        }
        return this.appService
            .request(RequestMethod.Get, path, params, true)
            .then(data => {
                console.log("getDeliveryList: ", data);

                if (!data) {
                    return Promise.reject(new Error("data missing"));
                } else if (data.error) {
                    return Promise.reject(new Error(data.error));
                } else {
                    data = (data as any[])
                        .filter(item => item)
                        // entrustId:string
                        // productId:string
                        // priceId:string
                        // deliveryAmount:number
                        // deliveryTotalPrice:number
                        // deliveryFee:number
                        // profitOrLoss:number
                        // deliveryAt:string
                        // operationType:string
                        .map(item => ({
                            id: item.id,
                            productId: item.productId,
                            priceId: item.priceId,
                            priceProductHouseId: item.priceProductHouseId,
                            productHouseId: item.productHouseId,
                            // entrustTime: item.entrustAt,
                            updatedTime: item.entrustAt,
                            // commitPrice: item.entrustPrice,
                            // commitAmount: item.entrustAmount,
                            completePrice: item.entrustPrice,
                            completeTotalPrice: item.completeTotalPrice,
                            surplusAmount: item.surplusAmount,
                            completeAmount: item.entrustAmount,
                            operationType: item.entrustOperationType, //委托操作类型（001买入、002卖出）
                            entrustStatus: item.entrustStatus,
                            // surplusAmount: item.surplusAmount,
                        }));
                    return Promise.resolve(data);
                }
            })
            .catch(err => {
                console.log("getDeliveryList error: ", err);
                // return Promise.reject(err);
            });
    }
}
