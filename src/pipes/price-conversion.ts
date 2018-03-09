import { Pipe, PipeTransform } from '@angular/core';
import { AppSettings } from "../providers/app-settings";

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

  transform(value: any, ...args) {
    // / this.appSettings.Price_Rate
    return Number((+value).toFixed(8));
  }
}
