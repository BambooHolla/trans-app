import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberUnitFormat',
})
export class NumberUnitFormatPipe implements PipeTransform {
  unitArray = ['', '万', '亿', '万亿', '亿亿'];

  transform(value: any, retainZero: boolean = false, retainTailZeroAfterDigit: boolean = true, retainLength: number = 6): string {
    if (isNaN(value)) {
      return '--';
    }

    const prefix = value < 0 ? '-' : '';
    value = Math.abs(value);

    if (!value) {
      return retainZero ? '0' : '--';
    }

    let count = 0;
    const replacer = retainTailZeroAfterDigit ? /\.$/ : /\.?0*$/
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

    const strs = value.toFixed(retainLength).split('.')
    let result = strs[0]
    const digLength = retainLength - strs[0].length - this.unitArray[count].length - 1
    if (digLength > 0) {
      result += '.' + strs[1].slice(0, digLength)
      result.replace(replacer, '');
    }

    return prefix + result + this.unitArray[count];
  }
}
