import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Device } from "@ionic-native/device";
import { Geolocation } from "@ionic-native/geolocation";
import { Platform } from "ionic-angular";
import { ArrayType } from "@angular/compiler/src/output/output_ast";
import { BehaviorSubject, Observable } from "rxjs";
import * as UUID from "uuid";
@Injectable()
export class AppDataService {
    //记录设备信息
    // cordova 获取在设备上运行的Cordova版本。
    // model device.model返回设备型号或产品的名称。该值由设备制造商设置，并可能在同一产品的不同版本中有所不同。
    // platform 获取设备的操作系统名称。
    // uuid 获取设备的通用唯一标识符（UUID）。
    // version 获取操作系统版本。
    // manufacturer 获取设备的制造商。
    // isVirtual 设备是否在模拟器上运行。
    // serial 获取设备硬件序列号。
    public DEVICE_DATA: any = {
        uuid: "",
        model: "",
        platform: "",
        version: "",
        manufacturer: "",
        serial: "",
    };
    //版本校验
    public APP_VERSION = "v1.2.7";
    // 经纬度
    public GEOLOCATION: any = {
        latitude: "",
        longitude: "",
    };
    //IP
    public APP_IP: any = "192.168.0.1";
    //是否隐藏个人资产
    public HIDE_ASSETS = '********';

    //语言
    public LANGUAGE: any = "zh";
    //是否更新
    public IS_UP: boolean = false;
    //计价方式
    public CURRENCYS_TYPE: any ;
    public CURRENCY_INFO: any = {
        status: false,
        currencyFrom :"",
        currencyTo:"USD",
        exchange:"1",
        type: 'en',
        currencyToSymbol: '$',
    }; 

    public CHAGE_CURRENCY = new BehaviorSubject<any>(undefined);
    public CHAGE_CURRENCY$: Observable<any> = this.CHAGE_CURRENCY
        // 在值被设置时，
        // 使用 distinctUntilChanged() 方法保证只处理真正变化了的值
        .map(v => v)
        .distinctUntilChanged()
        

    //保存最后一次查看的交易对，初始化的时候为第一个交易对
    public LAST_TRADER = new BehaviorSubject<string>(undefined);
    public LAST_TRADER$: Observable<any> = this.LAST_TRADER
        // 在值被设置时，
        // 使用 distinctUntilChanged() 方法保证只处理真正变化了的值
        .map(v => v)
        .distinctUntilChanged();

    //k线图参数
    public KlineParameter: any = {
        timeType: 0,
        MA: true,
    };

    constructor(
        public storage: Storage,
        private device: Device,
        private geolocation: Geolocation,
        private platform: Platform,
    ) {
        this.initProperties();
        this.getDataFromStorage();
        this.getAppDevice();
        this.initAppRegister();
        window["appdata"] = this;
    }

    private _ready: boolean = true;
    /**
     * 配置私密数据缓存的key
     */
    private _private_data_keyword = ["account", "contact"];

    public get ready(): boolean {
        return this._ready;
    }

    public timeOut = 10000;

    private _data = {
        token: "",
        customerId: "",
        password: "",
        savePassword: false,
        productId: "",
        show_onestep_trade: false,
        show_onestep_warning: true,
        products: new Map(),
        traderList: new Map(),
        version: "",
        register_number: {
            validity: new Date(),
            content: [],
        },
        show_login_code: false,
        exchangeType: 1,
        hiddentext:'',
        risefallColor: false,
        kLine: false,
        trade_type:false,
        left_or_right: false,
        CURRENCY_INFO: null,
        auto_upgrade: false,
    };
    private _in_storage_keys = ["products", "traderList"];

    // 声明属性，但在之后会被更换为访问器属性。
    public token;
    public customerId;
    public password;
    public savePassword;
    public productId;
    public mainproducts;
    public show_onestep_trade;
    public show_onestep_warning;
    public version;
    public register_number;
    public show_login_code;
    public exchangeType;
    public hiddentext;
    public risefallColor;
    public kLine;
    public trade_type;
    public left_or_right;
    public auto_upgrade;

    // 国家、区号列表
    public COUNTRY_LIST:any = [
        {name: "中国", code: "+86", phoneRegex: "^(\+?0?86\-?)?1[345789]\d{9}$"}
    ];

    //缓存产品信息
    public products: Map<string, AnyObject>;
    productsPromise: Promise<Map<string, any>>;
    public traderList: Map<string, AnyObject>;
    traderListPromise: Promise<Map<string, any>>;

    private _dataReady: Promise<any> = Promise.resolve();

    public get dataReady() {
        return this._dataReady;
    }

    public resetCustomization() {
        // console.log('storage.keys: ',this.storage.keys())
        const reg = new RegExp(this._private_data_keyword.join("|"));
        // console.log(reg)
        this.storage.forEach((value, key, index) => {
            // console.log('storage', key , ' : ' ,value)
            if (reg.test(key)) {
                this.storage.remove(key);
            }
        });
        this.token = "";
        this.customerId = "";
        this.password = "";
        this.savePassword = false;
        this.show_onestep_trade = false;
        this.show_onestep_warning = true;
    }

    isJSON(str: any) {
        if (typeof str == "string") {
            try {
                return JSON.parse(str);
            } catch (e) {
                return str;
            }
        }
        return str;
    }

