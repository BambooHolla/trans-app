import { Pipe, PipeTransform } from '@angular/core';
import { AppSettings } from "../providers/app-settings";
import { BigNumber } from "bignumber.js";
/**
 * Generated class for the PriceConversionPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: 'priceConversion',
})
export class PriceConversionPipe implements PipeTransform {

  constructor(
    private appSettings: AppSettings,
  ) {}

  transform(value: any, tradeRetainLength: number = 8) {
    // / this.appSettings.Price_Rate
    if(isNaN(value)) return value;
   
    let number:any = value;
    number = new BigNumber(number).toString();
   
    number = number.split('.');
    
    if(number[0].length > 1){
      number[0] =  number[0].replace(/\b(0+)/gi,"");
      number[0] = number[0] == ''? "0": number[0];
    } else {
      return value;
    }
   
    if(number[1]) {
      number[1] =  number[1].length > tradeRetainLength? number[1].substr(0,tradeRetainLength) : number[1];
      return this.numberFormatDelete0(number[0]+'.'+number[1]);
    }  {
      return  number[0];
    }
  }

  numberFormatDelete0(number:string|number){
    let arrExp:any ;
    if(typeof number == "number") number = number.toString();
    number = number.split("").reverse().join("");
    arrExp = /[1-9|\.]/ig.exec(number)
    if(arrExp){
        if(arrExp[0] == '.'){
          number = number.substring(arrExp.index+1)
        } else {
          number = number.substring(arrExp.index)
        }
        return  number.split("").reverse().join("")
    }
    return number;
  }
}
