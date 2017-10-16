import { Component, Input } from '@angular/core';
import { NavController } from "ionic-angular";

import { StockDataService } from '../../providers/stock-data-service';

import { StockDetailPage } from "../../pages/stock-detail/stock-detail";

/**
 * Generated class for the TriColListComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'tri-col-list-component',
  templateUrl: 'tri-col-list.html'
})
export class TriColListComponent {

  @Input() listData: object[];
  @Input() showDetail:boolean;
  @Input() isOption:boolean;

  stockDetailPage: any = StockDetailPage;

  constructor(
    public navCtrl: NavController,
    public stockDataService: StockDataService,
  ) {

  }

}
