import { Component } from "@angular/core";

import { NavController } from "ionic-angular";

@Component({
    selector: "page-auth-pending",
    templateUrl: "auth-pending.html",
})
export class AuthPendingPage {
    constructor(public navCtrl: NavController) {
        var length = this.navCtrl.length();
        // console.log(index, this.navCtrl)
        this.navCtrl.remove(1, length - 1);
        // console.log( this.navCtrl)
    }
}
