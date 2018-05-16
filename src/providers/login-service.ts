import { Injectable } from '@angular/core';

import { Http, RequestMethod, RequestOptions, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AppSettings } from './app-settings';
import { AppService } from './app.service';
import { AppDataService } from './app-data-service';
import { AlertService } from './alert-service';

/*from BNLC framework*/
import { AppSettingProvider } from '../bnlc-framework/providers/app-setting/app-setting';

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
  userToken = new BehaviorSubject<string>(undefined);
  status$: Observable<boolean> = this.userToken
    // 在值被设置时，
    // 使用 distinctUntilChanged() 方法保证只处理真正变化了的值
    .map(v => !!v)
    .distinctUntilChanged();

  // logout$: Observable<boolean> = this.userToken
  //   .map(v => v=='')
    // .distinctUntilChanged();

  setToken(token: string = '',expiredTime?:number) {
    //usertoken推入新值会触发登陆 所以必须先设置token
    this.appDataService.token = token;
    this.userToken.next(token);
  }
  setLoginData(data:any){
    this.bnlcAppSetting.setUserToken(data);
    this.setToken( data.token);
  }

  GET_CUSTOMER_DATA = `/user/getCustomersData`;

  constructor(
    public http: Http,
    public appSettings: AppSettings,
    public appDataService: AppDataService,
    public appService: AppService,
    public alertService: AlertService,
    public bnlcAppSetting: AppSettingProvider,
  ) {
    this.appDataService.dataReady
      .then(async () => {
        window['loginService'] = this;
        if( this.appDataService.APP_VERSION != this.appDataService.version){
          this.appDataService.version = this.appDataService.APP_VERSION;
           //获取保存的用户账号
           let customerId = this.appDataService.customerId;
           //清空登入信息,保留用户账号
           await this.doLogout().then(success => {
             this.appDataService.customerId = customerId;
           });
        }
        
        const token = this.appDataService.token;
        
        
        
        var token_use_able = false;
        
        if (token) {
          // FIXME ：即使缓存中有 token ，也不应当直接使用！
          // 因为有可能是之前登录留下的，
          // 而一段时间后服务端有变更（例如服务器重启、用户更改密码等）！
          // 因此需要在启动时检测一下 token 是否可用，
          try {
            //检测一下 token 是否可用，
            const loginerInfo = await this.appService.request(
              RequestMethod.Get,
              this.GET_CUSTOMER_DATA,
              void 0,
              true,
            );
            console.log(loginerInfo);
            token_use_able = true;
          } catch (err) {
            console.warn('Token过期不可用');
            //获取保存的用户账号
            let customerId = this.appDataService.customerId;
            //清空登入信息,保留用户账号
            await this.doLogout().then(success => {
              this.appDataService.customerId = customerId;
            });
          }
        }
        this.setToken(token_use_able ? token : '');
       
       
      })
      .catch(err => {
        console.log(err);
        this.alertService.showAlert('警告', err.message);
        // this.userToken.next('');
        this.setToken('');
      });
  }

  private _doLogin(
    customerId: string,
    password: string,
    savePassword: boolean = true,
    type?: number,
  ): Promise<any> {
    let promise: Promise<{ token }>;
    if (type === void 0) {
      type = this.appSettings.accountType(customerId);
    }

    const options = new RequestOptions({
      headers: new Headers({
        'x-bnqkl-platform': this.appSettings.Platform_Type,
      }) });

    promise = this.http
      .post(this.appSettings.LOGIN_URL, {
        type: type,
        account: customerId,
        password,
      },options)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        console.log('login:', data);
        const err = data.error || data.err;
        if (!err) {
          document.cookie = `X-AUTH-TOKEN=${data.data.token}`;
          return Promise.resolve(data.data);
        } else {
          return Promise.reject(err);
        }
      });

    return promise;
  }
  public doLogin(
    customerId: string,
    password: string,
    savePassword: boolean = false,
    type?: number,
  ): Promise<boolean | string> {
    return this._doLogin(customerId, password, savePassword, type)
      .then(data => {
        debugger
        Object.assign(this.appDataService, {
          token: data.token,
          customerId,
          // password,
          savePassword,
        });
 
        this.setLoginData(data);
        return true;
      })
      .catch(error => { 
        //将error转为对象,
        const body = error.json() || error;
        //提取error
        const err = body.error || body || error;
        console.log('login err:', err);
        const message = err.message || err.statusText || '登录失败！';
        this.alertService.showAlert('警告', message);
        //清空登入信息
        this.doLogout();
        return err.message || err.statusText || err;
      });
  }

  public doLogout() {
    document.cookie = `X-AUTH-TOKEN=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    this.bnlcAppSetting.clearUserToken();  
    return new Promise(resolve => {
      this.appDataService.resetCustomization();
 
      this.userToken.next('');

      resolve(true);
    });
  }

  // 重置密码
  RESET_PASSWORD = `/user/resetPassword`;

  doResetPWD(account: string, code: string, resetPwd: string) {
    return this.appService.request(RequestMethod.Post, this.RESET_PASSWORD, {
      type: this.appSettings.accountType(account),
      account,
      code,
      resetPwd,
    });
  }

  MODIFY_PASSWORD = `/user/modifyLoginPassword`;
  // 修改密码
  doModifyPWD(oldPassword: string, newPassword: string) {
    return this.appService.request(
      RequestMethod.Post,
      this.MODIFY_PASSWORD,
      {
        oldPassword,
        newPassword,
      },
      true,
    );
  }
}
