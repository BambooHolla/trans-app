import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AppSettingProvider } from '../../bnlc-framework/providers/app-setting/app-setting';
import { AppFetchProvider } from '../../bnlc-framework/providers/app-fetch/app-fetch';

/*
  Generated class for the AccountServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AccountServiceProvider {
	constructor(
		public http: Http,
		public appSeting: AppSettingProvider,
		public fetch: AppFetchProvider
	) {
	}
	readonly GET_ACCOUNT_ASSETS = this.appSeting.APP_URL('/account/accounts/assets')
}
