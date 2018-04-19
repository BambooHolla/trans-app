import { Injectable } from '@angular/core';
import { ToastController } from "ionic-angular";


@Injectable()
export class ModalControlleService {

    private _toast_ctrl_modal:any;

    constructor(
        private toastController: ToastController,
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
            this._toast_ctrl_modal.dismiss();
            this._toast_ctrl_modal = this.toastController.create(model);
        }else{
            this._toast_ctrl_modal = this.toastController.create(model);
        }
        this._toast_ctrl_modal.present();
    }
}