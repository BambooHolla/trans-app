import { Component, ElementRef, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import {
    AlertController,
    IonicPage,
    LoadingController,
    NavController,
    NavParams,
    ModalController,
} from "ionic-angular";

import { RegisterService } from "../../providers/register-service";
import { AppDataService } from "../../providers/app-data-service";
import { AppSettings } from "../../providers/app-settings";
import { IdentificationNumberCheckerProvider } from "../../providers/identification-number-checker/identification-number-checker";

import { InformationModal } from "../../modals/information-modal/information-modal";
import { PromptControlleService } from "../../providers/prompt-controlle-service";
import { CryptoService } from "../../providers/crypto-service";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/fromEvent';
import { detachEmbeddedView } from "@angular/core/src/view";
/**
 * Generated class for the RegisterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: "page-register",
    templateUrl: "register.html",
})
export class RegisterPage {
    private country_list;
    private country_select;
    private countryColumns = {
        name: [
            {
                name: "country",
                options: []
            }
        ],
        code: [
            {
                name: "country",
                options: []
            }
        ]
    }
   
    private registerType: number = 1;
    // 监听输入框，用于自动判断是否存在账户，不存在的才能发送验证码
    private inputStream: any;
    // 账户格式错误显示
    private wrongCustomerId:string;
    registerForm: FormGroup = new FormGroup({
        // myContry: new FormControl('1002'),
        country: new FormControl(),
        customerId: new FormControl({ value: "", disabled: false }, [
            Validators.maxLength(256),
            // (data => {
            //     this.check_sending_vcode = false;
            //     if (!data.value) {
            //         this.check_sending_vcode = true;
            //         return null;
            //     }
            //     //如果用this.IDtye去获取，在这边会报错，get is not function
            //     if (!this.idNumberChecker.checkIphone(data.value)) {
            //         this.check_sending_vcode = true;
            //         return {
            //             wrongCustomerId: true,
            //         };
            //     }
            //     return null;
            // }).bind(this),
        ]),
        vcode: new FormControl({ value: "", disabled: false }, [
            Validators.required,
            Validators.maxLength(6),
        ]),
        password: new FormControl({ value: "", disabled: false }, [
            Validators.minLength(3),
            Validators.maxLength(64),
            Validators.required,
            this.validatePWDDStrength.bind(this, "password"),
        ]),
        confirPassword: new FormControl({ value: "", disabled: false }, [
            Validators.required,
            Validators.maxLength(64),
            this.validatePWD.bind(this),
        ]),
        protocolAgree: new FormControl({ value: true, disabled: false }),
        recommendCode: new FormControl({ value: "", disabled: false }),
    });
    get form_password() {
        return this.registerForm.get("password");
    }
    get form_customerId() {
        return this.registerForm.get("customerId");
    }
    get form_confirPassword() {
        return this.registerForm.get("confirPassword");
    }
    get form_vcode() {
        return this.registerForm.get("vcode");
    }
    get form_country() {
        return this.registerForm.get('country')
    }
    get form_recommendCode() {
        return this,this.registerForm.get('recommendCode');
    }
    validatePWD_switch = false;
    validatePWD() {
        if (this.registerForm) {
            const password = this.registerForm.get("password").value;
            const confirPassword = this.registerForm.get("confirPassword")
                .value;
            if (password && confirPassword && password !== confirPassword) {
                this.validatePWD_switch = true;
            } else {
                this.validatePWD_switch = false;
            }
        }
    }

    validatePWDDStrength(pwdType) {
        if (this.registerForm) {
            const password = this.registerForm.get(pwdType).value;
            if (!password) return null;
            //密码至少包含一个大写，一个小写，一个数字
            let pattern = new RegExp(
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{3,}$/,
            );
            return pattern.test(password) ? null : { strengthError: true };
        }
    }
    // protocolAgree = false;

    toggleProtocolAgree() {
        // this.protocolAgree = !this.protocolAgree;
        const rawVal = this.registerForm.getRawValue();
        rawVal.protocolAgree = !rawVal.protocolAgree;
        this.registerForm.setValue(rawVal);
    }

   

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        public promptCtrl: PromptControlleService,
        public alertCtrl: AlertController,
        public elementRef: ElementRef,
        public registerService: RegisterService,
        public appDataService: AppDataService,
        public appSettings: AppSettings,
        public idNumberChecker: IdentificationNumberCheckerProvider,
        public cryptoService: CryptoService,
    ) {
        //
        // const rawVal = this.registerForm.getRawValue();
        // // console.log(navParams.get('raw'), navParams)
        // const customerId = navParams.get('raw').customerId//.get('customerId');
        // if (customerId) {
        //   rawVal.customerId = customerId;
        //   this.registerForm.setValue(rawVal);
        // }
        this.country_list = this.appDataService.COUNTRY_LIST;
        this.country_list && this.country_list.forEach( item => {
            this.countryColumns.name[0].options.push({text:item.name,value:item.ab});
            this.countryColumns.code[0].options.push({text:item.code,value:item.ab});
        });
    }
    

    ionViewWillEnter() {
        const customerIdInput = this.elementRef.nativeElement.querySelector('#customerIdInput')
        this.inputStream = Observable.fromEvent(customerIdInput, 'input')
        .debounceTime(250)
        .pluck('target', 'value')
        .subscribe(data => {
            if(!data) {
                this.check_sending_vcode = true;
                return this.wrongCustomerId = this.registerType ? "请输入手机号" : "请输入邮箱";
            }
            let _country = 'CN';
            if(this.registerType) {
                _country = this.form_country.value;
            }  
            
            const _exp = this.country_list.find(item => {
                return item.ab == _country;
            }).phoneRegex;
            if(this.idNumberChecker.checkFormat(data,this.registerType,_exp)) {
                // this.checkRegister()
                this.check_sending_vcode = false;
                this.wrongCustomerId = '';
                return ;
            } 
            this.check_sending_vcode = true;
            this.wrongCustomerId = this.registerType ? "手机号格式错误" : "邮箱格式错误";
        });
        
    }
    ionViewDidLoad() {
        this.form_country.setValue('CN')
    }

    registering = false;

    async init() {
        const appDataService = this.appDataService;
        try {
            await appDataService.dataReady;

            const controls = this.registerForm.controls;

            for (const prop in controls) {
                controls[prop].enable();
                if (prop in appDataService) {
                    // console.log(prop, appDataService[prop]);
                    controls[prop].setValue(appDataService[prop]);
                }
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    sending_vcode = false;
    resend_time_clock = 0;
    check_sending_vcode = true;
    _resend_time_clock_ti: any;
    tickResendTimeClock() {
        this.resend_time_clock = 60;
        clearInterval(this._resend_time_clock_ti);
        this._resend_time_clock_ti = setInterval(() => {
            this.resend_time_clock -= 1;
            if (this.resend_time_clock === 0) {
                clearInterval(this._resend_time_clock_ti);
            }
        }, 1000);
    }
    async register_step1() {
        this.sending_vcode = true;
        try {
            if (!this.registerForm.get("customerId").value) {
                throw new RangeError(
                    window["language"][
                        "PLEASE_INPUT_MOBILE_PHONE_NUMBER_EMAIL"
                    ] || "请填写手机号/邮箱",
                );
            }
            const _customerId = this.form_customerId.value;
            const _countryCode = this.form_country.value;
            await this.registerService.sendSMSCode(
                _customerId,
                undefined,
                "1001",
                this.registerType,
                _countryCode 
            );

            this.tickResendTimeClock(); // 开始倒计时重新发送短信的按钮
        } catch (err) {
            this.alertCtrl
                .create({
                    title: window["language"]["WARNING"] || "警告",
                    message: err.message || err,
                    buttons: [window["language"]["CONFIRM"] || "确认"],
                })
                .present();
        } finally {
            this.sending_vcode = false;
        }
    }

    filterRegister() {
        const customerId = this.form_customerId.value;
        if (
            this.appSettings.accountType(customerId) === 0 &&
            !this.appSettings.accountEmailProposal(customerId)  
        ) {
            return this.alertCtrl
                .create({
                    title: window["language"]["WARNING"] || "警告",
                    subTitle:
                        window["language"]["RECOMMEND_REGISTERED"] ||
                        "推荐注册邮箱",
                    message: "126,163,qq,sina,gmail",
                    buttons: [
                        {
                            text: window["language"]["RETURN"] || "返回",
                        },
                        {
                            text: window["language"]["CONTINUE"] || "继续注册",
                            cssClass: "alter-right-button",
                            handler: () => {
                                this.register();
                            },
                        },
                    ],
                })
                .present();
        }
        return this.register();
    }

    async register() {
        // 判断当然是否已经注册了 10 个 账户
        if (this.appDataService.getAppRegisterLength() >= 10) {
            return this.alertCtrl
                .create({
                    title: window["language"]["WARNING"] || "警告",
                    message:
                        window["language"]["NOT_MORE_10"] ||
                        "每日注册账户不得超过10个",
                    buttons: [
                        {
                            text: window["language"]["COFIRM"] || "确定",
                        },
                    ],
                })
                .present();
        }
        this.registering = true;
        try {
            const controls = this.registerForm.getRawValue();

            const customerId = controls.customerId;
            const password = this.cryptoService.MD5(controls.password);
            const vcode = controls.vcode;
            const recommendCode = controls.recommendCode;
            const _countryCode = controls.country;
            // const timeZone = (-new Date().getTimezoneOffset() / 60).toString() || "8";
            // 旧的校验方式，现在以及在输入的时候检验
            // const type = this.appSettings.accountType(customerId)
            // if(type !== 0 && type !== 1){
            //   throw { message:'请使用中国大陆手机号码或电子邮箱地址注册'}
            // }
           
            this.registerService 
                .doAuthRegister(customerId, vcode, password, recommendCode,this.registerType,_countryCode)
                .then(() => { 
                    //注册成功，记录
                    this.appDataService.setAppRegisterLength(customerId);

                    const toast = this.promptCtrl.toastCtrl({
                        message:
                            window["language"]["REGISTER_SUCCESSFULLY"] ||
                            "注册成功",
                        duration: 1e3,
                        position: "middle",
                    });
                    toast.present();
                    this.navCtrl
                        .pop({ animate: false })
                        .then(this.navParams.get("dismissFn"));
                })
                .catch(err => {
                    //try -》 catch 捕获不到抛出的错误
                    this.alertCtrl
                        .create({
                            title: window["language"]["WARNING"] || "警告",
                            message: err.message,
                            buttons: [window["language"]["COFIRM"] || "确定"],
                        })
                        .present();
                });
        } finally {
            // catch (err) {

            //   this.alertCtrl
            //     .create({
            //       title: '警告',
            //       message: err.message,
            //       buttons: ['确定']
            //     })
            //     .present();
            // }
            this.registering = false;
        }
    }

    showModal(agreementName = "registAgreement") {
        let language: string = this.appDataService.LANGUAGE || "en";
        if (language in this.appSettings.agreementData) {
            const registAgreement = this.appSettings.agreementData;
            const informationModal = this.modalCtrl.create(InformationModal, {
                title: registAgreement[language].title,
                agreementFirst: registAgreement[language].agreementFirst,
            });
            informationModal.present();
        }
    }

    
    async checkRegister() {
        const controls = this.registerForm.getRawValue();
        const customerId = controls.customerId;
        if (
            !this.check_sending_vcode &&
            customerId &&
            !this.resend_time_clock
        ) {
            try {
                this.registerService.doCheckRegister(customerId).then(data => {
                    //账户不存在 
                    if (data.status == "error") {
                        this.register_step1();
                    }
                    //账户存在
                    if (data.status == "ok") {
                        this.check_sending_vcode = true;
                        this.wrongCustomerId = this.registerType ? "手机号已被注册":"邮箱已被注册";
                    }
                });
            } catch (err) {
                console.log("register checkRegister", err);
            }
        }
    }
    changeRegiserType(type:number) {
        this.registerType = type;
        this.form_customerId.setValue('')
        this.form_password.setValue('')
        this.form_confirPassword.setValue('')
        this.form_vcode.setValue('')
        this.form_recommendCode.setValue('');
        this.wrongCustomerId = '';
        this.check_sending_vcode = true;
        this.resend_time_clock = 0;
        clearInterval(this._resend_time_clock_ti);
        this.sending_vcode = false;
    }
    changeCountry($event) {
        const { country } = $event;
        country && this.form_country.setValue(country.value);
        country && this.inputStream.next(this.form_customerId.value);
    }

    goLogin() {
        this.navCtrl
        .pop({ animate: true })
        
    }
}
