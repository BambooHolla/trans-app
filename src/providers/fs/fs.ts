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
	) { }

	readonly GET_FILE_ID = this.appSetting.APP_URL('file/id');
	readonly UPLOAD_FILE = this.appSetting.APP_URL('file/file/:fid');
	readonly READ_FILE_PREFIX = this.appSetting.APP_URL('file');
	readonly READ_FILE = this.appSetting.APP_URL('file/read/:fid');

	getImageUploaderId(fileType: FileType) {
		return this.fetch.post<{ fid: string }>(this.GET_FILE_ID, {}, {
			search: { fileType }
		}).then(data => data.fid);
	}
	readImage(fid: string) {
		return this.fetch.get<any>(this.READ_FILE, {
			params: {
				fid
			}
		})
	}
	uploadImage(fid: string, file: any) {
		const formData = new FormData();
		formData.append('file', file); 
		return this.fetch.post<UploadedFileModel>(this.UPLOAD_FILE, formData, { params: { fid } },undefined,undefined,20000).then(data => {
			return {
				full_url: this.READ_FILE_PREFIX + data.link,
				...data
			}
		})
	}
}

export enum FileType {
	新闻图片 = '001',
	身份证图片 = '002',
	个人传记图片 = '003',
	工单图片 = '004'
}
export type UploadedFileModel = {
	"name": string,
	"size": number,
	"link": string
}