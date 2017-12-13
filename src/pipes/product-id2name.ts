import { Pipe, PipeTransform } from '@angular/core';
import { AppDataService } from '../providers/app-data-service';

/**
 * Generated class for the ProductId2namePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'productId2name',
})
export class ProductId2namePipe implements PipeTransform {
  
  constructor(
    private appDataService: AppDataService,
  ) { }

  transform(productId: string, ...args) {
    const products = this.appDataService.products;
    const product = products.get(productId);
    
    if (product) return product.productName
    else return '----'
  }
}
