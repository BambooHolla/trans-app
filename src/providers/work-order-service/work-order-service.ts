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
	type: ContactType;
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
export enum ContactType {
	question = '001', //常见问题
	advice = '002' //意见反馈
}
export enum ContactStatus {
	submited = '001', //已提交
	following = '002', //跟进中
	answering = '003', //已反馈
	resolved = '010' //已处理
}
export enum ReplyRole {
	admin = '000', //超級管理
	service = '001', //客服
	customer = '002' //客戶
}
export type AddContactOptions = {
	type: ContactType;
	content: string;
	attachment: string[];
};

@Injectable()
export class WorkOrderServiceProvider {
	constructor(
		public appSetting: AppSettingProvider,
		public fetch: AppFetchProvider
	) {}

	static getConcatTypeDetail(type: ContactType) {
		if (type == ContactType.question) return '常见问题';
		if (type == ContactType.advice) return '意见反馈';
		return type;
	}
	static getContactStatusDetail(status: ContactStatus) {
		if (status == ContactStatus.submited) return '已提交';
		if (status == ContactStatus.following) return '跟进中';
		if (status == ContactStatus.answering) return '已反馈';
		if (status == ContactStatus.resolved) return '已处理';
		return status;
	}
	static getReplyRoleDetail(role: ReplyRole) {
		if (role == ReplyRole.admin) return '超級管理';
		if (role == ReplyRole.service) return '客服';
		if (role == ReplyRole.customer) return '客戶';
		return status;
	}

	readonly CONTACTS = this.appSetting.APP_URL('contact/contacts');
	readonly CONTACT_ITEM = this.appSetting.APP_URL(
		'contact/contact/:workOrderId'
	);
	readonly CONTACT_REPLY = this.appSetting.APP_URL(
		'contact/contactreply/:contactId'
	);

	private _formatSkipAndLimitSearch(search?: {
		page?: number;
		pageSize?: number;
		skip?: number;
		limit?: number;
	}) {
		if (search) {
			if ('page' in search) {
				search.skip = (search.page | 0) + 1;
				// delete search.page;
			}
			if ('pageSize' in search) {
				search.limit = search.pageSize;
				// delete search.pageSize;
			}
			if ((search.skip | 0) === 0) {
				delete search.skip;
			}
		}
		return search;
	}

	addWorkOrder(body: { [k in keyof ContactModel]?: ContactModel[k] }) {
		return this.fetch.post<ContactModel>(this.CONTACTS, body);
	}
	getWorkOrderList(search?: {
		type?: ContactType;
		status?: ContactStatus;
		workOrderId?: string;
		page?: number;
		pageSize?: number;
		skip?: number;
		limit?: number;
	}) {
		search = this._formatSkipAndLimitSearch(search);

		return this.fetch.autoCache(true).get<ContactModel[]>(this.CONTACTS, { search });
	}
	getContactReplyList(
		contactId: string,
		search?: {
			page?: number;
			pageSize?: number;
			skip?: number;
			limit?: number;
		}
	) {
		search = this._formatSkipAndLimitSearch(search);

		return this.fetch.autoCache(true).get<ReplyModel[]>(this.CONTACT_REPLY, {
			search,
			params: { contactId }
		});
	}
	addContactReply(
		contactId: string,
		body: { [k in keyof ReplyModel]?: ReplyModel[k] }
	) {
		return this.fetch.post<ReplyModel>(this.CONTACT_REPLY, body, {
			params: { contactId }
		});
	}
}

export type ContactModel = {
	workOrderId: string;
	submitCustomerId: string;
	type: ContactType;
	content: string;
	name: string;
	phone: string;
	email: string;
	attachment: string[];
	items: string;
	submitDateTime: string;
	status: ContactStatus;
	followUserId: string;
	followDateTime: string;
	feedbackContent: string;
	feedbackDateTime: string;
	confirmDateTime: string;
};

export type ReplyModel = {
	workOrderId: string;
	senderId: string;
	senderRole: ReplyRole;
	content: string;
	attachment: string[];
	sendDateTime: string;
};
