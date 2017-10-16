import { Component, OnInit } from '@angular/core';
// import { Http, Headers, Response, URLSearchParams, RequestOptions } from "@angular/http";
import { Http, Headers, URLSearchParams, RequestOptions } from "@angular/http";
import { AppDataService } from "../../providers/app-data-service";
import { AppSettings } from "../../providers/app-settings";
// import { Observable } from "rxjs/Observable";
import { ToastController, AlertController } from "ionic-angular";
// import * as echarts from 'echarts';
// import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-commission-list',
  templateUrl: 'commission-list.html'
})
export class CommissionListPage implements OnInit{
  smoothlinedata:any;
  activeIndex: number = 0;
  titleArray: string[] = ['已申报', '已成交', '未成交', '已撤销'];
  smoothlinedataList: any[] = [];
  old_optionalListData: any[] = [
    {
        id: "001098",
        name: '云开智能',
        time:'2016-3-28 10:00',
        commit:32.8,
        average:32.8,
        commission:1600,
        deal: 0,
        state: '买入',
    },
    {
        id: "601002",
        name: '云开智能',
        time:'2016-3-28 10:00',
        commit:32.8,
        average:32.8,
        commission:1600,
        deal: 0,
        state: '卖出',
    },
    {
        id: "201002",
        name: '云开智能',
        time:'2016-3-28 10:00',
        commit:32.8,
        average:32.8,
        commission:1600,
        deal: 0,
        state: '买入',
    },
    {
        id: "001098",
        name: '云开智能',
        time:'2016-3-28 10:00',
        commit:32.8,
        average:32.8,
        commission:1600,
        deal: 0,
        state: '卖出',
    },
    {
        id: "601002",
        name: '云开智能',
        time:'2016-3-28 10:00',
        commit:32.8,
        average:32.8,
        commission:1600,
        deal: 0,
        state: '卖出',
    },
    {
        id: "201002",
        name: '云开智能',
        time:'2016-3-28 10:00',
        commit:32.8,
        average:32.8,
        commission:1600,
        deal: 0,
        state: '卖出',
    },
    {
        id: "001098",
        name: '云开智能',
        time:'2016-3-28 10:00',
        commit:32.8,
        average:32.8,
        commission:1600,
        deal: 0,
        state: '卖出',
    },
    {
        id: "601002",
        name: '云开智能',
        time:'2016-3-28 10:00',
        commit:32.8,
        average:32.8,
        commission:1600,
        deal: 0,
        state: '卖出',
    },
    {
        id: "201002",
        name: '云开智能',
        time:'2016-3-28 10:00',
        commit:32.8,
        average:32.8,
        commission:1600,
        deal: 0,
        state: '买入',
    },
    {
        id: "001098",
        name: '云开智能',
        time:'2016-3-28 10:00',
        commit:32.8,
        average:32.8,
        commission:1600,
        deal: 0,
        state: '卖出',
    },
  ];
  optionalListData: any[]
  
  dictionary = {
    commissionResult: {
      0: "未申报",
      1: "正在申报",
      2: "已申报",
      3: "非法委托",
      4: "申请资金授权中",
      5: "部分成交",
      6: "全部成交",
      7: "部成部撤",
      8: "全部撤单",
      9: "撤单未成",
    }
  }

  initData() { 
    function backInOut(k) {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) { return 0.5 * (k * k * ((s + 1) * k - s)); }
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }

    for (let j = 0; j < this.titleArray.length; j++){
        const smoothlinedata = [];
        const dd = 10;
        for (let i = 0; i <= dd; i++) {
          const x = i / dd;
          const y = backInOut(x) * (1 + Math.random() * .3);
          smoothlinedata.push([x, y]);
        }

        this.smoothlinedataList.push(smoothlinedata);
    }
  }

  constructor(
    private http: Http,
    public appDataService: AppDataService,
    public AppSettings: AppSettings,
    private toastCtrl: ToastController, 
    private alertCtrl: AlertController,
  ) {
    this.initData();
  }
  changeActive(index){
    this.activeIndex=index;
  }

  ngOnInit() {
    // console.log('commission ngOnInit')
    this.getCommissionList()
  }

  getCommissionList(){
    let serverUrl = `${this.AppSettings.SERVER_URL}/api/v1/gjs/biz/transactions/equityCommission`

    let params = new URLSearchParams();
    params.set('startDate', '20170101');
    params.set('endDate', '20170717');
    params.set('equityCode', '010001');

    const headers = new Headers();
    headers.append('X-AUTH-TOKEN', this.appDataService.token);

    this.http
      .get(serverUrl, {
        // search: params,
        headers: headers,
      })
      .toPromise()
      .then(response => {
        const resData = response.json()
        let data = []
        // console.log('commission-list resData: ', resData)
        if (resData && resData.data){
          data = resData.data
            //过滤撤单委托
            .filter(item => 
              item.FID_CXBZ != "W"
            )
            .map(item => ({
              id: item.FID_WTH,
              name: item.FID_GQMC,
              time: `${item.FID_WTRQ.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3')} ${item.FID_WTSJ}`,
              // time: new Date(`${item.FID_WTRQ.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3')} ${item.FID_WTSJ}`),
              commit: item.FID_WTJG,
              average: item.FID_CJJG,//这个没有找到对应字段,使用成交价格
              commission: item.FID_WTSL,
              deal: item.FID_CJSL,
              category: item.FID_LBMC,
              state: item.FID_SBJG,
              _2cancel: item.FID_CXBZ === "W",
            }))
          this.optionalListData = data
        } else if (resData.err){
          Promise.reject(resData.err)
        }
      })
      .catch()
  }

  confirmCancel(commissionId,commissionTime,commissionCategory){
    let alert = this.alertCtrl.create({
      title: '撤回委托',
      message: `确定要撤回${commissionTime}的${commissionCategory}委托单?`,
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked')
          }
        },
        {
          text: '确认',
          handler: () => {
            this.cancelCommission(commissionId)
          }
        }
      ]
    })
    alert.present()
  }

  cancelCommission(commissionId){
    // console.log('cancel',commissionId)
    const url  = `${this.AppSettings.SERVER_URL}/api/v1/gjs/biz/transactions/cancelEquityCommission`
    const headers = new Headers({ 'Content-Type': 'application/json'});
    headers.append('X-AUTH-TOKEN', this.appDataService.token);
    
    const options = new RequestOptions({ headers: headers });
    
    let data ={
      commissionCode: commissionId,
      passworkd: '',
    }
    
    this.http.post(url, data, options)
    .toPromise()
    .then(response =>{
      // console.dir(response)
      
      const resData = response.json().data
      // [{ "FID_CODE": "1", "FID_MESSAGE": "委托成功,您这笔委托的合同号是:201" }]
      const result = resData instanceof Array ? resData[0] : resData

      if (typeof result === 'object' && result.FID_CODE) {
        let toast = this.toastCtrl.create({
          message: `${result.FID_MESSAGE}`,
          duration: 3000,
          position: 'middle'
        })
        toast.present()
        this.getCommissionList()
      } else {
        return Promise.reject(response.json().err);
      }
    })
    .catch(err => {
      if (err && err.message) {
        let toast = this.toastCtrl.create({
          message: `${err.message}`,
          duration: 3000,
          position: 'middle'
        })
        toast.present()
      }else{
        // console.log('commission err:', err)
      }
    });
  }
}