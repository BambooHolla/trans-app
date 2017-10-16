import { Component } from '@angular/core';
// import * as echarts from 'echarts';
// import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-history-record',
  templateUrl: 'history-record.html'
})
export class HistoryRecordPage {
  smoothlinedata:any;

  initData() {
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
  }


  constructor(/*public navCtrl: NavController*/) {
    this.initData();
  }

}
