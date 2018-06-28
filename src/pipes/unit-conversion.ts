import { Pipe, PipeTransform } from '@angular/core';
import { BigNumber} from "bignumber.js";
/**
 * Generated class for the unitConversionPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: 'unitConversion',
})
export class unitConversionPipe implements PipeTransform {
  /**
   * 用于数值过长，转化单位 如： 10000 = 10k
   * @param dateTime 
   * @des args 
   */
  transform(value: any):string {
    BigNumber.config({ EXPONENTIAL_AT: [-9, 20] })
    if (isNaN(value)) {
        return '--';
    }
    let unit: string = '';
    let unitArr: string[] = ['K','M','G','T'];
    // 转化成string
    let number = (new BigNumber(''+value || '0')).toString(); 
    // 小数，整数分开
    let numberArr = number.split('.');
    let length = numberArr[0].length;
    if( length < 3 || !numberArr[0]) return value;
    for( let i = 0; length > 4; i++) {
        numberArr[0] = numberArr[0].substring(0,length - 3);
        length = numberArr[0].length;
        unit = unitArr[i];
    }
    return numberArr[0] + unit;

  }
}
