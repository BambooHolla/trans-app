import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
	AppSettingProvider,
	TB_AB_Generator
} from '../../bnlc-framework/providers/app-setting/app-setting';
import { AppFetchProvider } from '../../bnlc-framework/providers/app-fetch/app-fetch';
import { AsyncBehaviorSubject } from '../../bnlc-framework/providers/RxExtends';

export type ConcatModel = {
	workOrderId: string;
	submitCustomerId: string;
	type: ConcatType;
	content: string;
	attachment: string[];
	submitDateTime: string;
	status: string;
	followUserId: string;
	followDateTime: string;
	feedbackContent: string;
	feedbackDateTime: string;
	confirmDateTime: string;
};
export enum ConcatType {
	question = '001', //常见问题
	advice = '002' //意见反馈
}
export type AddConcatOptions = {
	type: ConcatType;
	content: string;
	attachment: string[];
};

@Injectable()
export class WorkOrderServiceProvider {
	constructor(
		public appSetting: AppSettingProvider,
		public fetch: AppFetchProvider
	) {}

	readonly CONTACTS = this.appSetting.APP_URL('contact/contacts');
	readonly CONTACT_ITEM = this.appSetting.APP_URL(
		'contact/contact/:workOrderId'
	);

	addWorkOrder() {}
}