    async getAppDevice(again?:boolean) {
        //获取手机信息，区分ios跟android
        if(this.platform.is("ios")) {
            // ios取消了uuid的获取，本地生成uuid并写入到ios的keychain的存储中
            let _uuid:any = await this.storage.get('ios_uuid')
            .then(value => {
                return value;
            })
            .catch(err => {
                return '';
            });
            
            if(!_uuid) {
                _uuid = UUID.v1();
                await this.storage.set('ios_uuid', _uuid).then(() => {
                    this.DEVICE_DATA.uuid = _uuid
                })
                  .catch(err => {
                      if(!again) {
                          return this.getAppDevice(true);
                      }
                  });
            } else {
                this.DEVICE_DATA.uuid = _uuid
            }
            onresize1('uuid', _uuid);
        } else {
            Object.keys(this.DEVICE_DATA).forEach( key => {
                const value = this.device[key];
                this.DEVICE_DATA[key] = value || "";
            });
        }
    }

    getAppCoords() {
        //获取地理位置
        return this.geolocation
            .getCurrentPosition({ timeout: 500 })
            .then(resp => {
                return {
                    status: "success",
                    coords: resp.coords,
                };
            })
            .catch(error => {
                return {
                    status: "err",
                    message: error,
                };
            });
    }

    // 初始化本机记录的注册手机号
    initAppRegister() {
        let appRegister = this.register_number;

        // 如果没记录，初始化
        if (!appRegister) {
            this.register_number = {
                validity: new Date(),
                content: [],
            };
        } else {
            // 如果是新的一天，初始化
            let time = appRegister.validity
                ? new Date(appRegister.validity)
                : new Date();
            if (
                new Date().getTime() - time.getTime() > 86400000 ||
                new Date().getDay() != time.getDay()
            ) {
                this.register_number = {
                    validity: new Date(),
                    content: [],
                };
            }
        }
    }
    // 获取每日注册的账户个数
    getAppRegisterLength() {
        return this.register_number.content.length;
    }
    // 注册成功，记录
    setAppRegisterLength(account) {
        this.register_number.content.push(account);
        this.register_number = this.register_number;
    }

    readonly APPDATASERVICE_PREIX = "App-Data-Service:";
    private getDataFromStorage() {
        Object.keys(this._data).forEach(key => {
            if (this._in_storage_keys.indexOf(key) === -1) {
                this._data[key] = this.isJSON(
                    localStorage.getItem(this.APPDATASERVICE_PREIX + key),
                );
            } else {
                this[key + "Promise"] = this.storage.ready().then(async () => {
                    // debugger
                    return (this._data[key] =
                        this.isJSON(await this.storage.get(key)) || new Map());
                });
            }
        });

        // // 没有为 storage 的失败进行处理。
        // // （目前没有遇到过失败的情况）
        // this._dataReady = this.storage
        //   .ready()
        //   .then(() =>
        //     Promise.all(
        //       Object.keys(this._data).map(name =>
        //         this.storage.get(name).then(val => {
        //           if (val !== null && val !== undefined) {
        //             this._data[name] = val;
        //           }
        //         })
        //       )
        //     )
        //   )
        //   .then(() => {
        //     // this.initProxy();
        //     if (!this.savePassword && (this.password || this.token)) {
        //       this.password = '';
        //       this.token = '';
        //     }
        //     this._ready = true;
        //     // console.log('storage data ready!');
        //   });
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
    initProperties() {
        this._dataReady = this.storage.ready();
        Object.keys(this._data).forEach(key => {
            if (this._in_storage_keys.indexOf(key) === -1) {
                var storage_set = localStorage.setItem.bind(localStorage);
                var storage_remove = localStorage.removeItem.bind(localStorage);
            } else {
                storage_set = (k, v) =>
                    this.storage
                        .ready()
                        .then(() => this.storage.set(k, JSON.stringify(v)));
                storage_remove = k =>
                    this.storage.ready().then(() => this.storage.remove(k));
            }
            Object.defineProperty(this, key, {
                get: () => {
                    return this._data[key];
                },
                set: value => {
                    this._data[key] = value;
                    if (value !== null && value !== undefined) {
                        storage_set(
                            this.APPDATASERVICE_PREIX + key,
                            JSON.stringify(value),
                        );
                    } else {
                        storage_remove(this.APPDATASERVICE_PREIX + key);
                    }
                },
                // 确保在 defineProperty 之后不允许再更改属性的设置。
                configurable: false,
                // 允许枚举
                enumerable: true,
            });
        });
        // const self = this;

        // Object.keys(this._data).forEach(key => {
        //   Object.defineProperty(this, key, {
        //     get() {
        //       return self._data[key];
        //     },
        //     set(value) {
        //       self._data[key] = value;

        //       self.storage.ready().then(() => {
        //         if (value !== null && value !== undefined) {
        //           self.storage.set(key, value);
        //         } else {
        //           self.storage.remove(key);
        //         }
        //       });
        //     },
        //     // 确保在 defineProperty 之后不允许再更改属性的设置。
        //     configurable: false,
        //     // 允许枚举
        //     enumerable: true
        //   });
        // });
    }
}
var resizeInfo = document.createElement("div");
function onresize1(key, value) {
    if (!resizeInfo.parentElement && document.body) {
        resizeInfo.style.cssText =
            "display:none;position:fixed;top:100px;left:100px;background:rgba(0,0,0,0.5);color:#FFF;opacity:0.3;pointer-events:none;";
        document.body.appendChild(resizeInfo);
    }
    resizeInfo.innerHTML += `<p>${key} : ${value}</p>`;
}
