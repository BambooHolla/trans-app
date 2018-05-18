import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer } from '@angular/core';
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
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { NewsContent } from '../news-content/news-content';
import {
    NewsServiceProvider,
    NewModel,
    NewsMsgType
} from '../../providers/news-service/news-service';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {AppSettingProvider} from "../../bnlc-framework/providers/app-setting/app-setting"
// @IonicPage({
//     name:"news-list"
// })
@Component({
    selector: 'page-news-list',
    templateUrl: 'news-list.html'
})
export class NewsListPage /* implements OnInit, OnDestroy  */ extends SecondLevelPage {
    private newsContentPage: any = NewsContent;
    public serverUrl = this.appSettin.APP_URL('file/read/')
    newsList = {
        list: [] as NewModel[],
        hasMore: true,
        page: 1,
        page_size: 10
    };
    noticeList = {
        list: [] as NewModel[],
        hasMore: true,
        page: 1,
        page_size: 10
    };

    @ViewChild('searchInputWrap', { read: ElementRef }) searchInputWrap;
    private showSearch = false;
    private useSearch = false;
    private query:string = '';
    private searchTermStream = new BehaviorSubject<string>('');
    search(term: string) {
        this.searchTermStream.next(term);
        this.useSearch = true;
    }

    // reqType = 0//数据请求类型,0为初始化列表数据,1为添加

