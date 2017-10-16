import { Injectable } from '@angular/core';

import { AlertController/*, Alert*/,LoadingController, Loading,ToastController } from 'ionic-angular';


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
    let toast = this.toastCtrl.create({
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
          text: "OK",
          // handler: () => {

          // }
        }
      ]
    });
    confirm.present();
  }

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController

  ){

  }
}
