import { Component } from "@angular/core";

import { NavController, AlertController } from "ionic-angular";
import { AppSettingProvider } from "../../bnlc-framework/providers/app-setting/app-setting";

@Component({
    selector: "page-switch-network",
    templateUrl: "switch-network.html",
})
export class SwitchNetworkPage {
    commandData: any[] = [
        {
            name: "本地网络",
            value: "http://192.168.18.23:40001",
            hidden: true,
        },

        {
            name: "测试网络",
            value: "https://test.picaex.com",
            hidden: true,
        },
        {
            name: 'release',
            value: "http://192.168.17.110:40001",
            hidden: true,
        },
    ];

    constructor(
        public navCtrl: NavController,
        public appSettingProvider: AppSettingProvider,
        public alertCtrl: AlertController,
    ) {
        this.commandData.find((item, index) => {
            if (item.value == AppSettingProvider.SERVER_URL) {
                item.hidden = false;
                return true;
            }
            return false;
        });
    }
    ionChange(data: any) {
        if (!data.hidden) return;
        this.alertCtrl
            .create({
                title: "警告",
                message: "非相关人员请勿进行切换网络操作",
                buttons: [
                    {
                        text: "取消",
                        role: "cancel",
                        handler: () => {},
                    },
                    {
                        text: "切换",
                        handler: () => {
                            this.swichNetwork(data);
                        },
                    },
                ],
            })
            .present();
    }

    private clickCount: number = 0;
    private _time: any;
    inputNetwork() {
        if(this._time) {
            clearTimeout(this._time);
        }
        this._time = setTimeout(() => {
            this.clickCount = 0;
        }, 1000);
        this.clickCount++;
        if(this.clickCount > 6) {
            const prompt = this.alertCtrl.create({
                title: '网络配置',
                cssClass: "network-page",
                inputs: [
                  {
                    name: 'network',
                    placeholder: '如：192.168.18.23：40001'
                  },
                ],
                buttons: [
                  {
                    text: '取消',
                    handler: data => {
                    }
                  },
                  {
                    text: '确定',
                    handler: data => {
                      console.log(data);
                      this.swichNetwork({
                        value:  data.network,
                        name: "自定义网络",
                      })
                    }
                  }
                ]
            });
            prompt.present();
        }
        
    }
    swichNetwork(data: any) {
        this.alertCtrl
            .create({
                title: `警告`,
                message: `是否重启切换到${data.name}`,
                buttons: [
                    {
                        text: "取消",
                        role: "cancel",
                        handler: () => {},
                    },
                    {
                        text: "确定",
                        handler: () => {
                            localStorage.setItem(
                                "SERVER_URL_APP",
                                JSON.stringify(data.value),
                            );
                            this.appSettingProvider.clearUserToken();
                            this.navCtrl.parent.select(0);
                            location.reload();
                        },
                    },
                ],
            })
            .present();
    }
}
