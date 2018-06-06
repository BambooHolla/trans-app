import { Pipe, PipeTransform } from '@angular/core';
import { BigNumber} from "bignumber.js";
@Pipe({
  name: 'numberUnitFormat',
})
export class NumberUnitFormatPipe implements PipeTransform {
  unitArray = ['', '万', '亿', '万亿', '亿亿'];

  constructor() { 
    BigNumber.config({ EXPONENTIAL_AT: [-8, 20] })
  }
  transform(value: any, retainZero: boolean = false, retainTailZeroAfterDigit: boolean | number = true, retainLength: number = 6): string {
    if (isNaN(value)) {
      return '--';
    }
    debugger
    const prefix = value < 0 ? '-' : '';
    value = Math.abs(value);

    if (!value) {
      return retainZero ? '0' : '--';
    }

    let count = 0;
    const replacer = retainTailZeroAfterDigit ? /\.$/ : /(?:\.0*|(\.\d+?)0+)$/
    for ( ; value >= 1e4 && count < this.unitArray.length; count++) {
      value /= 1e4;
    }

    // Math.min() 是为了处理循环变量越界（超出数组长度）的情况。
    count = Math.min(count, this.unitArray.length - 1);
    // slice(0, 4) 用于保证数值有效位数为 4 （包括小数点及其前后的数字），
    // 然后再用 replace 方法去掉尾部可能多余的小数点
    // （或小数点后尾部多余的 0 ）。
    // const result = value.toFixed(4)
    //   .slice(0, retainLength - this.unitArray[count].length)
    //   .replace(replacer, '');

    const strs = this.numberFormat(value,retainLength).split('.');
    let result = strs[0]
    const digLength = retainLength - strs[0].length - this.unitArray[count].length - 1
    if (digLength > 0) {
      // console.log('numberunitformat:result ',result)
      result += '.' + strs[1].slice(0, digLength)
      // console.log('numberunitformat:result ', result)
      // console.log('numberunitformat:replacer ', replacer)
      result = result.replace(replacer, '$1')
      // console.log('numberunitformat:result ', result)
      // console.log('numberunitformat:a ',a)
      if (typeof retainTailZeroAfterDigit == 'number' && !isNaN(result)){
        result = (+result).toFixed(retainTailZeroAfterDigit)
      }
    }

    return prefix + result + this.unitArray[count];
  }

  numberFormat(number:any = 0,length:number=6){
    number = new BigNumber(''+number).toString();
    number = number.split('.');
    if(number[0].length > 1){
      number[0] =  number[0].replace(/\b(0+)/gi,"");
      number[0] = number[0] == ''? "0": number[0];
    }
    if(number[1]){
      // number[0] =  number[0].length > 10? number[0].substr(-10) : number[0];
      number[1] =  number[1].length > length? number[1].substr(0,length) : number[1];
      return number[1] ? number[0]+'.'+ number[1] : number[0];
    }
    return number[0];
}
}
