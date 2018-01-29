import { Component, Renderer } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";

@Component({
  selector: "common-alert",
  templateUrl: "common-alert.html"
})
export class CommonAlert {
  text1: string;
  text2: string;

  constructor(
    public renderer: Renderer,
    public viewCtrl: ViewController,
    public navParams: NavParams
  ) {
    this.renderer.setElementClass(
      viewCtrl.pageRef().nativeElement,
      "common-alert",
      true
    );
    this.text1 = this.navParams.get('title1');
    this.text2 = this.navParams.get('title2');
  }

  dismiss() {
    console.log(1111)
    this.viewCtrl.dismiss();
  }
}
