import { Component } from '@angular/core';

import { ViewController, NavParams } from 'ionic-angular';
//import { NavParams } from 'ionic-angular';

@Component({
    selector: 'modal-information',
    templateUrl: 'information-modal.html'
})
export class InformationModal {
    // character;
    constructor(public viewCtrl: ViewController,
                  public params: NavParams,)
    {
        console.log(this.params);
    }

    close(){
        this.viewCtrl.dismiss();
    }


}