import { Pipe, PipeTransform } from '@angular/core';
import { AppSettings } from "../providers/app-settings";

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
  ) { }
  
  transform(value: any, ...args) {
    if(isNaN(value)) return value;
    return Number((value / this.appSettings.Product_Price_Rate).toFixed(8));
  }
}
