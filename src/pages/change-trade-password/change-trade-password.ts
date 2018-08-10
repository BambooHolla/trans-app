import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import { NavController } from "ionic-angular";
import { PromptControlleService } from "../../providers/prompt-controlle-service";

@Component({
    selector: "change-trade-password",
    templateUrl: "change-trade-password.html",
})
export class ChangeTradePassword {
    constructor(
        public navCtrl: NavController,
        public promptCtrl: PromptControlleService,
    ) {}

    PasswordForm: FormGroup = new FormGroup({
        oldPassword: new FormControl(""),
        newPassword: new FormControl(""),
        newPasswordConfirm: new FormControl(""),
    });
    doValidate() {
        const controls = this.PasswordForm.controls;
        for (const field in controls) {
            if (controls[field].value.length < 6) {
                return this.toastAlert(
                    window["language"][
                        "PLEASE_CONFIRM_THE_LENGTH_OF_PASSWORD"
                    ] || "请确认密码长度",
                );
            }
        }
        if (controls.newPassword.value !== controls.newPasswordConfirm.value) {
            return this.toastAlert(
                window["language"][
                    "THE_TWO_PASSWORDS_YOU_INPUT_ARE_DIFFERENT"
                ] || "您两次输入的密码不相同！",
            );
        }
        console.log("ready service");
    }

    toastAlert(message, duration = 3000, position = "top") {
        let toast = this.promptCtrl.toastCtrl({
            message,
            duration,
            position,
        });
        toast.present();
    }
}
