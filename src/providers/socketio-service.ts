import { Injectable } from '@angular/core';

// import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/Observable/timer';

import * as SocketIOClient from 'socket.io-client';

import { AppSettings } from '../providers/app-settings';
import { AppDataService } from '../providers/app-data-service';
import { LoginService } from './login-service';

@Injectable()
export class SocketioService {

  // private _socketUrl: string = `${this.appSettings.SOCKET_URL}/app/gjs`;
  private target: string = '/price'
  private source: string = '/transaction'
  private path: string = this.appSettings.SOCKET_PREFIX + this.source + '/socket.io'
  private _socketUrl: string = this.appSettings.SERVER_URL + this.target

  private socket;
  private transports = [
    // 'polling',
    'websocket',
  ];

  private _authenticated: BehaviorSubject<boolean> = new BehaviorSubject(undefined);
  authenticated$: Observable<boolean> = this._authenticated
        .asObservable()
        .distinctUntilChanged();

  private eventSubscriberMap: Map<string, Map<Subscriber<any>, string>> = new Map();

  private _socketioSubscribeList: any[] = [];

  constructor(
    private appDataService: AppDataService,
    public appSettings: AppSettings,
    public loginService: LoginService,
  ){
    
  }

  initSubscribers() {
    this.loginService.status$.subscribe(status => {
      if (!status) {
        this.disconnectSocket()
      }
    })
  }

