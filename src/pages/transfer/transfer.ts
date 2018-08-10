import { Component } from "@angular/core";
// import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, RequestOptions, Headers } from "@angular/http";
import { AppSettings } from "../../providers/app-settings";
import { AppDataService } from "../../providers/app-data-service";
import { PersonalDataService } from "../../providers/personal-data-service";
// import { Subscription } from "rxjs/Subscription";
import { PromptControlleService } from "../../providers/prompt-controlle-service";
@Component({
    selector: "page-transfer",
    templateUrl: "transfer.html",
})
export class TransferPage {
    transferType: number = 0; //转账类型,0为银行转交易所,1为交易所转银行
    transferTip: string = "建议充值100元以上";
    bankName: string = this.personalDateService.relatedBankAccount.bankName;
    cardNo: string = this.personalDateService.relatedBankAccount.cardNo;
    bankIconURL = this.personalDateService.relatedBankAccount.bankIconURL;
    password: string;
    transferCount: number;

    accountBalance = this.personalDateService.accountBalance;

    noBankAccount: boolean;

    constructor(
        // public navCtrl: NavController,
        // public navParams: NavParams,
        private http: Http,
        private personalDateService: PersonalDataService,
        private appSettings: AppSettings,
        private appDataService: AppDataService,
        private promptCtrl: PromptControlleService,
    ) {
        this.noBankAccount = this.cardNo === "000000000000000000";
    }

    ionViewDidLoad() {
        console.log("ionViewDidLoad TransferPage");
        console.log(this.transferType);
    }

    transferOut() {
        this.transferCount = undefined;
        this.transferTip = `可转余额${this.accountBalance}元`;
        this.transferType = 1;
        // this.getAccountBalance()
    }
    transferIn() {
        this.transferCount = undefined;
        this.transferTip = "建议充值100元以上";
        this.transferType = 0;
    }

    transferAllOut() {
        this.transferCount = this.accountBalance;
    }

    confirmTransfer() {
        const transferTarget =
            this.transferType === 0
                ? "tradBankToExchange"
                : this.transferType === 1
                    ? "tradExchangeToBank"
                    : "";
        const url = ``; //${this.appSettings.SERVER_URL}/api/v1/gjs/biz/accounts/${transferTarget}`
        const headers = new Headers({ "Content-Type": "application/json" });
        headers.append("X-AUTH-TOKEN", this.appDataService.token);
        headers.append("x-bnqkl-platform", this.appSettings.Platform_Type);

        const options = new RequestOptions({ headers: headers });

        let data = {
            transferAmount: this.transferCount,
            password: this.password,
            bankAccount: this.cardNo,
        };

        this.http
            .post(url, data, options)
            .debounceTime(400) //过滤重复提交,防抖
            .toPromise()
            .then(response => {
                // console.dir(response)
                // const resData = response.json().data
                const resData = response.json();

                console.log("resData: ", resData);

                if (resData.err) {
                    let toast = this.promptCtrl.toastCtrl({
                        message: `${resData.err.message}`,
                        duration: 3000,
                        position: "middle",
                    });
                    toast.present();
                    // console.log('resData.err: ',resData.err.message)
                } else if (resData.data.length) {
                    let toast = this.promptCtrl.toastCtrl({
                        message: `${resData.data[0].FID_MESSAGE}`,
                        duration: 3000,
                        position: "middle",
                    });
                    toast.present();

                    this.transferCount = undefined;
                    // console.dir('resData.data: ', resData.data[0].FID_CODE)
                } else {
                    console.log(response);
                }
            })
            .catch(error => {
                console.dir(error);
            });
    }
}
