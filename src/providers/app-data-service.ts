import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class AppDataService {

  constructor(
    public storage: Storage,
  ) {
    this.initProperties();
    this.getDataFromStorage();
  }

  private _ready:boolean = false;

  public get ready():boolean {
    return this._ready;
  }

  private _data = {
    token: '',
    customerId: '',
    password: '',
    savePassword: false,
    products: new Map(),
    traderList: new Map(),
  };

  // 声明属性，但在之后会被更换为访问器属性。
  public token;
  public customerId;
  public password;
  public savePassword;

  //缓存产品信息
  public products:Map<string,AnyObject>
  public traderList:Map<string,AnyObject>

  private _dataReady:Promise<any>;

  public get dataReady(){
    return this._dataReady;
  }

  private getDataFromStorage(){
    // 没有为 storage 的失败进行处理。
    // （目前没有遇到过失败的情况）
    this._dataReady = this.storage.ready()
      .then(() => Promise.all(Object.keys(this._data).map(
        name => this.storage.get(name)
          .then(val => {
            if (val !== null && val !== undefined){
              this._data[name] = val;
            }
          })
      )))
      .then(() => {
        // this.initProxy();
        if (!this.savePassword && (this.password || this.token)) {
          this.password = '';
          this.token = '';
        }
        this._ready = true;
        // console.log('storage data ready!');
      })
  }

  // 使用 Proxy 就必须将代理后的对象作为返回值代替原对象，
  // 从代码编写与使用上来看并不便利，因此暂时放弃这种方式。
  /**
   * 设置 this._data 的代理，接管对于属性值的设置操作。
   */
  // private initProxy(){
  //   const self = this;

  //   this.data = new Proxy(this._data, {
  //     // get(trapTarget, key, receiver) {

  //     // },
  //     set(trapTarget, key, value, receiver) {
  //       // 只允许修改已存在的自有属性。
  //       if (!trapTarget.hasOwnProperty(key)) {
  //         throw new TypeError(`Property ${key} not existed on AppDataService.data!`);
  //       }

  //       self.storage.ready()
  //         .then(() => {
  //           if (value !== null && value !== undefined) {
  //             self.storage.set(<string>key, value);
  //           } else {
  //             self.storage.remove(<string>key);
  //           }
  //         });

  //       // 设置属性值
  //       return Reflect.set(trapTarget, key, value, receiver);
  //     }
  //   });
  // }

  // 初始化当前类的特定属性，
  // 将它们从值属性修改为访问器属性，
  // 代理读写属性的操作，在写入属性时设置 storage 的相应值。
  initProperties(){
    const self = this;

    Object.keys(this._data).forEach(key => {
      Object.defineProperty(this, key, {
        get(){
          return self._data[key];
        },
        set(value){
          self._data[key] = value;

          self.storage.ready()
            .then(() => {
              if (value !== null && value !== undefined) {
                self.storage.set(key, value);
              } else {
                self.storage.remove(key);
              }
            });
        },
        // 确保在 defineProperty 之后不允许再更改属性的设置。
        configurable: false,
        // 允许枚举
        enumerable: true,
      });
    });
  }

}
