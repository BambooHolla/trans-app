import { Component } from '@angular/core';
import { EntrustServiceProvider } from '../../providers/entrust-service';
import { NavParams, Refresher, InfiniteScroll, AlertController, Events } from 'ionic-angular';
import { AppDataService } from '../../providers/app-data-service';
// import * as echarts from 'echarts';
// import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-history-record',
  templateUrl: 'history-record.html'
})
export class HistoryRecordPage {
  smoothlinedata:any;
  entrusts:any[];

  page = 1;
  pageSize = 10;
  hasMore: boolean = true;

  initData(refresher?: Refresher) {
    const smoothlinedata = [];
    const N_POINT = 30;
    for (let i = 0; i <= N_POINT; i++) {
      const x = i / N_POINT;
      const y = backInOut(x);
      smoothlinedata.push([x, y]);
    } 
    function backInOut(k) {
    var s = 1.70158 * 1.525;
    if ((k *= 2) < 1) { return 0.5 * (k * k * ((s + 1) * k - s)); }
    return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }
    this.smoothlinedata=smoothlinedata;

    this.page = 1;
    this.getTradeHistory()
      .then(data=>{
        const data_show = data.filter(item => Number(item.completeTotalPrice))
        this.entrusts = data_show
        if (refresher) refresher.complete()
        this.hasMore = !(data.length < this.pageSize)
      })
      .catch(()=>{
        if (refresher) refresher.complete()
        this.hasMore = false
      })
  }

  refreshData() {
    const getInfoCb = this.navParams.data ? this.navParams.data.getInfoCb : undefined;
    if(getInfoCb){
      getInfoCb();
    }
    this.initData();
  }

  async getTradeHistory(){

    const token = this.appDataService.token;
    const traderId = this.navParams.data ? this.navParams.data.traderId : undefined;
    const productHouseId = this.navParams.data ? this.navParams.data.productHouseId : undefined;
    const priceProductHouseId = this.navParams.data ? this.navParams.data.priceProductHouseId : undefined;
    if (!token) {
      return Promise.reject(this.events.publish('show login', 'login',this.refreshData.bind(this))).then((res)=>{
        let a = res;
      });
    }

    // const traderId = this.navParams.data ? this.navParams.data.traderId : undefined;
    // const getInfoCb = this.navParams.data ? this.navParams.data.getInfoCb : undefined;
    return this.entrustServiceProvider.getDeliveryList(traderId,productHouseId,priceProductHouseId,this.page,this.pageSize)
      .then(data => {
        console.log('getTradeHistory data:', data)
        return data
      })
      .catch(err => {
        console.log('getTradeHistory err')
        this.alertCtrl
          .create({
            title: window['language']['GAIN_RECORDS_ERROR']||'获取记录出错',
            subTitle: err? err.message||'':err,
          })
          .present();
        return []
      })
  }

  constructor(
    /*public navCtrl: NavController*/
    public navParams: NavParams,
    public alertCtrl: AlertController, 
    public events: Events,
    public appDataService: AppDataService,
    public entrustServiceProvider: EntrustServiceProvider
  ) {
    this.initData();
  }

  async loadMoreHistory(infiniteScroll: InfiniteScroll) {
    this.page += 1;
    const tradeHistory = await this.getTradeHistory();
    this.hasMore = !(tradeHistory.length < this.pageSize)
    const tradeHistory_show = tradeHistory.filter(item => Number(item.completeTotalPrice))
    this.entrusts.push(...tradeHistory_show);
    // console.log('getDeliveryList entrusts:',this.entrusts)
    infiniteScroll.complete();
    infiniteScroll.enable(this.hasMore);
  }

}
