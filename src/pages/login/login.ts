import { Component, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { IonicPage, NavController, AlertController, LoadingController } from 'ionic-angular';

import { LoginService } from '../../providers/login-service';
import { AppDataService } from '../../providers/app-data-service';
import { AppSettings } from '../../providers/app-settings';
/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private verticalCenter:boolean = true;
  private gridPaddingTop:string = '0';

  private logining:boolean = false;

  loginForm:FormGroup = new FormGroup ({
    // myContry: new FormControl('1002'),
    customerId: new FormControl({value: '', disabled: true}),
    password: new FormControl({value: '', disabled: true}),
    savePassword: new FormControl({value: false, disabled: true}),
  });

  errorMessages = {
    // myContry: {
    //   required: '请选择国家',
    // },
    customerId: {
      required: '请输入客户号',
      // minlength: '客户号不能少于 7 位数',
      // maxlength: '客户号不能多于 11 位数',
      disabled: true,
    },
    password: {
      required: '请输入用户密码',
      disabled: true,
    },
  };

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public elementRef: ElementRef,
    public loginService: LoginService,
    public appDataService: AppDataService,
    public appSettings: AppSettings,
  ) {
    // this.presentLoading();
    this.init();
  }

  ionViewDidLoad() {
    // function getComputedHeight(elem: HTMLElement): number{
    //   return parseFloat(window.getComputedStyle(elem).height);
    // }

    // const pageElem = <HTMLElement>this.elementRef.nativeElement;
    // const contentElem = <HTMLElement>pageElem.querySelector('ion-content');
    // const gridElem = <HTMLElement>contentElem.querySelector('ion-grid');
    // const window = pageElem.ownerDocument.defaultView;
    // const gridHeight = getComputedHeight(gridElem);
    // const contentHeight = getComputedHeight(contentElem);
    // const header = <HTMLElement>pageElem.querySelector('ion-header');

    // const span = Math.max(0, 
    //   Math.floor((contentHeight - gridHeight) / 2) -
    //     (header ? getComputedHeight(header) : 0)
    // );

    // this.verticalCenter = false;
    // this.gridPaddingTop = span + 'px';
  }

  async init(){
    const appDataService = this.appDataService;
    try {
      await appDataService.dataReady;

      const controls = this.loginForm.controls;

      for (const prop in controls){
        controls[prop].enable();
        if (prop in appDataService){
          // console.log(prop, appDataService[prop]);
          controls[prop].setValue(appDataService[prop]);
        }
      }
    } catch (err) {
       console.log(err.message);
    }
  }

  async login(){
    const controls = this.loginForm.controls;
    if (this.loginForm.invalid){
      for (const field in controls){
        const fieldControl = controls[field];
        if (fieldControl.invalid){
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
    const type = this.appSettings.accountType(customerId)

    this.logining = true;
    await this.loginService.doLogin(customerId, password, savePassword, type);
    this.logining = false;
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      // spinner: 'hide',
      content: '正在载入',
  //     content: `<div class="app-content-loading">
  //   <div class="fa-spinner-loading"></div>
  // </div>`,
      duration: 1000,
    });
    loader.present();
  }

  changeStatus(name){
    const controls = this.loginForm.controls;
    if (name in controls){
      // console.log(controls[name].value);
      controls[name].setValue(!controls[name].value);
    }
  }
}
