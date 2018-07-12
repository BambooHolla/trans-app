import { Component } from "@angular/core";

import { NavController } from "ionic-angular";

import { LoginPage } from "../login/login";
import { CreateAccountPromptPage } from "../create-account-prompt/create-account-prompt";

@Component({
    selector: "page-entrance",
    templateUrl: "entrance.html",
    // template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class EntrancePage {
    loginPage: any = LoginPage;
    createAccountPromptPage: any = CreateAccountPromptPage;

    constructor(public navCtrl: NavController) {}
}
