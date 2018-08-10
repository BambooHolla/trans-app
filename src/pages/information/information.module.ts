import { NgModule } from "@angular/core";
// import { CommonModule } from '@angular/common';
import { IonicPageModule } from "ionic-angular";

import { InformationPage } from "./information";
import { NoticeListPage } from "../notice-list/notice-list";
import { NewsListPage } from "../news-list/news-list";

import { NewsContent } from "../news-content/news-content";
import { NoticePage } from "../notice/notice";

import { AlertService } from "../../providers/alert-service";

// import { NewsContentModule } from '../news-content/news-content.module';
// import { NoticeModule } from "../notice/notice.module";
import { BaseSharedModule } from "../../shared/base-shared.module";
import { InfoSharedModule } from "../../shared/info-shared.module";
import { NewsService } from "../news-content/news.service";
import { TranslateModule } from "@ngx-translate/core";
@NgModule({
    declarations: [
        InformationPage,
        NoticeListPage,
        NewsListPage,

        NewsContent,
        NoticePage,
    ],
    entryComponents: [NewsContent, NoticePage],
    providers: [AlertService, NewsService],
    imports: [
        BaseSharedModule,
        InfoSharedModule,
        TranslateModule,
        // CommonModule,
        // NewsContentModule,
        // NoticeModule,
        IonicPageModule.forChild(InformationPage),
    ],
    exports: [InformationPage],
})
export class InformationModule {}
