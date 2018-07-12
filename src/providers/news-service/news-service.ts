import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import {
    AppSettingProvider,
    TB_AB_Generator,
} from "../../bnlc-framework/providers/app-setting/app-setting";
import { AppFetchProvider } from "../../bnlc-framework/providers/app-fetch/app-fetch";
import { AsyncBehaviorSubject } from "../../bnlc-framework/providers/RxExtends";

/*
  Generated class for the NewsServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
export type NewModel = {
    newsId: string;
    publisherType: string;
    msgType: string;
    publisherId: string;
    newsTitle: string;
    abstract: string;
    content: string;
    cover: string;
    relationType: string;
    status: string;
    relationId: string;
    crtUserId: string;
    crtDateTime: string;
    lstModUserId: string;
    lstModDateTime: string;
};
@Injectable()
export class NewsServiceProvider {
    constructor(
        public http: Http,
        public appSetting: AppSettingProvider,
        public fetch: AppFetchProvider,
    ) {
        console.group("Hello NewsServiceProvider Provider");
        console.groupEnd();
    }
    readonly GET_NEWS_LIST = this.appSetting.APP_URL("news/news");
    readonly GET_NEW_DETAIL = this.appSetting.APP_URL("news/news/:news_id");
    readonly GET_COMMENT_LIST = this.appSetting.APP_URL("news/getCommentList");
    readonly UPDATE_COMMENT = this.appSetting.APP_URL("news/updateComment");
    readonly ADD_COMMENT = this.appSetting.APP_URL("news/addComment");

    getNewsList(query?: {
        page?: number;
        pageSize?: number;
        msgType?: NewsMsgType;
        status?: NewsStatusType;
        q?: string;
    }) {
        return this.fetch.autoCache(true).get<NewModel[]>(
            this.GET_NEWS_LIST,
            {
                search: Object.assign({ page: 0 }, query),
            },
            true,
        );
    }
    getNewDetail(news_id: string) {
        return this.fetch
            .autoCache(true)
            .get(this.GET_NEW_DETAIL, { params: { news_id } });
    }
    getCommentList(newsId: string, pageSize?: number, page?: number) {
        return this.fetch.autoCache(true).get(this.GET_COMMENT_LIST, {
            search: {
                page,
                pageSize,
                newsId,
            },
        });
    }
    updateComment(newsCommentId: string, status: string, content: string) {
        return this.fetch.post(this.UPDATE_COMMENT, {
            newsCommentId,
            status,
            content,
        });
    }
    addComment(newsId: string, content: string) {
        return this.fetch.post(this.ADD_COMMENT, {
            newsId,
            content,
        });
    }
}
export enum NewsMsgType {
    news = "001", // 新闻
    notice = "002", // 公告
    mediaCoverage = "003", // 媒体报道
    companyIntroduce = "004", // 公司介绍
    personalStory = "005", // 人物故事
    investmentClass = "006", // 投资课堂
    Other = "999", // 其他
}
export enum NewsStatusType {
    Ready = "001", // 准备中
    Release = "002", // 已发布
    Withdraw = "003", // 已撤回
    Other = "999", // 其他
}
