import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { ImagePicker } from '@ionic-native/image-picker';
import { AndroidPermissions } from '@ionic-native/android-permissions';

@Component({
    selector: 'page-image-picker',
    templateUrl: 'image-picker.html'
})
export class ImagePickerPage {

    pictureValid: boolean = false;
    picture: string;

    constructor(
        public navCtrl: NavController,
        private imagePicker: ImagePicker,
        private androidPermissions: AndroidPermissions,
    ) {

    }

    ngOnInit() {  
        // this.startCamera();
    }

    checkPermission(): Promise<any>{
        const imagePicker = this.imagePicker;
        // return this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
        //     .catch(err =>
        //         this.androidPermissions.requestPermissions(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
        //     );
        return imagePicker.hasReadPermission()
            .then(result => result ?
                true :
                imagePicker.requestReadPermission()
            )
            .then(result => result ?
                result :
                Promise.reject('no permission')
            );
    }

    takePicture() {
        console.log('takePicture');

        const imagePicker = this.imagePicker;
        const options = {
            maximumImagesCount: 1,
            quality: 85,
            outputType: 0,
        };

        // 在访问手机相册前先检测是否有权限
        this.checkPermission()
            .then(result => imagePicker.getPictures(options))
            .then(results => {
                const allImages = [];
                for (var i = 0; i < results.length; i++) {
                    console.log('Image URI: ' + results[i]);
                    allImages.push(results[i]);
                }

                if (allImages.length){
                    this.picture = allImages[0];
                    this.pictureValid = true;
                } else {
                    this.picture = 'assets/images/no-record.png';
                    this.pictureValid = false;
                }
            })
            .catch(err => {
                if (typeof err === 'string'){
                   alert(err);
               } else {
                   for (let key in err)
                       alert(key + '\n' + err[key])
               }
            });

    }
}
