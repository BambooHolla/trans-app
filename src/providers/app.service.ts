import { Injectable } from '@angular/core';

import {
  Http,
  Headers,
  RequestOptionsArgs,
  RequestOptions,
  RequestMethod
} from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { AppSettings } from './app-settings';
import { AppDataService } from './app-data-service';
// import { LoginService } from './login-service';

@Injectable()
export class AppService {
  constructor(
    private http: Http,
    private appSettings: AppSettings,
    private appDataService: AppDataService // private loginService: LoginService,
  ) {}

  request(
    method: number,
    path: string,
    params: string | object,
    withToken: boolean = false,
    options: RequestOptionsArgs = {}
  ): Promise<any> {
    let requestMethod = null;
    const url = `${this.appSettings.SERVER_URL +
      this.appSettings.SERVER_PREFIX +
      path}`;
    const token = this.appDataService.token;
    if (withToken) {
      if (!token) {
        return Promise.reject(new Error('token missing!'));
      }
      const headers = options.headers || new Headers({ 'X-AUTH-TOKEN': token });

      options = {
        // 构造对象时，其中使用的对象扩展运算符也要遵循先后原则，
        // 即代码中写在后面的属性会覆盖掉前面的同名属性。
        // 此处 options 对象中若存在 headers 属性，会被后面的 headers 覆盖。
        ...options,
        headers: headers
      };
    }
    switch (method) {
      case RequestMethod.Get:
        requestMethod = this.http.get(url, {
          ...options,
          params
        });
        break;
      case RequestMethod.Post:
        requestMethod = this.http.post(url, params, options);
        break;
      case RequestMethod.Put:
        requestMethod = this.http.put(url, params, options);
        break;
      case RequestMethod.Delete:
        requestMethod = this.http.delete(url, {
          ...options,
          body: params
        });
        break;
      case RequestMethod.Patch:
        requestMethod = this.http.patch(url, params, options);
        break;
    }

    return requestMethod
      .map(res => res.json())
      .toPromise()
      .then(data => {
        console.log(data);
        if (!data) {
          return Promise.reject(new Error('data missing'));
        }

        const err = data.err || data.error;
        if (err) {
          // FORBIDDEN
          // 注入 LoginService 会导致循环依赖错误！
          // if (err.code === -1) {
          //   this.loginService.doLogout()
          // }
          return Promise.reject(new Error(err.message || err));
        }

        if (data.data) {
          return Promise.resolve(data.data);
        } else {
          return Promise.resolve(data);
        }
      })
      .catch(error => {
        console.log(error);
        let formated_error = this._errorHandler(error, true);
        if (!formated_error) {
          //将error转为对象,
          const body = error.json() || error;
          //提取error
          const err = body.error || body || error;
          formated_error = this._errorHandler(err);
        }
        return Promise.reject(formated_error);
      });
  }

  private _errorHandler(error, static_return = false) {
    if (error instanceof Error) {
      error = { code: '999', message: error.message };
    } else if (error instanceof ProgressEvent) {
      error = { code: '500', message: '网络连接错误,请稍后再试' };
    } else if (static_return) {
      error = null;
    }
    return error;
  }
}
