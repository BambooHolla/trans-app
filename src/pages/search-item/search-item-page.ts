import { Component, OnInit } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";

import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

// import { Subject } from "rxjs/Subject";

import { SearchService } from "./search.service";

/**
 * Generated class for the SearchItem page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: "search-item-page",
    templateUrl: "search-item-page.html",
})
export class SearchItemPage implements OnInit {
    recommendListData: object[] = [
        {
            id: "001098",
            name: "正合意",
            count: 1300,
            price: 9.2789,
            changeRate: 0.0844,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "601002",
            name: "三明节能",
            count: 2500,
            price: 8.16,
            changeRate: -0.0306,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "201002",
            name: "融创环保",
            count: 10000,
            price: 78,
            changeRate: 0,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
    ];
    allListData: object[] = [
        {
            id: "001098",
            name: "正合意",
            count: 1300,
            price: 9.2789,
            changeRate: 0.0844,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "601002",
            name: "三明节能",
            count: 2500,
            price: 8.16,
            changeRate: -0.0306,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "201002",
            name: "融创环保",
            count: 10000,
            price: 78,
            changeRate: 0,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "601002",
            name: "三明节能",
            count: 2500,
            price: 8.16,
            changeRate: -0.0306,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "201002",
            name: "融创环保",
            count: 10000,
            price: 78,
            changeRate: 0,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "601002",
            name: "三明节能",
            count: 2500,
            price: 8.16,
            changeRate: -0.0306,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "201002",
            name: "融创环保",
            count: 10000,
            price: 78,
            changeRate: 0,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "001098",
            name: "正合意",
            count: 1300,
            price: 9.2789,
            changeRate: 0.0844,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "601002",
            name: "三明节能",
            count: 2500,
            price: 8.16,
            changeRate: -0.0306,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "201002",
            name: "融创环保",
            count: 10000,
            price: 78,
            changeRate: 0,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "001098",
            name: "正合意",
            count: 1300,
            price: 9.2789,
            changeRate: 0.0844,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "601002",
            name: "三明节能",
            count: 2500,
            price: 8.16,
            changeRate: -0.0306,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "201002",
            name: "融创环保",
            count: 10000,
            price: 78,
            changeRate: 0,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
        {
            id: "001098",
            name: "正合意",
            count: 1300,
            price: 9.2789,
            changeRate: 0.0844,
            marketInfo: {
                marketValue: "12.78亿",
                turnoverRate: 0.2408,
                circulationValue: "18.88亿元",
            },
        },
    ];

    //初始化参数
    keyword: string;
    searched: boolean = false;
    resultTitle: string = "大家都在搜";
    resultListData: Observable<object[]>;

    fullListData: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private searchService: SearchService,
    ) {}

    private searchTermStream = new BehaviorSubject<string>("");
    search(term: string) {
        // console.log('searched');
        this.searchTermStream.next(term);
    }

    // enter(event: KeyboardEvent){
    //   if (event.keyCode === 13){
    //     if (this.keyword !== "") {
    //       this.searched = true;
    //       this.resultListData = this.allListData;
    //     }else{
    //       this.searched = false;
    //       this.resultListData = this.recommendListData;
    //     }
    //     this.resultTitle = this.searched ? "搜索结果" : "大家都在搜"; //在数据改变时候更改
    //   }
    // }

    clearInput() {
        this.keyword = "";
    }

    popPage() {
        this.navCtrl.pop();
    }

    ngOnInit() {
        this.resultListData = this.searchTermStream
            .debounceTime(300)
            .distinctUntilChanged()
            .switchMap((term: string) => this.searchService.search(term))
            // .do(value => console.dir(value))
            .catch(err => this.searchService.handleError(err, true));

        this.resultListData.subscribe(listData => {
            this.fullListData.next(
                listData.map(item => ({ baseData: Observable.of(item) })),
            );
        });
    }
}