  private socketReady(): Promise<any> {
    const authenticated = this._authenticated.getValue();
    if (!this.socket || authenticated === undefined){
      this.connectSocket();
    }

    if (authenticated === true){
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.authenticated$
        .filter(value => typeof value === 'boolean')
        .first()
        .subscribe(result => {
          if (result){
            resolve();
          } else {
            reject('socket not ready: unauthentication!');
          }
        });
    });
    // return this.authenticated$
    //   .do(value => {console.log('authenticated$ value: ', value)})
    //   .filter(value => typeof value === 'boolean')
    //   .toPromise()
    //   .then(value => {
    //     console.log('socketReady promise: ', value);
    //     return value ? Promise.resolve() : Promise.reject('unauthenticattion')
    //   })
  }

  private connectSocket(){
    if (this.socket && this.socket.disconnected) {
      this.socket.connect();
      return;
    }
    console.log(this._socketUrl)
    this.socket = SocketIOClient.connect(this._socketUrl, {
      transports: this.transports,
      path: this.path
      // transportOptions: {
      //   polling: {
      //     extraHeaders: {
      //       'X-AUTH-TOKEN': this.appDataService.token,
      //     }
      //   }
      // },
      // extraHeaders: {'X-AUTH-TOKEN': this.appDataService.token},
    });

    const socket = this.socket;

    // 断线重连后，若断线时间较长，则会使用不同的 socketio 连接，
    // 这样之前的订阅就会失效！
    // 因此需要重新进行订阅。

    // 短时间断线（服务器端仍在运行），
    // 则在网络重新连接时，会一次性收到之前错过的数据;
    // 但若断线时间稍长（但未触发 connect_error 事件），
    // 依然有可能触发 reconnect 与 connect ，
    // 这样原有连接与订阅依然会失效！
    socket.on('connect', () => {
      console.log('connected');
      //gjs:
      // socket.emit('authentication', this.appDataService.token);
      //report:
      // socket.emit('watch', "1h", '001', "-10001", 
      // new Date('2017-09-07 00:00:00'), new Date('2017-09-09 00:00:00'));
      //price:
      // socket.emit('watch', "-f52f58bd4e0e5e502890b3f8");
    });

    socket.on('data', function (data) {
      console.log(data);
    });

    socket.on('error', function (err) {
      console.log(err);
    });

    socket.on('authenticated', () => {
      console.log('authenticated');
      this._authenticated.next(true);
      // 认证通过后重新进行订阅（有可能是断线重连）。
      this.socketioResubscribe();
    });

    socket.on('unauthorized', (result) => {
      // 验证未通过时，断开 socketio 连接，
      // 此后所有的订阅都不会进行，包括网络断线重连后。
      // 必须注销并重新登录，才会重连 socketio 并重新尝试认证。
      console.log('unauthorized: ', result && (result.message || result));
      this._authenticated.next(false);
      socket.disconnect();
    });

    socket.on('connect_error', (...args) => {
      console.log('connect_error:', args);
      // 在连接出错的情况下（后期可以考虑在连续多次出错时才进行处理），
      // 使用 disconnect() 可以保证不再做无谓的连接尝试。
      // 同时将 _authenticated 设为 undefined ，
      // 以便后续的订阅请求可以等待网络重连后重新认证的结果，
      // 并且可用于区分网络问题导致的 disconnect 与认证失败的 disconnect 。
      socket.disconnect();
      this._authenticated.next(undefined);
    });

    // connect_timeout 时，会同时触发 connect_error ，
    // 似乎不需要额外处理，因此姑且注释掉。
    // socket.on('connect_timeout', (...args) => {
    //   console.log('connect_timeout:', args);
    //   // socket.disconnect();
    //   // if (this._authenticated.getValue() !== undefined) {
    //   //   this._authenticated.next(false);
    //   // }
    // });

    // 重连成功也会触发 connect 事件，
    // 因此似乎没有必要再重复进行后续处理。
    // socket.on('reconnect', (retryTimes) => {
    //   // reconnect 回调函数的参数只有一个，
    //   // 表示重连成功之前的重试次数。
    //   console.log('reconnect, retryTimes: ', retryTimes);
    // });

    // console.log(socket);
  }

  disconnectSocket(){
    if (this.socket){
      this.socket.disconnect();
    }

    this.eventSubscriberMap.forEach(subscriberMap => {
      subscriberMap.forEach((value, subscriber) => {
        subscriber.unsubscribe();
      });

      subscriberMap.clear();
    });
    this.eventSubscriberMap.clear();

    this._socketioSubscribeList.length = 0;
    this._authenticated.next(undefined);
  }

  private socketioResubscribe() {
    this._socketioSubscribeList.forEach(subscribeData => {
      this.socket.emit('subscribe', subscribeData);
    });
  }

  private removeFromSocketioSubscribeList(subscribeData) {
    const index = this._socketioSubscribeList.findIndex(
      item => item.channel === subscribeData.channel
    );

    if (index !== -1) {
      this._socketioSubscribeList.splice(index, 1);
    }
  }

  private onData(eventName, data) {
    // console.log(`socket on: `, data);
    if (this.eventSubscriberMap.has(eventName)){
      this.eventSubscriberMap.get(eventName).forEach((code, subscriber) => {
        if (data.ec === code || data.n === code){
          subscriber.next(data);
        }
      });
    }
  }

  subscribeEquity(equityCodeWithSuffix: string, eventName: string): Observable<any> {
    const equityCode = /^([^-]+)/.exec(equityCodeWithSuffix)[1];
    console.log(equityCodeWithSuffix,' & ',eventName)
    const observable = new Observable(observer => {
      // 对于所有订阅都已取消的 refCount 重新进行订阅时，
      // 这个函数会被重新调用一次，并传入新的 observer 。
      // 因此需要将新的 observer 加到 Map 中，
      // 以便可以在 socketio 的 on 事件中使用正确的 observer(subscriber) 去派发数据。
      this.socketReady()
        .then(() => {
          this.addSubscriberToMap(eventName, equityCode, observer);

          const subscribeData = {
            channel: equityCodeWithSuffix,
            from: 'wzx',
            date: new Date(),
          };
          this._socketioSubscribeList.push(subscribeData);
          // this.socket.emit('subscribe', subscribeData);
          console.log('watch: ', `-${equityCodeWithSuffix}`)
          this.socket.emit('watch', `-${equityCodeWithSuffix}`)
        })
        .catch(err => {
          console.log(err)
        });

      // 在 multicast refCount 上的所有订阅都取消时，
      // 会调用此方法取消 observer 的订阅。
      return () => {
        console.log('socketio unsubscribe: ', equityCodeWithSuffix);
        this.removeSubscriberFromMap(eventName, observer);

        const subscribeData = {
          channel: equityCodeWithSuffix,
          from: 'wzx',
          date: new Date(),
        };
        this.removeFromSocketioSubscribeList(subscribeData);
        this.socket.emit('unsubscribe', subscribeData);
      }
    });

    return observable;
  }

  private addSubscriberToMap(eventName: string, equityCode: string, subscriber: Subscriber<any>) {
    if (!this.eventSubscriberMap.has(eventName)){
      this.eventSubscriberMap.set(eventName, new Map());
      this.socket.on(eventName, this.onData.bind(this, eventName));
    }
    const subscriberMap = this.eventSubscriberMap.get(eventName);
    if (!subscriberMap.has(subscriber)){
      // 将新的 subscriber 加到 Map 中。
      subscriberMap.set(subscriber, equityCode);
    }
  }

  private removeSubscriberFromMap(eventName: string, subscriber: Subscriber<any>) {
    const subscriberMap = this.eventSubscriberMap.get(eventName);
    // 在 Map 中删除所保存的 observer ，防止内存泄漏。
    if (subscriberMap && subscriberMap.has(subscriber)){
      subscriberMap.delete(subscriber);
    }
  }

}
