import { Component } from '@angular/core';
import { EntrustServiceProvider } from '../../providers/entrust-service';
import { NavParams, Refresher, InfiniteScroll, AlertController } from 'ionic-angular';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import { PersonalDataService } from '../../providers/personal-data-service';
import { AppService } from '../../providers/app.service';
import { Http, RequestMethod, URLSearchParams } from '@angular/http';
import { AppDataService } from '../../providers/app-data-service';
import { AppSettingProvider } from '../../bnlc-framework/providers/app-setting/app-setting';

@Component({
  selector: 'page-invite-commission',
  templateUrl: 'invite-commission.html'
})
export class InviteCommissionPage {
  recommendCounts = '';
  recommender = '';

  ref;
  page = 1;
  pageSize = 10;
  hasMore: boolean = true;
  recharge_address = {
    "index":"asdf1234"
  }
  initData(refresher?: Refresher) {
    this.requestRecommendData(); //获取邀请多少人
    this.requestRecommender()
  }

  constructor(
    /*public navCtrl: NavController*/
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public entrustServiceProvider: EntrustServiceProvider,
    public personalDataService: PersonalDataService,
    public appService: AppService,
    public appDataService: AppDataService,
    public setting: AppSettingProvider
  ) {
    this.initData();
    this.ref = this.setting.RECOMMEND_PREFIX + this.personalDataService.recommendCode;
  }

  @asyncCtrlGenerator.success('地址已经成功复制到剪切板')
	@asyncCtrlGenerator.error('地址复制失败')
	async copyCode() {
		if (!this.recharge_address.index) {
			throw new Error('无可用地址');
		}
		if (!navigator['clipboard']) {
			throw new Error('复制插件异常');
		}
		navigator['clipboard'].writeText(
			this.recharge_address.index,
		);
  }
    //获取推荐了多少人
    requestRecommendData(): Promise<any> {
      const path = `/user/getRecommendCount`
      return this.appService.request(RequestMethod.Get, path, {customerId:this.appDataService.customerId}, true)
        .then(data => {
          if (!data) {
            return Promise.reject(new Error('data missing'));
          }
          // 返回数据格式为数组，暂时只使用数组第一组元素。
          this.recommendCounts = data.count[0].count;
        })
        .catch(err => {
          console.log('getCustomersData error: ', err);
          // return Promise.reject(err);
        });
  }

      //获取推荐人
      requestRecommender(): Promise<any> {
        const path = `/user/getRecommendList`
        return this.appService.request(RequestMethod.Get, path, undefined, true)
          .then(data => {
            console.log('recommenders: ', data);
            if (!data) {
              return Promise.reject(new Error('data missing'));
            }
            // 返回数据格式为数组，暂时只使用数组第一组元素。
            if (data.realName) {
              this.recommender = data[0].realName
            }else if (data.telephone) {
              this.recommender = data[0].telephone
            } else if (data.email) {
              this.recommender = data[0].email
            }
          })
          .catch(err => {
            console.log('getCustomersData error: ', err);
            // return Promise.reject(err);
          });
      }

}
