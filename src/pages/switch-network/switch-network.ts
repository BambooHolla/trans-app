import { Component } from '@angular/core';

import { NavController, AlertController } from 'ionic-angular';
import { AppSettingProvider } from '../../bnlc-framework/providers/app-setting/app-setting';

@Component({
  selector: 'switch-network',
  templateUrl: 'switch-network.html'
})
export class SwitchNetworkPage {

  commandData: any[] = [
    {
      name: '本地网络',
      value: "http://192.168.18.23:40001",
      hidden: true,
    }, 
 
    {
      name: '测试网络',
      value: "https://test.picaex.com",
      hidden: true,
    }, 
    // {
    //   name: '正式网络',
    //   value: "https://www.picaex.com",
    //   checked: false,
    // },
  ]
 
  constructor(
      public navCtrl: NavController,
      public appSettingProvider: AppSettingProvider,
      public alterCtrl: AlertController,
    ) {

    this.commandData.find( (item,index) => {
        if(item.value == AppSettingProvider.SERVER_URL) {
            item.hidden = false;
            return true;
        }
        return false ;
    })
  }
  ionChange(data:any){
    if(!data.hidden) return;
    this.alterCtrl.create({
        title:'警告',
        message:"非相关人员请勿进行切换网络操作",
        buttons: [
            {
              text: '取消',
              role: 'cancel',
              handler: () => {
              }
            },
            {
              text:'切换',
              handler: () => {
                  this.swichNetwork(data);
              }
            }
          ]
    }).present();
  }
  swichNetwork( data:any ){
    this.alterCtrl.create({
        title:`警告`,
        message:`是否重启切换到${data.name}`,
        buttons: [
            {
              text: '取消',
              role: 'cancel',
              handler: () => {
              }
            },
            {
              text:'确定',
              handler: () => {
                localStorage.setItem('SERVER_URL_APP',JSON.stringify(data.value))
                this.appSettingProvider.clearUserToken();
                this.navCtrl.parent.select(0).then(() => {
                    location.reload();
                });
              }
            }
          ]
    }).present();
  }
}
