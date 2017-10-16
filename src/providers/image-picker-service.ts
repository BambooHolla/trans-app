import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { ImagePicker } from '@ionic-native/image-picker';
import { AndroidPermissions } from '@ionic-native/android-permissions';

@Injectable()
export class ImagePickerService {

    constructor(
        private imagePicker: ImagePicker,
        private androidPermissions: AndroidPermissions,
        private platform: Platform,
    ) {

    }

    checkPermission(): Promise<any>{
        if (this.platform.is('android')){
            return this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
                .catch(err =>
                    this.androidPermissions.requestPermissions(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
                );
        }

        const imagePicker = this.imagePicker;
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

    takePicture(maximumImagesCount): Promise<any> {
        // console.log('takePicture');

        const imagePicker = this.imagePicker;
        const options = {
            maximumImagesCount,
            // width,
            // height,
            quality: 85,
            outputType: 0,
        };

        // 在访问手机相册前先检测是否有权限
        return this.checkPermission()
            .then(result => imagePicker.getPictures(options))
            .then(results => {
                (results as string[]).forEach(item => {
                    console.log('Image URI: ' + item);
                });

                return (results as string[]);
            })
            .catch(err => {
                if (typeof err === 'string'){
                   console.log(err);
               } else {
                   for (let key in err){
                       console.log(key + '\n' + err[key])
                   }
               }

               return null;
            });

    }
}
