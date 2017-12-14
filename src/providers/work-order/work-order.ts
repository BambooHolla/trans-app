import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
	AppSettingProvider,
	TB_AB_Generator
} from '../../bnlc-framework/providers/app-setting/app-setting';
import { AppFetchProvider } from '../../bnlc-framework/providers/app-fetch/app-fetch';
import { AsyncBehaviorSubject } from '../../bnlc-framework/providers/RxExtends';

/*
  Generated class for the WorkOrderProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class WorkOrderProvider {
	constructor(
		public appSetting: AppSettingProvider,
		public fetch: AppFetchProvider
	) {}
}
