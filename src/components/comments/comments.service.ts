import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";

import { AppDataService } from "../../providers/app-data-service";
import { AppSettings } from "../../providers/app-settings";

@Injectable()
export class CommentService {
  comments1: CommentItem[] = [
    //liker应该为数组,存储点赞人的数据对象,方便扩展,暂用数目代替
    {
      userInfo:{
        userId: "asdlfkjaldf",
        userName: "夜风侠",
        avatarUrl: "",
      },
      publishTime: new Date(2017, 4, 14, 20, 24, 0),
      content: "等待~",
      liker: [
        "1",
        "dfsfdfsdfdsf",
        "dsfsdfdd",
      ] ,
    },
    {
      userInfo: {
        userId: "asdlfkjaldf",
        userName: "夜风侠",
        avatarUrl: "",
      },
      publishTime: new Date(2017, 4, 14, 20, 24, 0),      
      content: "等待~",
      liker: [
        "2",
        "dfsfdfsdfdsf",
      ],
    },
    {
      userInfo: {
        userId: "asdlfkjaldf",
        userName: "夜风侠",
        avatarUrl: "",
      },
      publishTime: new Date(2017, 4, 14, 20, 24, 0),
      content: "等待~",
      liker: [
        "3",
        "dfsfdfsdfdsf",
      ],
    },
    {
      userInfo: {
        userId: "asdlfkjaldf",
        userName: "夜风侠",
        avatarUrl: "",
      },
      publishTime: new Date(2017, 4, 14, 20, 24, 0),
      content: "等待~",
      liker: [
        "4",
        "dfsfdfsdfdsf",
      ],
    },
    {
      userInfo: {
        userId: "asdlfkjaldf",
        userName: "夜风侠",
        avatarUrl: "",
      },
      publishTime: new Date(2017, 4, 14, 20, 24, 0),
      content: "等待~",
      liker: [
        "5",
        "dfsfdfsdfdsf",
      ],
    },
    {
      userInfo: {
        userId: "asdlfkjaldf",
        userName: "夜风侠",
        avatarUrl: "",
      },
      publishTime: new Date(2017, 4, 14, 20, 24, 0),
      content: "等待~",
      liker: [
        "6",
        "dfsfdfsdfdsf",
      ],
    },
  ]

  constructor(
    private http: Http,
    private appSettings: AppSettings,
    public appDataService: AppDataService,
  ) {
    
  }

  getComments(newsId:string){
    //ebd9215c694f1663948db52d 有数据
    let url = `${this.appSettings.SERVER_URL}/api/v1/gjs/news/newsComments/${newsId}`
    let params = new URLSearchParams();
    params.set('page', '0');
    const headers = new Headers();
    headers.append('X-AUTH-TOKEN', this.appDataService.token);

    return this.http.get(url, { 
      search: params,
      headers: headers,
    })
      // .do(value => console.dir("1: " + value))
      .map(response => {
        console.log("service response")
        console.dir(response)
        
        const resData = response.json().data
        let data: CommentItem[] = [] //初始化为空数组,才能使用index添加数组成员
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
            data[index] = <CommentItem>{}
            data[index].userInfo = {
              userId: item.crtUserId,
              userName: item.crtUserId,
              avatarUrl: '',
            }
            data[index].publishTime = new Date(item.crtDateTime)
            data[index].content = item.content
            data[index].liker = []
            
            for (let i = 0; i < item.likeCount;i++){
              data[index].liker.push('someone')
            }
          })
        }
        return data
      })
      .catch(this.handleError)
  }

  postComments(newsId: string, content:string) {
    console.log('postComments')
    const url = `${this.appSettings.SERVER_URL}/api/v1/gjs/news/newsComments/create`
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('X-AUTH-TOKEN', this.appDataService.token);

    const options = new RequestOptions({ headers: headers });

    let data = {
      newsId: newsId,
      content: content,
    }

    return this.http.post(url, data, options)
      .do(value => console.dir("1: " + value))
      .map(response => {
        console.log("postComments response")
        console.dir(response)

        const resData = response.json().data
        
        return resData
      })
      .catch(this.handleError)
  }

  public handleError(error: Response | any, donotThrow) {
    let errMsg: string;
    console.dir(error)
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    if (!donotThrow) {
      return Observable.throw(errMsg);
    } else {
      return [];
    }
  }
}