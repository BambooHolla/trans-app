import { Component } from "@angular/core";

import { ViewController, NavParams } from "ionic-angular";
// import { NavParams } from 'ionic-angular';

@Component({
    selector: "modal-input",
    templateUrl: "input.html",
})
export class InputModal {
    private newInput: string = "";

    constructor(public viewCtrl: ViewController, params: NavParams) {
        // constructor(params: NavParams) {
        // console.log(params);
    }

    close() {
        this.viewCtrl.dismiss();
    }

    submit() {
        this.viewCtrl.dismiss(this.newInput);
    }
}
