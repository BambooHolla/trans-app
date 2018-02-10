// customize prompt alert

import { Component, Renderer } from "@angular/core";
import { ViewController, NavParams, AlertController } from "ionic-angular";
import { AlertService } from "../../providers/alert-service";


@Component({
  selector: "customize-alert",
  templateUrl: "customize-alert.html"
})
export class CustomizeAlert {
  tip: string;
  recommendCode: string;

  constructor(
    public renderer: Renderer,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public alertService: AlertService
  ) {
    this.renderer.setElementClass(
      viewCtrl.pageRef().nativeElement,
      "customize-alert",
      true
    );
    this.tip = this.navParams.get('tip') || '请输入邀请码';
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  submit() {
    if (this.recommendCode && this.recommendCode != '') {
      this.viewCtrl.dismiss(this.recommendCode);
      this.alertService.presentLoading('正在处理..');
      setTimeout(() => {
      this.alertService.dismissLoading();
      },15000)
    } else {
      this.alertCtrl
      .create({
        title: '警告',
        message: '请输入正确的值',
        buttons: ['OK']
      })
      .present();
    }
  }
}
