import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';

import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";

import { NewsContent } from '../news-content/news-content';
import { NewsService } from "../news-content/news.service";

// @IonicPage({
//     name:"news-list"
// })
@Component({
    selector: 'page-news-list',
    templateUrl: 'news-list.html',
})
export class NewsListPage implements OnInit,OnDestroy {

    private newsContentPage:any = NewsContent;

    newsList = []
    newsListSubscriber: Subscription
    newsListObserver:Observable<any[]>

    isMock:boolean = false
    reqType = 0//数据请求类型,0为初始化列表数据,1为添加
    handler:any
    hasMore: boolean = true
    page = 0

    private getNewsListTermStream = new Subject<string>();
    //TODO:下拉刷新
    getNewsList(page) {
        this.getNewsListTermStream.next(page);
    }

    constructor(
        public navCtrl: NavController,
        public newsService: NewsService,
    ) {
        // this.newsList = this.getNewsListTermStream
        //     .debounceTime(300)
        //     .switchMap(() => this.newsService.getNewsList(undefined, undefined, this.isMock))
        //     .do((data) => {

        //     })
        //     .catch((err) => this.newsService.handleError(err, true))
    };

    sites_old=[
        {
            "titleImg":"assets/images/test/01.jpg",
            "avatar":"assets/images/test/004.png",
            "title":"关于平安易宝系统升级通知",
            "publishTime":"今天11:02",
            "readNumber":"120",
            id: Math.random() * 1000,
        },
        {
            "titleImg":"assets/images/test/002.png",
            "avatar":"assets/images/test/005.png",
            "title":"福建省知识产权局领导到高交所调研局领导到高交所调研",
            "publishTime":"今天11:00",
            "readNumber":"180",
            id: Math.random() * 1000,
        },
        {
            "titleImg":"assets/images/test/003.png",
            "avatar":"assets/images/test/006.png",
            "title":"李克强:持续加大支持实体经济力度",
            "publishTime":"03-08 20:00",
            "readNumber":"820",
            id: Math.random() * 1000,
        },
        {
            "titleImg":"assets/images/test/002.png",
            "avatar":"assets/images/test/004.png",
            "title":"李克强:持续加大支持实体经济力度",
            "publishTime":"03-08 20:00",
            "readNumber":"820",
            id: Math.random() * 1000,
        },
    ];

    ngOnInit() {
        console.log('news-list: onInit')
        this.newsListSubscriber =this.getNewsListTermStream
            .debounceTime(300) 
            .switchMap(page => this.newsService.getNewsList(undefined, '001',page,this.isMock))
            .do((data) => {
                console.dir(data)
            })
            .catch((err) => this.newsService.handleError(err, true))
            // .subscribe(data=>{
            //     if(data instanceof Array){
            //         this.newsList.push(...data)
            //         this.page++
            //     }
            // })
            .subscribe(data => this.dataHandle(data,this.reqType))
        // 加入异步队列,保证订阅启动后才去获取
        setTimeout(() => this.getNewsList(this.page), 0);
    }

    ngOnDestroy() {
        console.log('news-list: onDestroy')        
    }
    ionViewDidLoad(){
        console.log('news-list: ionViewDidLoad')        
        // this.newsListSubscriber = this.newsList.subscribe()
    }
    ionViewDidLeave() {
        console.log('news-list: ionViewDidLeave')        
        // this.newsListSubscriber.unsubscribe()
    }

    // 下拉刷新
    listRefresh(refresher) {
        // //需要设置第一个公告的对象
        // this.appDataService.noticeListModel.loadList()
        //     .then(err => {
        //         if (err) {
        //             // this.toastAlert('加载列表错误:' + (err as any).message, 5000);
        //         } else {
        //             this.hasMore = true;
        //         }
        //         refresher.complete();
        //     });

        this.page = 0
        this.reqType = 0
        this.handler = refresher
        this.getNewsList(this.page)
        setTimeout(() => { refresher.complete()},1000)
    }

    //上拉加载更多
    getMore(infiniteScroll) {
        // this.appDataService.noticeListModel.loadMore()
        //     .then(result => {
        //         if (result instanceof Error) {
        //             // this.toastAlert((result as Error).message, 5000);
        //         } else {
        //             this.hasMore = result;
        //             if (!result) {
        //                 // this.toastAlert('没有更多公告了！', 3000, 'bottom');
        //             }
        //         }
        //         infiniteScroll.complete();
        //     });
        this.reqType = 1;
        this.handler = infiniteScroll
        this.getNewsList(this.page)
    }

    dataHandle(data,type){
        if (data instanceof Array && data.length > 0) {
            if (type === 0) {
                this.newsList.length = 0
            }

            this.hasMore = true
            this.newsList.push(...data)
            this.page++
        }else{
            this.hasMore = false
        }
        if(this.handler){
            this.handler.complete()
            this.handler = undefined
        }
    }

    viewNews(id) {
        console.log("viewNews",id);
        this.navCtrl.push(this.newsContentPage, {
            newsId: id
        });
    }

}
