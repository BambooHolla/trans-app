import { Injectable } from '@angular/core';

import { Http, Headers, RequestOptionsArgs } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { AppSettings } from './app-settings';
import { AppDataService } from './app-data-service';
// import { LoginService } from './login-service';

@Injectable()
export class HttpService {

  constructor(
    public http: Http,
    public appSettings: AppSettings,
    public appDataService: AppDataService,
    // public loginService: LoginService,
  ){

  }

  public get(path: string, params: any): Promise<any> {
    switch (path){
        case 'noticeList':
            return this.mockNoticeList(params);
        default:
            break;
    }

  }

  getWithToken(url, options: RequestOptionsArgs = {}): Promise<any> {
    const token = this.appDataService.token;
    if (!token){
      return Promise.reject(new Error('token missing!'));
    }
    // console.log('appDataService.token', token);
    const headers = options.headers || new Headers()
    // FIXME ：当输入的 options 上存在 headers 属性时，
    //         此处的 append 会直接修改原对象，这是一个小问题，可以考虑改进。
    headers.append('X-AUTH-TOKEN', token)

    return this.http
      // 构造对象时，其中使用的对象扩展运算符也要遵循先后原则，
      // 即代码中写在后面的属性会覆盖掉前面的同名属性。
      // 此处 options 对象中若存在 headers 属性，会被后面的 headers 覆盖。
      .get(url, {
        ...options,
        headers,
      })
      .map(res => res.json())
      .toPromise()
      .then(data => {
        if (!data){
          return Promise.reject(new Error('data missing'));
        }

        const err = data.err || data.error
        if (err) {
          // FORBIDDEN
          // 注入 LoginService 会导致循环依赖错误！
          // if (err.code === -1) {
          //   this.loginService.doLogout()
          // }
          return Promise.reject(new Error(err.message || err));
        }

        return data;
      });
  }

  getObservableWithToken(url, options: RequestOptionsArgs = {}, cancel$?: Observable<any>): Observable<any> {
    const token = this.appDataService.token
    if (!token){
      return Observable.throw(new Error('token missing!'))
    }

    const headers = options.headers || new Headers()
    // FIXME ：当输入的 options 上存在 headers 属性时，
    //         此处的 append 会直接修改原对象，这是一个小问题，可以考虑改进。
    headers.append('X-AUTH-TOKEN', token)

    let http$ = this.http
      // 构造对象时，其中使用的对象扩展运算符也要遵循先后原则，
      // 即代码中写在后面的属性会覆盖掉前面的同名属性。
      // 此处 options 对象中若存在 headers 属性，会被后面的 headers 覆盖。
      .get(url, {
        ...options,
        headers,
      })

    if (cancel$) {
      http$ = http$.takeUntil(cancel$)
    }

    return http$
      .map(res => res.json())
      .switchMap(data => {
        // 使用 switchMap 来包含 Observable.throw()
        if (!data){
          return Observable.throw(new Error('data missing'));
        }

        const err = data.err || data.error
        if (err) {
          return Observable.throw(new Error(err.message || err));
        }

        // switchMap 的正常返回值需要使用 Observable.of()
        return Observable.of(data);
      })
  }

  // 将模拟数据放在当前类中，而不是放在 NoticeListModel 类中！
  // 否则会因为循环依赖造成属性注入报错！
  mockNoticeList(params: any){
    const max = 20;
    if (params.id){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const data = [];
                for (let i = 0; i < params.pageSize; i++) {
                    let id = params.id + i + 1;
                    if (id > max){
                        break;
                    }
                    data.push({
                        id,
                        title: 'test' + id,
                    });
                }
                resolve(data);
            }, 1000)
        });
    } else {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const rnd = Math.floor(Math.random() * 3);
                if (rnd === 2) {
                    reject(new Error('随机错误'));
                } else {
                    resolve([
                        { id: 1, title: rnd === 1 ? "新加载………………" : "初始化" },
                        { id: 2, title: "2222" },
                        { id: 3, title: "3333" },
                        { id: 4, title: "444" },
                        { id: 5, title: "5555" },
                        { id: 6, title: "6666" }
                    ]);
                }
            }, 1000);
        });
    }
  }


}
