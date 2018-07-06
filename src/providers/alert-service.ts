import { Injectable} from '@angular/core';

import { AlertController/*, Alert*/,LoadingController, Loading } from 'ionic-angular';
import { PromptControlleService } from "../providers/prompt-controlle-service";
import { LoginService } from './login-service';

@Injectable()
export class AlertService {
  private loader: Loading;
  presentLoading(val) {
      this.loader = this.loadingCtrl.create({
        content: val,
      });
      this.loader.present();
    }
  
  dismissLoading() {
      if (this.loader){
        this.loader.dismiss();
        this.loader = null;
      }
    }
  
  alertTips(tip:string) {
    let toast = this.promptCtrl.toastCtrl({
      message: tip,
      duration: 900,
      position: 'middle',
      cssClass: 'stock'
    });
    toast.present();
  }
  showAlert(title, message, cssClass = 'dark-alert'){
    let confirm = this.alertCtrl.create({
      cssClass,
      title,
      message,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: window['language']['COFIRM']||"确定",
          // handler: () => {

          // }
        }
      ]
    });
    confirm.present();
  }
  show(title, message, type){
    let confirm = this.alertCtrl.create({
      title,
      message,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked')
          }
        },
        {
          text:'重启',
          handler: data => {
            if(type) {
              localStorage.setItem("SERVER_URL_APP",JSON.stringify('https://test.picaex.com'))
            } else {
              localStorage.setItem("SERVER_URL_APP",JSON.stringify('https://www.picaex.com'))
            }
              location.reload();
          }
        }
      ]
    });
    confirm.present();
  }
  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public promptCtrl: PromptControlleService,
  ){

  }
}
