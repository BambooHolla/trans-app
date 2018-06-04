import { Pipe, PipeTransform } from '@angular/core';
import { AppSettings } from "../providers/app-settings";
import { BigNumber} from "bignumber.js";
/**
 * Generated class for the QuantityConversionPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: 'quantityConversion',
})
export class QuantityConversionPipe implements PipeTransform {

  constructor(
    private appSettings: AppSettings,
  ) { 
    BigNumber.config({ EXPONENTIAL_AT: [-8, 20] })
  }
  
  transform(value: any, ...args) {
    console.log('......',value)
    if(isNaN(value) || value == null || value == undefined) return value;
    let number:any = new BigNumber(''+value).div( this.appSettings.Product_Price_Rate).toString();
    if(typeof number != "string" ){
        number = number.toString();
    }
    number = number.split('.');
    if(number[0].length > 1){
      number[0] =  number[0].replace(/\b(0+)/gi,"");
      number[0] = number[0] == ''? "0": number[0];
    }
    if(number[1]){
      // number[0] =  number[0].length > 10? number[0].substr(-10) : number[0];
      number[1] =  number[1].length > 8? number[1].substr(0,8) : number[1];
      return number[0]+'.'+number[1];
    }
    return number[0];
  }
}
