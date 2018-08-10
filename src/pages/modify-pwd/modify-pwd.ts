import { Component, ElementRef, HostBinding } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import {
    AlertController,
    IonicPage,
    LoadingController,
    NavController,
    NavParams,
    Events,
    ModalController,
} from "ionic-angular";

import { RegisterService } from "../../providers/register-service";
import { LoginService } from "../../providers/login-service";
import { AppDataService } from "../../providers/app-data-service";
import { AppSettings } from "../../providers/app-settings";
import { LoginPage } from "../login/login";
import { CryptoService } from "../../providers/crypto-service";
/**
 * Generated class for the ModifyPwdPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: "page-modify-pwd",
    templateUrl: "modify-pwd.html",
})
export class ModifyPwdPage {
    @HostBinding("class.account-form-page") isAccountFormPage = true;

    modifyForm: FormGroup = new FormGroup({
        oldPassword: new FormControl({ value: "", disabled: false }, [
            Validators.required,
            Validators.minLength(3),
        ]),
        newPassword: new FormControl({ value: "", disabled: false }, [
            Validators.required,
            Validators.minLength(3),
            this.validatePWDDiff.bind(this),
            this.validatePWDDStrength.bind(this, "newPassword"),
        ]),
        confirmNewPassword: new FormControl({ value: "", disabled: false }, [
            Validators.required,
            this.validatePWD.bind(this),
        ]),
    });
    get oldPassword() {
        return this.modifyForm.get("oldPassword");
    }
    get newPassword() {
        return this.modifyForm.get("newPassword");
    }
    get confirmNewPassword() {
        return this.modifyForm.get("confirmNewPassword");
    }

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public elementRef: ElementRef,
        public registerService: RegisterService,
        public loginService: LoginService,
        public appDataService: AppDataService,
        public appSettings: AppSettings,
        public events: Events,
        public modalController: ModalController,
        public cryptoService: CryptoService,
    ) {
        window["midifyPWDPage"] = this;
    }

    ionViewDidLoad() {
        console.log("ionViewDidLoad ModifyPwdPage");
    }

    onOldPasswordInput(e) {
        const newPassword = this.newPassword;
        this.newPassword.setErrors(this.validatePWDDiff());
        console.log("sameError", this.newPassword.getError("sameError"));
    }
    onNewPasswordInput(e) {
        const confirmNewPassword = this.confirmNewPassword;
        this.confirmNewPassword.setErrors(this.validatePWD());
        console.log(
            "confirmError",
            this.confirmNewPassword.getError("confirmError"),
        );
    }

    repeatPWDAdopt = false;
    validatePWDDiff() {
        if (this.modifyForm) {
            const oldPassword = this.modifyForm.get("oldPassword").value;
            const newPassword = this.modifyForm.get("newPassword").value;
            if (newPassword && oldPassword === newPassword) {
                this.repeatPWDAdopt = true;
                return { sameError: true };
            } else {
                this.repeatPWDAdopt = newPassword.length < 3 ? true : false;
                return null;
            }
        }
    }

    validatePWD() {
        if (this.modifyForm) {
            const password = this.modifyForm.get("newPassword").value;
            const confirPassword = this.modifyForm.get("confirmNewPassword")
                .value;
            return password !== confirPassword ? { confirmError: true } : null;
        }
    }

    validatePWDDStrength(pwdType) {
        if (this.modifyForm) {
            const password = this.modifyForm.get(pwdType).value;
            if (!password) return null;
            //密码至少包含一个大写，一个小写，一个数字
            let pattern = new RegExp(
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{3,}$/,
            );
            return pattern.test(password) ? null : { strengthError: true };
        }
    }

    modifying = false;
    async modify() {
        this.modifying = true;
        try {
            await this.loginService.doModifyPWD(
                this.cryptoService.MD5(this.oldPassword.value),
                this.cryptoService.MD5(this.newPassword.value),
            );

            this.alertCtrl
                .create({
                    title:
                        window["language"]["MODIFY_SUCCESSFULLY"] || "修改成功",
                    message:
                        window["language"]["PLEASE_RE_LOGIN"] || "请重新登录",
                    buttons: [
                        {
                            text: window["language"]["COFIRM"] || "确定",
                            handler: () => {
                                const views = this.navCtrl.getViews();
                                if (views.length > 1) {
                                    this.navCtrl
                                        .popToRoot({
                                            animate: false,
                                        })
                                        .then(() => {
                                            //清空登入信息,保留用户账号,跳转到登入页
                                            let customerId = this.appDataService
                                                .customerId;

                                            this.loginService
                                                .doLogout()
                                                .then(success => {
                                                    this.appDataService.customerId = customerId;
                                                    // this.routeTo('quotations')
                                                    //先把路由跳转到行情也，并触发登录事件,登入成功跳转到“我的”页面
                                                    this.navCtrl.parent.select(
                                                        0,
                                                    );
                                                    this.events.publish(
                                                        "show login",
                                                        "login",
                                                        () => {
                                                            this.navCtrl.parent.select(
                                                                3,
                                                            );
                                                        },
                                                    );
                                                });
                                        });
                                }
                            },
                        },
                    ],
                })
                .present();
            this.navCtrl.pop;
        } catch (err) {
            this.alertCtrl
                .create({
                    title: window["language"]["WARNING"] || "警告",
                    message: err.message,
                    buttons: [window["language"]["COFIRM"] || "确定"],
                })
                .present();
        } finally {
            this.modifying = false;
        }
    }
}
