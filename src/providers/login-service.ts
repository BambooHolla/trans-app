import { Injectable } from '@angular/core';

import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AppSettings } from './app-settings';
import { AppDataService } from './app-data-service';
import { AlertService } from './alert-service';

// 使用 @Injectable 才能让所声明的类用于依赖注入，
// 而 @Component 是 @Injectable 的派生类型，不需要重复使用 @Injectable 。
// 注意在 @Injectable 后面必须使用括号。
@Injectable()
export class LoginService {

  // private _status:boolean = false;
  // _status 不创建为布尔类型，而是创建为 BehaviorSubject ，
  // 并使用该属性构造出一个可观察对象 status$ ，
  // 在相关代码（例如 /src/app/app.component.ts ）中可以订阅这个可观察对象，
  // 从而实现对该属性的监视。
  private _status = new BehaviorSubject<boolean>(undefined);
  status$: Observable<boolean> = this._status
        .asObservable()
        // 在值被设置时，
        // 使用 distinctUntilChanged() 方法保证只处理真正变化了的值
        .filter(value => typeof value === 'boolean')
        .distinctUntilChanged();

  
  constructor(
    public http: Http,
    public appSettings: AppSettings,
    public appDataService: AppDataService,
    public alertService: AlertService,
  ){
    this.appDataService.dataReady
      .then(() => {
        const token = this.appDataService.token;
        if (token){
          // FIXME ：即使缓存中有 token ，也不应当直接使用！
          // 因为有可能是之前登录留下的，
          // 而一段时间后服务端有变更（例如服务器重启、用户更改密码等）！
          // 因此需要在启动时检测一下 token 是否可用，
          // 若不可用，则需要拿已存的用户名与密码重新进行一次登录；
          // 或者也可以考虑不检测 token 的有效性，直接进行登录尝试。
          this.afterLogin();
        } else {
          this._status.next(false);
        }
      })
      .catch(err => {
        console.log(err);
        this.alertService.showAlert('警告', err.message);
        this._status.next(false);
      })
  }

  public doLogin(
    customerId: string,
    password: string,
    savePassword: boolean = true,
    type: number,
  ): Promise<string | boolean> {
    let promise: Promise<{token}>;

    if (!this.appSettings.FAKE_LOGIN){
      promise = this.http
        .post(this.appSettings.LOGIN_URL, {
          type: type,
          account: customerId,
          password,
        })
        .map(res => res.json())
        .toPromise()
        .then(data => {
          console.log('login:', data);
          const err = data.error || data.err
          if (!err){
            return Promise.resolve(data.data);
          } else {
            return Promise.reject(err);
          }
        });
    } else {
      promise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({token: 'test'})
        }, Math.round(Math.random()) * 3000);
      });
    }

    return promise
      .then(data => {
        Object.assign(this.appDataService, {
          token: data.token,
          customerId,
          password,
          savePassword,
        });

        this.afterLogin();
        return true;
      })
      .catch(error => {
        //将error转为对象,
        const body = error.json() || error
        //提取error
        const err = body.error || body || error
        console.log('login err:', err);
        const message = err.message || err.statusText || '登录失败！'
        this.alertService.showAlert('警告', message)
        return err.message || err.statusText || err;
      });
  }

  public doLogout(){
    return new Promise((resolve) => {
      this.appDataService.token = "";
      this.appDataService.password = "";
      this._status.next(false);

      resolve(true);
    });
  }

  private afterLogin(){
    this._status.next(true);
  }

}
