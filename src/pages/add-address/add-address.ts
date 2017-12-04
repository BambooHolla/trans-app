import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@Component({
	selector: 'page-add-address',
	templateUrl: 'add-address.html'
})
export class AddAddressPage {
	constructor(public navCtrl: NavController, public navParams: NavParams) {}

	ionViewDidLoad() {
		console.log('ionViewDidLoad AddAddressPage');
	}

	protocolAgree = true;
	toggleProtocolAgree() {
		this.protocolAgree = !this.protocolAgree;
	}

	submitAddAddress(){
		
	}
}
