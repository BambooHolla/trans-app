import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { CreateAccountStepFirstPage } from '../create-account-step-first/create-account-step-first';

@Component({
    selector: 'page-create-account-prompt',
    templateUrl: 'create-account-prompt.html',
    // template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class CreateAccountPromptPage {

    constructor(public navCtrl: NavController) { };
    caStepFirst(){
        this.navCtrl.push(CreateAccountStepFirstPage);
    };
}
