import { Pipe, PipeTransform } from "@angular/core";
import { AppSettings } from "../providers/app-settings";
import { BigNumber } from "bignumber.js";
import { getNonHydratedSegmentIfLinkAndUrlMatch } from "ionic-angular/navigation/url-serializer";
/**
 * Generated class for the PriceConversionPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
    name: "priceConversion",
})
export class PriceConversionPipe implements PipeTransform {
    constructor(private appSettings: AppSettings) {}

    transform(
        value: any,
        tradeRetainLength: number = 5,
        decimalFormat: number = 0,
    ) {
        // / this.appSettings.Price_Rate
        BigNumber.config({ EXPONENTIAL_AT: [-9, 20] });
        if (isNaN(value) || value == null) return "--";
        value = "" + value;
        let number: any = value;

        number = number.split(".");
        if (number[0].length > 1) {
            number[0] = number[0].replace(/\b(0+)/gi, "");
            number[0] = number[0] == "" ? "0" : number[0];
        }

        if (number[1]) {
            number[1] =
                number[1].length > tradeRetainLength
                    ? number[1].substr(0, tradeRetainLength)
                    : number[1];
            return this.numberFormat0(
                number[0] + "." + number[1],
                decimalFormat,
            );
        } else {
            return decimalFormat
                ? this.numberFormat0(number[0], decimalFormat, true)
                : number[0];
        }
    }

    numberFormat0(
        number: any,
        decimalFormat: number,
        isInteger: boolean = false,
    ) {
        let arrExp: any;
        number += "";
        if (isNaN(number)) number = "0";
        number = number || number == 0 ? "" + number : "0";
        if (!isInteger) {
            number = number
                .split("")
                .reverse()
                .join("");
            arrExp = /[1-9|\.]/gi.exec(number);
            if (arrExp) {
                if (arrExp[0] == ".") {
                    number = number.substring(arrExp.index + 1);
                } else {
                    number = number.substring(arrExp.index);
                }
            }
            number = number
                .split("")
                .reverse()
                .join("");
        }

        if (decimalFormat > 0) {
            let numberArr = number.split(".");
            let zero: string = "";
            if (numberArr.length > 1) {
                for (let i = 0; i < decimalFormat - numberArr[1].length; i++) {
                    zero += "0";
                }
                return number + zero;
            } else {
                zero = ".";
                for (let i = 0; i < decimalFormat; i++) {
                    zero += "0";
                }
                return number + zero;
            }
        } else {
            return number;
        }
    }
}
