import { Injectable } from '@angular/core';
import { Http, Headers, Response, URLSearchParams, RequestMethod } from "@angular/http";

import { Observable } from "rxjs/Observable";

import { AppDataService } from "../../providers/app-data-service";
import { AppSettings } from "../../providers/app-settings";
import { AppService } from '../../providers/app.service';


@Injectable()
export class NewsService {

  constructor(
    private http: Http,
    private appSettings: AppSettings,
    private appService: AppService,
    public appDataService: AppDataService,
  ) {

  }
  //TODO:lastTime数据获取最后时间
  getNews(lastTime: Date = new Date('2016-01-01'), newsId,isMock) {

    if (isMock) {
      return Observable.of({
        titleImg: "assets/images/news-title.jpg",
        title: "关于平安易宝系统升级通知",
        content: `由于平安银行的平安易宝将于2016年10月15 （周六） 至16日 （周日）期间进行核心业务系统升级 由于平安银行的平安易宝将于2016年10月15 （周六） 至16日 （周日）期间进行核心业务系统升级 由于平安银行的平安易宝将于2016年10月15
  （周六） 至16日 （周日）期间进行核心业务系统升级`,
        publishTime: new Date(2017, 4, 14, 20, 24, 0),
        avatarImg: "assets/images/test/004.png",
      })
    }

    console.log("getNewsService:",newsId)

    const params = new URLSearchParams();
    params.set('newsId', newsId);

    const path = `/news/getNewsDetailList`
    return this.appService.request(RequestMethod.Get, path, params, true)
      .then(resData => {
        console.log('getnews: ', resData);
        ////新闻返回数据结构
        // {
        //   "_id": "59e76ebe6fc3970c356184be",
        //   "newsId": "1004519818",
        //   "publisherType": "001",
        //   "msgType": "006",
        //   "publisherId": "1003017460",
        //   "newsTitle": "投资课堂",
        //   "abstract": "投资课堂",
        //   "content": "投资课堂",
        //   "cover": "投资课堂",
        //   "relationType": "002",
        //   "status": "002",
        //   "relationId": "23432",
        //   "crtUserId": "1003017460",
        //   "crtDateTime": "2017-10-23T08:26:27.640Z",
        //   "lstModUserId": "1003017460",
        //   "lstModDateTime": "2017-10-23T08:26:27.640Z",
        //   "__v": 0
        // }
        if (!resData) {
          return Promise.reject(new Error('resData missing'));
        }
        //数据转换,暂时没想到优雅的解决方案.
        const data = {
          titleImg: "assets/images/news-title.jpg",//resData.cover
          title: resData.newsTitle,
          content: resData.content,
          publishTime: new Date(resData.crtDateTime),
          avatarImg: "assets/images/test/004.png",
        }
        return data
      })
      .catch(err => {
        console.log('getnews error: ', err);
      });
  }

  //TODO:lastTime数据获取最后时间,数据处理
  getNewsList(lastTime: string = '2016-01-01', msgType: string = '001',page,isMock:boolean) {
    console.log('getnewslist start')

    const params = new URLSearchParams();
    // params.set('msgType', msgType);
    params.set('page', page);
    
    console.log(page)

    const headers = new Headers();
    headers.append('X-AUTH-TOKEN', this.appDataService.token);

    if(isMock){
      // console.log("lastTime:", lastTime)
      // console.log("msgType:", msgType)
      return Observable.of(
        [
          {
            "titleImg": "assets/images/test/01.jpg",
            "avatar": "assets/images/test/004.png",
            "title": "关于平安易宝系统升级通知",
            "publishTime": "今天11:02",
            "commentsNumber": Math.round(Math.random() * 100),
            id:Math.round(Math.random() * 1000),
          },
          {
            "titleImg": "assets/images/test/002.png",
            "avatar": "assets/images/test/005.png",
            "title": "福建省知识产权局领导到高交所调研局领导到高交所调研",
            "publishTime": "今天11:00",
            "commentsNumber": Math.round(Math.random() * 100),
            id:Math.round(Math.random() * 1000),
          },
          {
            "titleImg": "assets/images/test/003.png",
            "avatar": "assets/images/test/006.png",
            "title": "李克强:持续加大支持实体经济力度",
            "publishTime": "03-08 20:00",
            "commentsNumber": Math.round(Math.random() * 100),
            id:Math.round(Math.random() * 1000),
          },
          {
            "titleImg": "assets/images/test/002.png",
            "avatar": "assets/images/test/004.png",
            "title": "李克强:持续加大支持实体经济力度",
            "publishTime": "03-08 20:00",
            "commentsNumber": Math.round(Math.random() * 100),
            id:Math.round(Math.random() * 1000),
          },
        ]
      )
    }

    const path = `/news/news`
    return this.appService.request(RequestMethod.Get, path, params, true)
      .then(data => {
        console.log('getnewslist: ', data);
          ////新闻列表返回数据结构
          // {
          //   "data": [
          //     {
          //       "_id": "59e76ebe6fc3970c356184be",
          //       "newsId": "1004519818",
          //       "publisherType": "001",
          //       "msgType": "006",
          //       "publisherId": "1003017460",
          //       "newsTitle": "投资课堂",
          //       "abstract": "投资课堂",
          //       "content": "投资课堂",
          //       "cover": "投资课堂",
          //       "relationType": "002",
          //       "status": "002",
          //       "relationId": "23432",
          //       "crtUserId": "1003017460",
          //       "crtDateTime": "2017-10-23T08:26:27.640Z",
          //       "lstModUserId": "1003017460",
          //       "lstModDateTime": "2017-10-23T08:26:27.640Z",
          //       "__v": 0
          //     }
          //   ]
          // }
        if (!data) {
          return Promise.reject(new Error('data missing'));
        }
        //数据转换,暂时没想到优雅的解决方案.
        let resData = [];
        data.map((item: any, index) => {
          resData[index] = {}
          resData[index].newsId = data[index].newsId
          resData[index].titleImg = "assets/images/news-title.jpg"//data[index].cover
          resData[index].title = data[index].newsTitle
          resData[index].publishTime = new Date(data[index].crtDateTime)
          resData[index].avatar = "assets/images/test/004.png"
        })
        return resData
      })
      .catch(err => {
        console.log('getnewslist error: ', err);
        // return Promise.reject(err);
      });
  }

  public handleError(error: Response | any, donotThrow) {
    let errMsg: string;
    // console.dir(error)
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    // console.error(errMsg);
    if (!donotThrow) {
      return Observable.throw(errMsg);
    } else {
      return [];
    }
  }
}