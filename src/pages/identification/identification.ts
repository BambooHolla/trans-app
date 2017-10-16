import { Component } from '@angular/core';
// import { FormControl, FormGroup } from '@angular/forms';
import { Platform, ActionSheetController, ModalController, NavController, ViewController } from 'ionic-angular';

// import { CreateAccountConfirmPage } from '../create-account-confirm/create-account-confirm';
// import { CreateAccountStepThirdPage } from '../create-account-step-third/create-account-step-third';

// import { CameraModal } from "../../modals/camera/camera";

import { ImageTakerController } from "../../components/image-taker-controller";
// import { ImageTaker } from "../../components/image-taker-controller";

@Component({
    selector: 'page-identification',
    templateUrl: 'identification.html',
    // template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class IdentificationPage {

    private images = [
        {name: 'front', text: '正　面', image: null},
        {name: 'back', text: '反　面', image: null},
    ];

    constructor(
    	public platform: Platform,
        public actionsheetCtrl: ActionSheetController,
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public imageTakerCtrl: ImageTakerController,
	) {

	}

    submitPhoto(){
        const valid = this.images.every(item => item.image);
        if (valid) {
            const result = {};
            this.images.forEach(({name, image}) => {
                result[name] = image;
            });
            this.viewCtrl.dismiss(result);
        }
    }
    // caConfirm(){
    //     this.navCtrl.push(CreateAccountConfirmPage);
    // };

    cancelSubmit(){
        //TOConfirm: 不传照片数据
        this.viewCtrl.dismiss()
    }

    upload(name){
        const imageTaker = this.imageTakerCtrl.create(name);
        imageTaker.onDidDismiss((result, role) => {
            if (role !== 'cancel' && result) {
                const index = this.images.findIndex(item => item.name === result.name);
                // console.log('index: ', index, result);
                if (result.data){
                    // console.log(result.data);
                    this.images[index].image = result.data;
                } else {
                    this.images[index].image = 'assets/images/no-record.png';
                }
                // console.log(this.images);
            }
        });
        imageTaker.present();
    }

}
