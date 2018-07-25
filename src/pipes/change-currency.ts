import { Pipe, PipeTransform } from "@angular/core";
import { AppSettings } from "../providers/app-settings";
import { BigNumber } from "bignumber.js";
import { getNonHydratedSegmentIfLinkAndUrlMatch } from "ionic-angular/navigation/url-serializer";
import { AppDataService } from "../providers/app-data-service";

/**
 * Generated class for the PriceConversionPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
    name: "changeCurrency",
})
export class ChangeCurrencyPipe implements PipeTransform {
    constructor(
        private appDataService: AppDataService
    ) {}

    
    /**
     * 价格转法币
     * @param value 传入值
     * @param type 操作类型，0：计算 + 法币单位、1：添加法币单位、undefined 或其他：只计算
     * @param age 参数待定
     */
    transform(
        value: any,
        type: number,
        ...age
    ) {
        BigNumber.config({ EXPONENTIAL_AT: [-9, 20] });
        if (isNaN(value) || value == null) return "--";
        value = "" + value;
        if( type == 0) {
            if(!this.appDataService.CURRENCY_INFO.exchange) return '--'; 
            return (new BigNumber(value)).times(this.appDataService.CURRENCY_INFO.exchange).toString() + " " + this.appDataService.CURRENCY_INFO.currencyTo;
        } else if( type == 1 ) {
            return value + " " + this.appDataService.CURRENCY_INFO.currencyTo;
        } else {
            if(!this.appDataService.CURRENCY_INFO.exchange) return '--'; 
            return (new BigNumber(value)).times(this.appDataService.CURRENCY_INFO.exchange).toString();
        }
    }

}
