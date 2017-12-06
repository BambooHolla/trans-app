import { Component } from '@angular/core';
// import { FormControl, FormGroup } from '@angular/forms';
import {
    Platform,
    ActionSheetController,
    ModalController,
    NavController,
    ViewController
} from 'ionic-angular';

// import { CreateAccountConfirmPage } from '../create-account-confirm/create-account-confirm';
// import { CreateAccountStepThirdPage } from '../create-account-step-third/create-account-step-third';

// import { CameraModal } from "../../modals/camera/camera";

import { ImageTakerController } from '../../components/image-taker-controller';
// import { ImageTaker } from "../../components/image-taker-controller";
import { FsProvider, FileType } from '../../providers/fs/fs';

@Component({
    selector: 'page-identification',
    templateUrl: 'identification.html'
    // template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class IdentificationPage {
    private images = [
        { name: 'front', text: '正　面', image: null, fid: '' },
        { name: 'back', text: '反　面', image: null, fid: '' }
    ];

    constructor(
        public platform: Platform,
        public actionsheetCtrl: ActionSheetController,
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public imageTakerCtrl: ImageTakerController,
        public fs: FsProvider
    ) {}

    submitPhoto() {
        const valid = this.images.every(item => item.image);
        if (valid) {
            const result = {};
            this.images.forEach(({ name, image, fid }) => {
                result[name] = fid;
            });
            this.viewCtrl.dismiss(result);
        }
    }
    // caConfirm(){
    //     this.navCtrl.push(CreateAccountConfirmPage);
    // };

    cancelSubmit() {
        //TOConfirm: 不传照片数据
        this.viewCtrl.dismiss();
    }

    upload(name) {
        const imageTaker = this.imageTakerCtrl.create(name);
        const fid_promise = this.fs.getImageUploaderId(FileType.身份证图片);
        imageTaker.onDidDismiss((result, role) => {
            if (role !== 'cancel' && result) {
                const image = this.images.find(
                    item => item.name === result.name
                );
                // console.log('index: ', index, result);
                if (result.data) {
                    // console.log(result.data);
                    image.image = result.data;
                    alert(result.data.substr(0, 10));
                    // 开始上传
                    (async () => {
                        const fid = await fid_promise;
                        const upload_res = await this.fs.uploadImage(
                            fid,
                            this.dataURItoBlob(result.data)
                        );
                        console.log('upload_res', upload_res);
                        if (image.image === result.data) {
                            image.fid = fid;
                        }
                    })();
                } else {
                    image.image = 'assets/images/no-record.png';
                }
                // console.log(this.images);
            }
        });
        imageTaker.present();
    }

    dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else byteString = decodeURI(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI
            .split(',')[0]
            .split(':')[1]
            .split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], { type: mimeString });
    }
}
