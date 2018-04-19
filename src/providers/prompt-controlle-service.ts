import { Injectable } from '@angular/core';
import { ToastController,Toast } from "ionic-angular";


@Injectable()
export class PromptControlleService {

    private _toast_ctrl_modal:Toast;

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
            this._toast_ctrl_modal.dismissAll();
            this._toast_ctrl_modal = this.toastController.create(model);
        }else{
            this._toast_ctrl_modal = this.toastController.create(model);
        }

        return this._toast_ctrl_modal;

    }
}