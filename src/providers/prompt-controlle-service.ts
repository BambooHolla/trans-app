import { Injectable } from '@angular/core';
import { Platform,
         App, 
         NavController,
         ViewController,
         ToastController,
         Toast,
         ActionSheetController,
         ModalController,

} from "ionic-angular";

import { CameraModal } from '../modals/camera/camera';
@Injectable()
export class PromptControlleService {

    private _toast_ctrl_modal:Toast;

    private activeNav: NavController = this._app.getActiveNav();
    constructor(
        private toastController: ToastController,
        public actionsheetCtrl :ActionSheetController,
        private modalCtrl: ModalController,
        public platform: Platform,
        public _app: App,
    ) {
        
    } 

    toastCtrl( 
       model?:{
        message?: string,
        cssClass?: string,
        duration?: number,
        showCloseButton?: boolean,
        closeButtonText?: string,
        dismissOnPageChange?: boolean,
        position?: string
       }
    ){
        if (this._toast_ctrl_modal) {
            this._toast_ctrl_modal.dismissAll();
            this._toast_ctrl_modal = this.toastController.create(model);
        }else{
            this._toast_ctrl_modal = this.toastController.create(model);
        }

        return this._toast_ctrl_modal;

    }

    imageTakerCtrl(name){
       
        let actionSheet = this.actionsheetCtrl.create({
            // title: 'Albums',
            // cssClass: 'action-sheets-basic-page',
            buttons: [
                {
                    text: '从相册中选择',
                    handler: () => {
                        this.hideSheet();
                        
                        const inputEle = document.createElement('input');
                        inputEle.type = 'file';
                        inputEle.accept = 'image/*';
                        var clickEvent = new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        });
                        inputEle.dispatchEvent(clickEvent);
                        
                        inputEle.onchange = e => {
                            _unRegisterBackButton();
                            if (inputEle.files && inputEle.files[0]) {
                                actionSheet.dismiss({
                                    name,
                                    data: URL.createObjectURL(inputEle.files[0])
                                }).then(() => {
                                    this.activeNav.pop();
                                });                 
                            } else {
                                
                                actionSheet.dismiss(null).then(() => {
                                    this.activeNav.pop();
                                });
                            }
                        };
                        return false;
                    }
                },
                {
                    text: '马上拍一张',
                    handler: () => {
                        this.hideSheet();
                        
                        let cameraModal = this.modalCtrl.create(CameraModal);
                        cameraModal.onDidDismiss((data, role) => {
                            _unRegisterBackButton();
                            actionSheet.dismiss({
                                name,
                                data
                            }).then(() => {
                                this.activeNav.pop();
                            });
                        });
                        
                        cameraModal.present();
                        return false;
                    }
                },
                {
                    text: '取消',
                    role: 'cancel',
                    handler: () => {
                        _unRegisterBackButton();
                        actionSheet.dismiss(null).then(() => {
                            this.activeNav.pop();
                        });
                        return false;
                    }
                }
            ]
        });
         // 硬件返回
         let _unRegisterBackButton = this.platform.registerBackButtonAction(() => {
            _unRegisterBackButton();
             actionSheet.dismiss(null).then(() => {
                 this.activeNav.pop();
             });
             
        })

        return actionSheet;
        
    }

    // 隐藏下拉菜单
    hideSheet(){
        const ionActionSheet = document.querySelector('ion-action-sheet') as HTMLElement;
        ionActionSheet.style.opacity = '0';
    }
 
}