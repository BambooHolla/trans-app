import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { NavController, ToastController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Http, RequestOptions, Headers, URLSearchParams, RequestMethod } from '@angular/http';
import { AppSettings } from '../../providers/app-settings';
import { AppDataService } from '../../providers/app-data-service';
import { CreateAccountStepThirdPage } from '../create-account-step-third/create-account-step-third';
import { AppService } from '../../providers/app.service';

@Component({
    selector: 'page-create-account-step-first',
    templateUrl: 'create-account-step-first.html',
})
export class CreateAccountStepFirstPage implements AfterViewInit, OnDestroy {

    firstForm: FormGroup = new FormGroup({
        phone: new FormControl(),//'13696909947'),
        code: new FormControl(),//'111111'),
        password: new FormControl(),//'1'),
        passwordConfirm: new FormControl(),//'1'),
    });

    errorMessages = {
        phone: {
            required: '请输入电话',
            // minlength: '电话号码不能少于 7 位数',
            // maxlength: '电话号码不能多于 11 位数',
        },
        code: {
            required: '请输入验证码',
        },
        password: {
            required: '请输入用户密码',
        },
        passwordConfirm: {
            required: '确认密码',
        },
    };

    getCode$: Subscription

    @ViewChild('getCode') getCode

    constructor(
        public navCtrl: NavController,
        public toastCtrl: ToastController,
        private http: Http,
        private appSettings: AppSettings,
        public appDataService: AppDataService,
        private appService: AppService,    
    ) {

    };

    ngAfterViewInit() {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        // console.log(this.getCode)
        /**
         * <button ion-button outline item-end #getCode>获取验证码</button>
         * 被ion-button修饰的button会被ion包装,导致结构不对无法直接获取nativeElement,需要通过elementRef.nativeElement获取
         */
        const getCodeElement: HTMLElement = this.getCode.nativeElement || this.getCode._elementRef.nativeElement
        this.getCode$ = Observable.fromEvent(getCodeElement, 'click')
            .debounceTime(300)
            // .do()
            .subscribe((event: MouseEvent) => {
                getCodeElement.setAttribute('disabled', 'disabled')
                let timer
                const countDown = (count: number) => {
                    if (count <= 0) {
                        getCodeElement.textContent = `获取验证码`
                        getCodeElement.removeAttribute('disabled')
                        return false
                    }
                    getCodeElement.textContent = `${count}s后重试`
                    timer = setTimeout(() => {
                        countDown(--count)
                    }, 1e3);
                }
                countDown(60)
                //TODO: √ 若发送失败 应该直接终止倒计时.
                this.sendSMSCode()
                //TODO: 类型报错,先用any解决
                    .then((res:any) => {
                        // console.log(res)
                        // console.log(res.json())
                        const body = res.json() || JSON.parse(res._body)
                        const data = res.data ||body.data
                        if (data.message) {
                            this.toastAlert(data.message)
                        }
                    })
                    .catch(res => {
                        console.log(res)
                        const body = res.json() || JSON.parse(res._body)
                        const err = res.error || body.error
                        if (err.message) {
                            this.toastAlert(err.message)
                        }
                        clearTimeout(timer)
                        getCodeElement.textContent = `获取验证码`
                        getCodeElement.removeAttribute('disabled')
                    })
            })
    }

    ngOnDestroy() {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this.getCode$.unsubscribe()
    }

    caStepSecond(body: object) {
        //TODO:若注册号码和已登录号码一样?
        console.log('register')
        // const url = `${this.appSettings.SERVER_URL}/api/v1/bngj/user/register`
        const url = `/user/register`
        // const headers = new Headers({ 'Content-Type': 'application/json' });
        // headers.append('X-AUTH-TOKEN', this.appDataService.token);

        // const options = new RequestOptions({ headers: headers });

        // this.http.post(url, body, options)
        //     // .do(value => console.dir("1: " + value))
        //     .toPromise()
        //     .then(response => {
        //         // TODO:注册成功将返回的token保存成登陆状态
        //         console.log("register res: ", response)
        //         console.log("register body: ", body)
        //         console.log("register res.json(): ", response.json())

        //         // const resData = response.data || response._body.data
        //         const resData = response.json().data

        //         this.navCtrl.push(CreateAccountStepThirdPage, {
        //             body: body,
        //         });

        //         return resData
        //     })
        //     .catch((res) => {
        //         console.log(res.json())
        //         const body = res.json() || JSON.parse(res._body)
        //         const err = res.error || body.error
        //         if (err.message) {
        //             this.toastAlert(err.message)
        //         }
        //     })

        this.appService.request(RequestMethod.Post, url, body, false)
            .then(data => {
                console.log(data)
                //see the login-service dologin()
                if (data.token) {
                    this.appDataService.token = data.token
                }

                this.navCtrl.push(CreateAccountStepThirdPage, {
                    body: body,
                });
                return data
            })
            .catch((err)=>{
                console.log(err)
                if(err.message){
                    this.toastAlert(err.message)
                }
            })
        
    }

    doValidate() {
        //TODO:若注册过后,点击后退导航按钮退回的下一步直接进入进行开户?
        //TODO:输入时检查是否注册
        const controls = this.firstForm.controls;
        if (this.firstForm.invalid) {
            for (const field in controls) {
                const fieldControl = controls[field];
                if (fieldControl.invalid) {
                    const allMessages = [];
                    for (const key in fieldControl.errors) {
                        allMessages.push(this.errorMessages[field][key]);
                    }
                    return this.toastAlert(allMessages.join('\n'));
                }
            }
        }

        if (!this.queryHasMobile(controls.phone.value))
            return this.toastAlert('手机号码格式错误');

        // if (controls.code.value !== '111111') {
        //     return this.toastAlert('验证码错误！');
        // }

        if (controls.password.value !== controls.passwordConfirm.value) {
            return this.toastAlert('您两次输入的密码不相同！');
        }

        this.caStepSecond({
            //type:int 0表示邮箱,1表示手机
            type: this.appSettings.accountType(controls.phone.value),
            account: controls.phone.value,
            code: controls.code.value,
            password: controls.password.value,
        });
    }

    sendSMSCode() {
        const controls = this.firstForm.controls
        const phoneNumber = controls.phone.value
        if (phoneNumber !== '') {
            if (!this.queryHasMobile(phoneNumber))
                return Promise.reject({ error: { message: '手机号码格式错误' } });
        }

        let url = `${this.appSettings.SERVER_URL}/api/v1/bngj/user/sendSmsCode`

        const params = new URLSearchParams()
        //手机号
        params.append('telephone', phoneNumber)
        //发送类型 (101:发送到当前已登录客户 201:发送到指定客户,需要获取Phone参数)
        params.append('type', '201')

        const headers = new Headers()
        headers.append('X-AUTH-TOKEN', this.appDataService.token)
        headers.append('x-bnqkl-platform', this.appSettings.Platform_Type);

        return this.http.get(url, {
            search: params,
            headers: headers,
        })
            .toPromise()
    }

    checkPhone(str) {
        return /^1[34578]\d{9}$/.test(str)
    }

    toastAlert(message, duration = 3000, position = 'top') {
        let toast = this.toastCtrl.create({
            message,
            duration,
            position,
        });
        toast.present();
    }

    queryHasMobile(phoneNumber) {
        return /^1[34578]\d{9}$/.test(phoneNumber);
    }
}
