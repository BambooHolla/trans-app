import { Component, ElementRef } from '@angular/core';
import { FormControl, FormGroup,Validators } from '@angular/forms';

import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  ModalController,
} from 'ionic-angular';

import { RegisterService } from '../../providers/register-service';
import { AppDataService } from '../../providers/app-data-service';
import { AppSettings } from '../../providers/app-settings';
import { IdentificationNumberCheckerProvider } from '../../providers/identification-number-checker/identification-number-checker';

import { InformationModal } from '../../modals/information-modal/information-modal';
import { PromptControlleService } from "../../providers/prompt-controlle-service";
/**
 * Generated class for the RegisterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {
  registerForm: FormGroup = new FormGroup({
    // myContry: new FormControl('1002'),
    customerId: new FormControl({ value: '', disabled: false }, [
      Validators.required,
      Validators.maxLength(256),
			(data => {
        this.check_sending_vcode = false;
        if(!data.value){
          this.check_sending_vcode = true;
          return null;
        }
				//如果用this.IDtye去获取，在这边会报错，get is not function
				if (!this.idNumberChecker.checkIphone(data.value)) {
          this.check_sending_vcode = true;
					return {
						wrongCustomerId: true
					};
        }
				return null;
			}).bind(this)
		]),
    vcode: new FormControl({ value: '', disabled: false },[Validators.required,Validators.maxLength(6)]),
    password: new FormControl({ value: '', disabled: false },[Validators.minLength(3),Validators.maxLength(64),Validators.required,this.validatePWDDStrength.bind(this,'password')]),
    confirPassword: new FormControl({ value: '', disabled: false },[Validators.required,Validators.maxLength(64),this.validatePWD.bind(this)]),
    protocolAgree: new FormControl({ value: true, disabled: false }),
    recommendCode: new FormControl({ value: '', disabled: false }),
  });
  get form_password(){
    return this.registerForm.get("password");
  }
  get form_customerId(){
    return this.registerForm.get("customerId");
  }
  get form_confirPassword(){
    return this.registerForm.get("confirPassword");
  }
  get form_vcode(){
    return this.registerForm.get("vcode");
  }
  validatePWD(){
    if(this.registerForm){
      const password  = this.registerForm.get("password").value;
      const confirPassword  = this.registerForm.get("confirPassword").value;
      return password!==confirPassword?{ confirmError: true } : null;
    }
  }

  validatePWDDStrength(pwdType){
		if (this.registerForm) {
			const password = this.registerForm.get(pwdType).value;
			if(!password) return null;
			//密码至少包含一个大写，一个小写，一个数字
			let pattern = new RegExp( /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{3,}$/);
			return pattern.test(password) ? null	 :  { strengthError: true };
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
  ) {
    // 
    // const rawVal = this.registerForm.getRawValue();
    // // console.log(navParams.get('raw'), navParams)
    // const customerId = navParams.get('raw').customerId//.get('customerId');
    // if (customerId) {
    //   rawVal.customerId = customerId;
    //   this.registerForm.setValue(rawVal);
    // }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
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
  blur_register_step1 = true;
  async register_step1() {
    if(!this.blur_register_step1) return;
    this.sending_vcode = true;
    try {
      if (!this.registerForm.get('customerId').value) {
        throw new RangeError('请填写手机号/邮箱');
      }
      await this.registerService.sendSMSCode( 
        this.registerForm.get('customerId').value,
        undefined,
        '1001',
      );

      this.tickResendTimeClock(); // 开始倒计时重新发送短信的按钮
    } catch (err) {
      this.alertCtrl
        .create({
          title: '警告',
          message: err.message || err,
          buttons: ['确认']
        })
        .present();
    } finally {
      this.sending_vcode = false;
    }
  }

  filterRegister() {
    const customerId = this.form_customerId.value;
    if( this.appSettings.accountType(customerId) === 0 &&  !this.appSettings.accountEmailProposal(customerId)){
      return this.alertCtrl.create({
        title:'警告',
        subTitle:'qq.com,163.com,sina.com',
        message:'为我们推荐注册的邮箱',
        buttons:[{
          text:'返回'
        },{
          text:'继续注册',
          cssClass:'alter-right-button', 
          handler:()=>{
            this.register()
          }
        }]
      }).present();
    }
    return this.register();
   
  }

  async register() {
    // 判断当然是否已经注册了 10 个 账户
    if( this.appDataService.getAppRegisterLength() > 10) {
      return this.alertCtrl.create({
        title:'警告',
        message:'每日注册账户不得超过10个',
        buttons:[{
          text:'确定'
        }]
      }).present();
    }
    this.registering = true;
    try {
      const controls = this.registerForm.getRawValue();

      const customerId = controls.customerId;
      const password = controls.password;
      const vcode = controls.vcode;
      const recommendCode = controls.recommendCode;
      // const timeZone = (-new Date().getTimezoneOffset() / 60).toString() || "8";
      // 旧的校验方式，现在以及在输入的时候检验
      // const type = this.appSettings.accountType(customerId)
      // if(type !== 0 && type !== 1){ 
      //   throw { message:'请使用中国大陆手机号码或电子邮箱地址注册'}
      // }
 
      this.registerService.doAuthRegister(customerId, vcode, password, recommendCode)
        .then(()=>{
          //注册成功，记录
          this.appDataService.setAppRegisterLength(customerId)

          const toast = this.promptCtrl.toastCtrl({
            message:'注册成功',
            duration:1e3,
            position:'middle',
          });
          toast.present();
          this.navCtrl.pop({animate:false})
            .then(this.navParams.get('dismissFn'));
        }).catch(err =>{
          //try -》 catch 捕获不到抛出的错误
          this.alertCtrl
          .create({
            title: '警告',
            message: err.message,
            buttons: ['确定']
          })
          .present();
        })
    } 
    // catch (err) {
     
    //   this.alertCtrl
    //     .create({
    //       title: '警告',
    //       message: err.message,
    //       buttons: ['确定']
    //     })
    //     .present();
    // } 
    finally {
      this.registering = false;
    }
  }

  showModal(agreementName = 'registAgreement') {
    console.log("获取语言",window["translate"].getBrowserCultureLang());
    if (agreementName in this.appSettings.agreementData) {
      const { title, agreementFirst } = this.appSettings.agreementData[agreementName];
      const informationModal = this.modalCtrl.create(InformationModal, {
        title,
        agreementFirst, 
      });
      informationModal.present();
    }
  }

  focusCustomerId(){
    this.blur_register_step1 = false;
  }

  registerCustomerId = false ;
  async checkRegister(){
    const controls = this.registerForm.getRawValue();
    const customerId = controls.customerId;
    if(!this.check_sending_vcode && customerId && !this.resend_time_clock){
      try {

        this.registerService.doCheckRegister(customerId)
        .then((data)=>{
          //账户不存在
          if(data.status == "error"){
            this.blur_register_step1 = true;
            this.registerCustomerId = false;
            this.register_step1()
          }
          //账户存在
          if(data.status == "ok"){
            this.registerCustomerId = true;
          }

        })
      } catch(err) {
        this.blur_register_step1 = true;
        console.log('register checkRegister',err)
      }
    }
    
  }

}
