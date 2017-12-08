import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {
	AppSettingProvider,
	TB_AB_Generator
} from '../../bnlc-framework/providers/app-setting/app-setting';
import { AppFetchProvider } from '../../bnlc-framework/providers/app-fetch/app-fetch';

/*
  Generated class for the FsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class FsProvider {
	constructor(
		public http: Http,
		public appSetting: AppSettingProvider,
		public fetch: AppFetchProvider
	) {}

	readonly GET_FILE_ID = this.appSetting.APP_URL('file/id');
	readonly UPLOAD_FILE = this.appSetting.APP_URL('file/file/:fid');

	getImageUploaderId(fileType: FileType) {
		return this.fetch
			.post<{ fid: string }>(
				this.GET_FILE_ID,
				{},
				{
					search: { fileType }
				}
			)
			.then(data => data.fid);
	}
	uploadImage(fid: string, file: any) {
		return this.fetch.post(this.UPLOAD_FILE, { file }, { params: { fid } });
	}
}

export enum FileType {
	新闻图片 = '001',
	身份证图片 = '002'
}
