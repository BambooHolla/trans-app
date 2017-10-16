import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { NavController, ToastController } from 'ionic-angular';


@Component({
    selector: 'change-trade-password',
    templateUrl: 'change-trade-password.html',
})
export class ChangeTradePassword {
    constructor(
        public navCtrl: NavController,
        public toastCtrl: ToastController,
    )
     {};

    PasswordForm: FormGroup = new FormGroup({
        oldPassword: new FormControl(''),
        newPassword: new FormControl(''),
        newPasswordConfirm: new FormControl(''),
    });
    doValidate() {
        const controls = this.PasswordForm.controls;
        for(const field in controls){
            if(controls[field].value.length < 6){
                return this.toastAlert('请确认密码长度');
            }
        }
        if (controls.newPassword.value !== controls.newPasswordConfirm.value){
            return this.toastAlert('您两次输入的密码不相同！');
        }
        console.log('ready service') 
    }

    toastAlert(message, duration = 3000, position = 'top'){
        let toast = this.toastCtrl.create({
          message,
          duration,
          position,
        });
        toast.present();
    }

}
