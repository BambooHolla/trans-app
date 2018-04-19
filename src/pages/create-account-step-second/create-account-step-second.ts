import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { NavController, NavParams } from 'ionic-angular';

import { CreateAccountConfirmPage } from "../create-account-confirm/create-account-confirm";
import { RequestOptions, Headers, Http } from '@angular/http';
import { AppDataService } from '../../providers/app-data-service';
import { AppSettings } from '../../providers/app-settings';
import { PromptControlleService } from "../../providers/prompt-controlle-service";
@Component({
    selector: 'page-create-account-step-second',
    templateUrl: 'create-account-step-second.html',
    // template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class CreateAccountStepSecondPage {
    secondForm: FormGroup = new FormGroup({
        name: new FormControl('abc'),
        // member: new FormControl('1'),
        email: new FormControl('315236946@qq.com'),
        bankNumber: new FormControl('6217001930022739297'),
        bank: new FormControl('1')
    });
    errorMessages = {
        name: {
            required: '请输入申请人姓名',
        },
        // member: {
        //     required: '请输入经纪会员',
        // },
        email: {
            required: '请输入电子邮箱',
        },

    };

    bankNameFromValue = {
        '1': '中国建设银行',
        '3': '平安银行',
    }

    constructor(
        public navCtrl: NavController,
        public promptCtrl: PromptControlleService,
        public navParams: NavParams,
        private appSettings: AppSettings,
        private appDataService: AppDataService,
        private http: Http,
    ) { };
    caStepThird(body:object) {
        //TODO: 先确认协议再提交申请
        const url = `${this.appSettings.SERVER_URL}/api/v1/bngj/account/accounts/create`
        const headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('X-AUTH-TOKEN', this.appDataService.token);
        headers.append('x-bnqkl-platform', this.appSettings.Platform_Type);

        const options = new RequestOptions({ headers: headers });

        this.http.post(url, body, options)
            // .do(value => console.dir("1: " + value))
            .toPromise()
            .then(response => {
                try {
                    if (response.json().data.accountId !== "") {
                        this.toastAlert('开户申请已经提交！')                        
                        this.navCtrl.push(CreateAccountConfirmPage)                        
                    }
                } catch (error) {
                    console.log('Account try error: ', error)
                    console.log('Account response: ', response)
                    this.toastAlert('请检查输入信息！')
                }
            })
            .catch(response => {
                try {
                    if (response.json().error.message !== "") {
                        this.toastAlert(`${response.json().error.message}！`)
                    } else {
                        this.toastAlert(`未知错误,请联系管理员！`)
                    }
                    console.log('Account catch: ', response)
                } catch (error) {
                    console.log('Account catch try: ', error)
                    console.log('Account catch: ', response)
                    this.toastAlert(`请求错误,请稍后重试！`)
                }
            })
    };
    doValidate() {
        const controls = this.secondForm.controls;
        console.log(controls.bankNumber.value);

        if (this.secondForm.invalid) {
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

        if (controls.name.value !== 'abc') {
            return this.toastAlert('申请人姓名错误！');
        }


        if (controls.bank.value === '1' && controls.bankNumber.value == '') {
            return this.toastAlert("请输入银行卡号");
        }
        if (controls.bank.value === '1' && controls.bankNumber.value != '') {

            let bankCard = controls.bankNumber.value;
            if (!this.luhmCheck(bankCard)) {
                return this.toastAlert('卡号格式错误！');
            }
        }
        if (controls.bank.value === '1' && controls.bankNumber.value != '') {
            let bankCard = controls.bankNumber.value;
            if (!this.luhmCheck(bankCard)) {
                return this.toastAlert('卡号格式错误！');
            }
        }
        if (controls.email.value != '') {
            // isDev=true;
            // $("#bankNumber ion-input").required;
            // let bankCard = $("#bankNumber ion-input").val().trim();
            let emailValue = controls.email.value;
            if (!this.queryHasEmail(emailValue)) {
                return this.toastAlert('电子邮件格式错误！');
            }
        }

        // const lastBody = this.navParams.get('body')

        this.caStepThird(Object.assign({
            name: controls.name.value,
            // member: controls.member.value,
            email: controls.email.value,
            bank: this.bankNameFromValue[controls.bank.value],
            bankNumber: controls.bankNumber.value,
        }))//, lastBody));
    }


    toastAlert(message, duration = 3000, position = 'top') {
        let toast = this.promptCtrl.toastCtrl({
            message,
            duration,
            position,
        });

        toast.present();
    }

    luhmCheck(e: string) {
        if (!/^\d+$/.test(e)) {
            return false
        }
        if (e.length !== 16 && e.length !== 19) {
            return false
        }
        var x = e.slice(-1);
        // [...e] 在某些应用场景下会报错。
        // const A = [...e].reverse().slice(1);
        const A = Array.from(e.slice(0, -1)).reverse();
        var s = [];
        var a = [];
        var g = [];
        for (var v = 0; v < A.length; v++) {
            const num = +A[v];
            if (v % 2 == 0) {
                if (num < 5) {
                    s.push(num * 2)
                } else {
                    a.push(num * 2)
                }
            } else {
                g.push(num)
            }
        }
        var d = [];
        var c = [];
        for (var y = 0; y < a.length; y++) {
            d.push(a[y] % 10);
            c.push(Math.floor(a[y] / 10));
        }
        const sum = (a, b) => a + b;
        var z = s.reduce(sum);
        var u = g.reduce(sum);
        var l = d.reduce(sum);
        var f = c.reduce(sum);
        var total = z + u + l + f;
        var t = total % 10 || 10;
        var B = 10 - t;

        return +x === B;
    }
    queryHasEmail(emailValue) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailValue);
    }

}