    // private getNewsListTermStream = new Subject<string>();
    // //TODO:下拉刷新
    // getNewsList(page) {
    //     this.getNewsListTermStream.next(page);
    // }

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public newsService: NewsServiceProvider,
        public alertCtrl: AlertController,
        public appSettin : AppSettingProvider,
        public loadingCtrl: LoadingController,
		public renderer: Renderer,
    ) {
        super(navCtrl, navParams);
    }
    slideHeight = 0;
    tabIndex = 0;

    ngOnInit() {
        this.searchTermStream
            // .takeUntil(this.viewDidLeave$)
            .debounceTime(300)
            .map(str => str && str.trim())
            .distinctUntilChanged()
            .do(str => console.log('searchNews:Stream',str))
            .filter(str => str != this.query)
            // .switchMap((term: string) => Observable.of(term.trim().toLowerCase()))
            .subscribe(str=>this.searchNews(str))
    }

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
        this.slideHeight = this.slides.height = this.content.contentHeight;
        this.slides.update();
    }
    tabClick(index) {
        console.log('Q!!!!!!', this.tabIndex, index);
        if (this.tabIndex == index) {
            return;
        } else {
            this.tabIndex = index;
            this.getCurrentContent();
        }
        this.slides.slideTo(index);
    }
    slideChanged() {
        console.log('Q!!!!!!', this.slides.realIndex);
        this.tabIndex = this.slides.realIndex;
        this.getCurrentContent();
    }
    getCurrentContent() {
        if (this.tabIndex == 0) {
            this.tryGetNoticeList();
        } else if (this.tabIndex == 1) {
            this.tryGetNewsList();
        }
    }

    viewNews(id) {
        console.log('viewNews', id);
        this.disable_init_list_when_enter = true; // 进入子页面返回后禁用自动刷新数据
        this.navCtrl.push(this.newsContentPage, {
            newsId: id,
            newsType: this.tabIndex
        });
    }
    disable_init_list_when_enter = false;

    @NewsListPage.willEnter
    tryGetData() {
        this.getCurrentContent();
    }
    tryGetNewsList() {
        if (!this.disable_init_list_when_enter) {
            if (
                !this.newsList.list.length &&
                !this.news_loading_handler.is_loading
            ) {
                this.initNewsList();
            }
        }
        this.disable_init_list_when_enter = false;
    }
    tryGetNoticeList() {
        if (!this.disable_init_list_when_enter) {
            if (
                !this.noticeList.list.length &&
                !this.notice_loading_handler.is_loading
            ) {
                this.initNoticeList();
            }
        }
        this.disable_init_list_when_enter = false;
    }

    news_loading_handler = new LoadingHanlder(this.loadingCtrl);
    notice_loading_handler = new LoadingHanlder(this.loadingCtrl);
    @NewsListPage.didEnter
    showLoadingHandler() {
        this.news_loading_handler.show();
        this.notice_loading_handler.show();
    }
    hideLoadingHandler() {
        this.news_loading_handler.hide();
        this.notice_loading_handler.hide();
    }

    @ViewChild('newsIS', { read: InfiniteScroll })
    newsInfiniteScroll: InfiniteScroll;
    @asyncCtrlGenerator.error('获取新闻出错')
    async _getNewsList(show_loading = false) {
        this.news_loading_handler.is_loading = true;
        if (show_loading) {
            this.news_loading_handler.show();
        }
        const { newsList } = this;
        try {
            const res = await this.newsService.getNewsList({
                page: newsList.page,
                pageSize: newsList.page_size,
                msgType: NewsMsgType.news,
                q: this.query,
            });
            newsList.hasMore = res.length === newsList.page_size;
            this.newsInfiniteScroll &&
                this.newsInfiniteScroll.enable(newsList.hasMore);
            return res;
        } finally {
            this.news_loading_handler.is_loading = false;
            this.news_loading_handler.hide();
        }
    }

    @ViewChild('noticeIS', { read: InfiniteScroll })
    noticeInfiniteScroll: InfiniteScroll;
    @asyncCtrlGenerator.error('获取公告出错')
    async _getNoticeList(show_loading = false) {
        this.notice_loading_handler.is_loading = true;
        if (show_loading) {
            this.notice_loading_handler.show();
        }
        const { noticeList } = this;
        try {
            const res = await this.newsService.getNewsList({
                page: noticeList.page,
                pageSize: noticeList.page_size,
                msgType: NewsMsgType.notice,
                q:this.query,
            });
            noticeList.hasMore = res.length === noticeList.page_size;
            this.noticeInfiniteScroll &&
                this.noticeInfiniteScroll.enable(noticeList.hasMore);
            return res;
        } finally {
            this.notice_loading_handler.is_loading = false;
            this.notice_loading_handler.hide();
        }
    }

    async initNewsList(refresher?: Refresher) {
        this.newsList.page = 1;
        // 如果有下拉刷新的控件，就不现实了loading层了
        if (refresher) {
            this.newsList.list = await this._getNewsList();
            console.log(this.newsList);
            refresher.complete();
        } else {
            this.newsList.list = await this._getNewsList();
        }
    }
    async initNoticeList(refresher?: Refresher) {
        this.noticeList.page = 1;
        // 如果有下拉刷新的控件，就不现实了loading层了
        if (refresher) {
            this.noticeList.list = await this._getNoticeList();
            console.log(this.noticeList);
            refresher.complete();
        } else {
            this.noticeList.list = await this._getNoticeList();
        }
    }

    async loadMoreNewsList(infiniteScroll: InfiniteScroll) {
        const { newsList } = this;
        newsList.page += 1;
        const news_list = await this._getNewsList();
        newsList.list.push(...news_list);
        infiniteScroll.complete();
        infiniteScroll.enable(newsList.hasMore);
    }
    async loadMoreNoticeList(infiniteScroll: InfiniteScroll) {
        const { noticeList } = this;
        noticeList.page += 1;
        const notice_list = await this._getNoticeList();
        noticeList.list.push(...notice_list);
        infiniteScroll.complete();
        infiniteScroll.enable(noticeList.hasMore);
    }

    toShowSearch(searchInput) {
        searchInput.value = '';
        this.showSearch = true;
        this.renderer.setElementStyle(this.searchInputWrap.nativeElement, 'width', 'unset');
    }

    cancelFilter() {
        this.showSearch = false;
        this.query = '';
        if (this.tabIndex == 0 && this.useSearch) {
            this.initNoticeList();
        } else if (this.tabIndex == 1 && this.useSearch) {
            this.initNewsList();
        }
        this.useSearch = false;
    }

    async searchNews(str:string){
        this.query = str;
        if (this.tabIndex == 0) {
            this.noticeList.list = await this._getNoticeList();
        } else if (this.tabIndex == 1) {
            this.newsList.list = await this._getNewsList();
        }
    }
}

class LoadingHanlder {
    constructor(public loadingCtrl: LoadingController) {}
    is_loading: boolean = false;
    loading: Loading;
    show() {
        if (this.is_loading && !this.loading) {
            this.loading = this.loadingCtrl.create({
                showBackdrop: false,
                cssClass: 'enableBackdropDismiss',
                dismissOnPageChange: true
            });
            this.loading.present({
                minClickBlockDuration: -1,
                disableApp: false // 使得tabs依然可以点击
            });
        }
    }
    @NewsListPage.didLeave
    hide() {
        if (this.loading) {
            this.loading.dismiss();
            this.loading = null;
        }
    }
}
