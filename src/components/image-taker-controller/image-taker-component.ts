import { Component } from '@angular/core';

import { ActionSheetController, ModalController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular';

// import { ImagePicker } from '@ionic-native/image-picker';

import { CameraModal } from '../../modals/camera/camera';
import { ImagePickerService } from '../../providers/image-picker-service';

@Component({
    selector: 'image-taker',
    templateUrl: 'image-taker.html',
    providers: [
         CameraModal,
         // ImagePickerService,
    ],
})
export class ImageTakerCmp {

    private _name: string;
    private _maxCount: number;

    constructor(
        public _viewCtrl: ViewController,
        private cameraModal: CameraModal,
        private imagePickerService: ImagePickerService,
        private actionsheetCtrl: ActionSheetController,
        private modalCtrl: ModalController,
        params: NavParams,
    ) {
        console.log('ImageTakerCmp params: ', params);
        this._name = params.data.name;
        this._maxCount = params.data.maxCount;

        this.takePicture(this._name, this._maxCount);
    }

    ionViewDidLoad() {

    }

    takePicture(name: string = 'take picture', maxCount: number = 1) {
        let actionSheet = this.actionsheetCtrl.create({
            // title: 'Albums',
            // cssClass: 'action-sheets-basic-page',
            buttons: [
                {
                    text: '从相册中选择',
                    handler: () => {
                        this.imagePickerService.takePicture(maxCount)
                            .then(result => {
                                this.dismiss({
                                    name,
                                    data: result,
                                });
                            })
                    }
                },
                {
                    text: '马上拍一张',
                    handler: () => {
                        let cameraModal = this.modalCtrl.create(CameraModal);
                        cameraModal.onDidDismiss((data, role) => {
                            this.dismiss({
                                name,
                                data,
                            });
                        });

                        cameraModal.present();
                    }
                },
                {
                    text: '取消',
                    role: 'cancel',
                }
            ]
        });

        actionSheet.present()
    }

    dismiss(result: any): Promise<any> {
        return this._viewCtrl.dismiss(result);
    }
}
