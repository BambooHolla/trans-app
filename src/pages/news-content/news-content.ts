import { Component, ElementRef, OnInit } from "@angular/core";
import {
    Alert,
    AlertController,
    Loading,
    LoadingController,
    NavController,
    NavParams,
} from "ionic-angular";

import { Observable } from "rxjs/Observable";

import { NewsService } from "./news.service";
import { AppSettings } from "../../providers/app-settings";
import { DomSanitizer } from "@angular/platform-browser";
@Component({
    selector: "page-news-content",
    templateUrl: "news-content.html",
})
export class NewsContent implements OnInit {
    news: any; //Observable<object>
    newsId: string;
    newsType: string;

    newInfo: any;
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public elementRef: ElementRef,
        public newsService: NewsService,
        public appSettings: AppSettings,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        public sanitizer: DomSanitizer,
    ) {
        // this.newsType = this.navParams.get("newsType");
        this.newInfo = this.navParams.get("newInfo");
        // this.newInfo.url = this.sanitizer.bypassSecurityTrustHtml(
        //     `<iframe frameborder="0" width="100%" height="100%" src="${this.newInfo.url}" scroll="true" overflow-scroll="true" allowfullscreen="true" webkitallowfullscreen="true"></iframe>`,
        // )
    }

    async ngOnInit() {
        // this.newsId = this.navParams.get("newsId");
        // console.log("新闻id", this.newsId);
        // this.news = await this.newsService.getNews(
        //     undefined,
        //     this.newsId,
        //     this.appSettings.SIM_DATA,
        // );
        // console.log("获取新闻", this, this.news);
    }
}
