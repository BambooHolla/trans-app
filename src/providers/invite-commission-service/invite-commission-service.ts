import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {
	AppSettingProvider,
	TB_AB_Generator
} from '../../bnlc-framework/providers/app-setting/app-setting';
import { AppFetchProvider } from '../../bnlc-framework/providers/app-fetch/app-fetch';
import { AsyncBehaviorSubject } from '../../bnlc-framework/providers/RxExtends';

/*
  Generated class for the NewsServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

@Injectable()
export class InviteCommissionServiceProvider {
	constructor(
		public http: Http,
		public appSetting: AppSettingProvider,
		public fetch: AppFetchProvider
	) {
		console.group('Hello InviteCommissionService Provider');
		console.groupEnd();
	}
    readonly GET_RECOMMEND_COUNT = this.appSetting.APP_URL('user/getRecommendCount');
	readonly GET_MY_RECOMMENDER = this.appSetting.APP_URL('user/getMyRecommender');
	readonly SET_INVITATION_CODE = this.appSetting.APP_URL('user/setInvitationCode');


	getRecommendCount(customerId: string) {
		return this.fetch.autoCache(true).get(this.GET_RECOMMEND_COUNT, {
			search: {
                customerId: customerId,
            }
		},false);
	}
	getMyRecommender() {
		return this.fetch
			.autoCache(true)
			.get(this.GET_MY_RECOMMENDER,{},false);
	}
	setInvitationCode(code: string) {
		return this.fetch.autoCache(true).post(this.SET_INVITATION_CODE, 
			{
				code
			},undefined,false);
	}

}