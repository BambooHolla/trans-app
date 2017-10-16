import { Injectable } from '@angular/core';
import { Http, Headers, Response, URLSearchParams } from "@angular/http";

import { Observable } from "rxjs/Observable";

import { AppDataService } from "../../providers/app-data-service";
import { AppSettings } from "../../providers/app-settings";


@Injectable()
export class NewsService {

  constructor(
    private http: Http,
    private appSettings: AppSettings,
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
    let url = `${this.appSettings.SERVER_URL}/api/v1/gjs/news/news/${newsId}`

    const params = new URLSearchParams();
    params.set('lstSearchTime', lastTime.toString());

    const headers = new Headers();
    headers.append('X-AUTH-TOKEN', this.appDataService.token);

    return this.http.get(url, {
      search: params,
      headers: headers,
    })
      // .do(value => console.dir("1: " + value))
      .map(response => {
        const resData = response.json().data
        let data = [];
        //后端返回异常处理
        if (!resData) {
          if (response.json().error) {
            throw (response.json())
          } else {
            console.dir(response.json())
          }
        } else {
          //数据转换,暂时没想到优雅的解决方案.
          resData.map((item: any, index) => {
            data[index] = {}
            data[index].titleImg = "assets/images/news-title.jpg"
            data[index].title = resData[index].title
            data[index].content = resData[index].content
            data[index].publishTime = new Date(resData[index].crtDateTime)
            data[index].avatarImg = "assets/images/test/004.png"
          })
          console.dir(response.json())
        }
        // console.dir("新闻数据:", data)
        return data[0]
      })
      .catch(this.handleError)
  }

  //TODO:lastTime数据获取最后时间,数据处理
  getNewsList(lastTime: string = '2016-01-01', msgType: string = '1000',page,isMock:boolean) {
    let url = `${this.appSettings.SERVER_URL}/api/v1/gjs/news/news/newsType/${msgType}`

    const params = new URLSearchParams();
    params.set('lstSearchTime', lastTime);
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
    return this.http.get(url, {
      search: params,
      headers: headers,
    })
      // .do(value => console.dir("1: " + value))
      .map(response => {
        const resData = response.json().data
        let data = [];
        //后端返回异常处理
        if (!resData) {
          if (response.json().error) {
            throw (response.json())
          } else {
            console.dir(response.json())
          }
        } else {
          //数据转换,暂时没想到优雅的解决方案.
          resData.map((item: any, index) => {
            data[index] = {}
            data[index].newsId = resData[index].newsId
            data[index].titleImg = "assets/images/news-title.jpg"
            data[index].title = resData[index].title
            data[index].commentsNumber = ~~(Math.random() * 1000)
            data[index].publishTime = new Date(resData[index].crtDateTime)
            data[index].avatar = "assets/images/test/004.png"
          })
          console.dir(response.json())
        }
        // console.dir("新闻列表:", data)
        return data
      })
      .catch(this.handleError)
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