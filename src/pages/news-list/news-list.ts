import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
    Slides,
    Content,
    NavParams,
    AlertController,
    InfiniteScroll,
    IonicPage,
    LoadingController,
    Loading,
    NavController,
    Refresher
} from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { NewsContent } from '../news-content/news-content';
import { NewsService } from '../news-content/news.service';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';

// @IonicPage({
//     name:"news-list"
// })
@Component({
    selector: 'page-news-list',
    templateUrl: 'news-list.html'
})
export class NewsListPage /* implements OnInit, OnDestroy  */ extends SecondLevelPage {
    private newsContentPage: any = NewsContent;

    newsList = [];
    newsListSubscriber: Subscription;
    newsListObserver: Observable<any[]>;

    isMock: boolean = false;
    // reqType = 0//数据请求类型,0为初始化列表数据,1为添加
    handler: any;
    hasMore: boolean = true;
    page = 0;
    page_size = 10;

    // private getNewsListTermStream = new Subject<string>();
    // //TODO:下拉刷新
    // getNewsList(page) {
    //     this.getNewsListTermStream.next(page);
    // }

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public newsService: NewsService,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController
    ) {
        super(navCtrl, navParams);
        // this.newsList = this.getNewsListTermStream
        //     .debounceTime(300)
        //     .switchMap(() => this.newsService.getNewsList(undefined, undefined, this.isMock))
        //     .do((data) => {
        //     })
        //     .catch((err) => this.newsService.handleError(err, true))
    }
    slideHeight = 0;
    tabIndex = 0;
    @ViewChild('content', {
        read: Content
    })
    content: Content;
    @ViewChild(Slides) slides: Slides;
    ngAfterViewInit() {
        // this.tradeListElement.
        this.slides.loop = false;
        this.slides.effect = 'slide';
        this.slides.speed = 500;
    }

    @NewsListPage.didEnter
    initSlideHeight() {
        this.slideHeight = this.slides.height =
            this.content.contentHeight ;
        this.slides.update();
    }

    tabClick(index) {
        console.log(this.tabIndex, index);
        if (this.tabIndex == index) {
            return;
        } else {
            this.tabIndex = index;
        }

        this.slides.slideTo(index);
    }

    slideChanged() {
        this.tabIndex = this.slides.realIndex;
    }

    viewNews(id) {
        console.log('viewNews', id);
        this.disable_init_news_list_when_enter = true; // 进入子页面返回后禁用自动刷新数据
        this.navCtrl.push(this.newsContentPage, {
            newsId: id
        });
    }
    //gaubee
    disable_init_news_list_when_enter = false;
    @NewsListPage.willEnter
    tryGetNewsList() {
        if (!this.disable_init_news_list_when_enter) {
            if (!this.newsList.length && !this.is_loading_news_list) {
                this.initNewsList();
            }
        }
        this.disable_init_news_list_when_enter = false;
    }

    // news_list: any[];
    is_loading_news_list = false;
    news_list_loading: Loading;
    @NewsListPage.didEnter
    private _presentNewsListLoading() {
        if (this.is_loading_news_list && !this.news_list_loading) {
            this.news_list_loading = this.loadingCtrl.create({
                showBackdrop: false,
                cssClass: 'enableBackdropDismiss',
                dismissOnPageChange: true
            });
            this.news_list_loading.present({
                minClickBlockDuration: -1,
                disableApp: false // 使得tabs依然可以点击
            });
        }
    }
    @NewsListPage.didLeave
    private _dismissNewsListLoading() {
        if (this.news_list_loading) {
            this.news_list_loading.dismiss();
            this.news_list_loading = null;
        }
    }
    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    async _getNewsList(show_loading = false) {
        this.is_loading_news_list = true;
        if (show_loading) {
            this._presentNewsListLoading();
        }
        try {
            const res = await this.newsService.getNewsList(
                this.page,
                this.page_size,
                '003'
            );
            this.hasMore = res.length === this.page_size;
            this.infiniteScroll && this.infiniteScroll.enable(this.hasMore);
            return res;
        } catch (err) {
            console.error(err);
            this.alertCtrl
                .create({
                    title: '获取咨询出错',
                    subTitle: err.message
                })
                .present();
        } finally {
            this.is_loading_news_list = false;
            this._dismissNewsListLoading();
        }
    }

    async initNewsList(refresher?: Refresher) {
        this.page = 0;
        // 如果有下拉刷新的控件，就不现实了loading层了
        if (refresher) {
            this.newsList = await this._getNewsList();
            console.log(this.newsList);
            refresher.complete();
        } else {
            this.newsList = await this._getNewsList(true);
        }
    }

    async loadMoreNewsList(infiniteScroll: InfiniteScroll) {
        this.page += 1;
        const news_list = await this._getNewsList();
        this.newsList.push(...news_list);
        infiniteScroll.complete();
        infiniteScroll.enable(this.hasMore);
    }
}
