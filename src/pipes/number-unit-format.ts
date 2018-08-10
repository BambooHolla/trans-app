import { Pipe, PipeTransform } from "@angular/core";
import { BigNumber } from "bignumber.js";
import { checkBindingNoChanges } from "@angular/core/src/view/util";
@Pipe({
    name: "numberUnitFormat",
})
export class NumberUnitFormatPipe implements PipeTransform {
    unitArray = ["", "万", "亿", "万亿", "亿亿"];

    constructor() {}
    transform(
        value: any,
        retainZero: boolean = false,
        retainTailZeroAfterDigit: boolean | number = true,
        retainLength: number = 6,
        showLength: number = 120,
    ): string {
        BigNumber.config({ EXPONENTIAL_AT: [-9, 20] });
        // 显示位数，为了避免数据显示溢出，进行处理
        if (isNaN(value)) {
            return "--";
        }
        
        value = new BigNumber(value || "0");

        const prefix = value.comparedTo("0") == -1 ? "-" : "";
        value = value.abs();

        if (value.comparedTo("0") == 0) {
            return retainZero ? "0" : "--";
        }

        let count = 0;
        // 旧方法 显示单位，已不用，隐藏
        // const replacer = retainTailZeroAfterDigit ? /\.$/ : /(?:\.0*|(\.\d+?)0+)$/

        // for ( ; value >= 1e4 && count < this.unitArray.length; count++) {
        //   value /= 1e4;
        // }
        // 旧方法 显示单位，已不用，隐藏
        // for ( ; (value.comparedTo('10000') != -1 ) && count < this.unitArray.length; count++) {
        //  value =  value.div('10000');
        // }
        value = value.toString();
        // Math.min() 是为了处理循环变量越界（超出数组长度）的情况。
        // 旧方法 显示单位，已不用，隐藏
        // count = Math.min(count, this.unitArray.length - 1);
        // slice(0, 4) 用于保证数值有效位数为 4 （包括小数点及其前后的数字），
        // 然后再用 replace 方法去掉尾部可能多余的小数点
        // （或小数点后尾部多余的 0 ）。
        // const result = value.toFixed(4)
        //   .slice(0, retainLength - this.unitArray[count].length)
        //   .replace(replacer, '');
        const strs = this.numberFormat(value, retainLength).split(".");
        let result = strs[0];
        // 旧方法 显示单位，已不用，隐藏
        // const digLength = retainLength - strs[0].length - this.unitArray[count].length - 1
        let digLength = strs[1] && strs[1].length > 8 ? 0 : 1;
        if (digLength > 0) {
            // console.log('numberunitformat:result ',result)
            if (strs[1] && strs[1].length > 0) {
                // 获取最小显示位数
                digLength =
                    strs[1].length >= retainLength
                        ? retainLength
                        : strs[1].length;
                // 根据设置计算小数要显示的位数，保证最小0
                showLength =
                    showLength - strs[0].length >= 0
                        ? showLength - strs[0].length
                        : 0;
                // 比较两者那个小
                digLength = digLength > showLength ? showLength : digLength;
                if (digLength) {
                    result += "." + strs[1].slice(0, digLength+1);
                }
            }
            // console.log('numberunitformat:result ', result)
            // console.log('numberunitformat:replacer ', replacer)
            // 旧方法 显示单位，已不用，隐藏
            // result = result.replace(replacer, '$1')
            // console.log('numberunitformat:result ', result)
            // console.log('numberunitformat:a ',a)
            // 旧方法 显示单位，已不用，隐藏
            // if (typeof retainTailZeroAfterDigit == 'number' && !isNaN(result)){
            //   result = (+result).toFixed(retainTailZeroAfterDigit)
            // }
        }
        // 旧方法 显示单位，已不用，隐藏
        // return prefix + result + this.unitArray[count];
        return prefix + result;
    }

    numberFormat(number: any = 0, length: number = 6) {
        number = new BigNumber("" + number).toString();
        number = number.split(".");
        if (number[0].length > 1) {
            number[0] = number[0].replace(/\b(0+)/gi, "");
            number[0] = number[0] == "" ? "0" : number[0];
        }
        if (number[1]) {
            // number[0] =  number[0].length > 10? number[0].substr(-10) : number[0];
            number[1] =
                number[1].length > length
                    ? number[1].substr(0, length)
                    : number[1];
            return number[1] ? number[0] + "." + number[1] : number[0];
        }
        return number[0];
    }
}
