import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SearchItemPage } from "../search-item/search-item-page";
import { AlertService } from '../../providers/alert-service';

@Component({
    selector: 'page-recommend',
    templateUrl: 'recommend.html'
})
export class RecommendPage{
	searchItemPage: any = SearchItemPage;

    constructor(
    	public navCtrl: NavController,
    	private alertService: AlertService,
	){

	}

    ngOnInit(){
        const title: String = '关于调整交易时段的通知';
        const content: String = '方便于市场交易，于主要交易所时段保持一致，经高教所研究决定，自2017年元月10日起，将交易桂枝中的交易哦时段调整为周一至周五。周六及周日休市。每个交易日的交易时间不变。'
        this.alertService.showAlert(title, content);
    }
    public cards: Number[] = [1,2,3,4,5,6,7];
}