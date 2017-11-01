import { Component, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';

import { LoginService } from '../../providers/login-service';
import { AppDataService } from '../../providers/app-data-service';
import { AppSettings } from '../../providers/app-settings';
/**
 * Generated class for the RegisterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  registerForm: FormGroup = new FormGroup({
    // myContry: new FormControl('1002'),
    customerId: new FormControl({ value: '', disabled: false }),
    vcode: new FormControl({ value: '', disabled: false }),
    password: new FormControl({ value: '', disabled: false }),
    confirPassword: new FormControl({ value: '', disabled: false }),
    protocolAgree: new FormControl({ value: true, disabled: false })
  });
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
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public elementRef: ElementRef,
    public loginService: LoginService,
    public appDataService: AppDataService,
    public appSettings: AppSettings,
  ) {

    const rawVal = this.registerForm.getRawValue();
    const customerId = navParams.get("customerId");
    if (customerId) {
      rawVal.customerId = customerId;
      this.registerForm.setValue(rawVal);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }
  registering = false

  errorMessages = {
    // myContry: {
    //   required: '请选择国家',
    // },
    customerId: {
      required: '请输入客户号',
      // minlength: '客户号不能少于 7 位数',
      // maxlength: '客户号不能多于 11 位数',
      disabled: true
    },
    password: {
      required: '请输入用户密码',
      disabled: true
    }
  };

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


  resend_time_clock = 0;
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
    // await doSomeThing()

    this.tickResendTimeClock(); // 开始倒计时重新发送短信的按钮
  }

  async register() {
    const controls = this.registerForm.controls;
    if (this.registerForm.invalid) {
      for (const field in controls) {
        const fieldControl = controls[field];
        if (fieldControl.invalid) {
          const allMessages = [];
          for (const key in fieldControl.errors) {
            allMessages.push(this.errorMessages[field][key]);
          }
          const alert = this.alertCtrl.create({
            title: '警告',
            message: allMessages.join('\n'),
            buttons: ['OK']
          });
          alert.present();
          return;
        }
      }
    }

    const customerId = controls['customerId'].value;
    const password = controls['password'].value;
    const savePassword = controls['savePassword'].value;
    const type = this.appSettings.accountType(customerId);

    this.registering = true;
    // await this.registerService.doregister(customerId, password, savePassword, type);
    this.registering = false;
  }

}
