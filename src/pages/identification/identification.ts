import { Component } from "@angular/core";
// import { FormControl, FormGroup } from '@angular/forms';
import {
    Platform,
    ActionSheetController,
    ModalController,
    NavController,
    NavParams,
    ViewController,
} from "ionic-angular";
import { SecondLevelPage } from "../../bnlc-framework/SecondLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";

// import { CreateAccountConfirmPage } from '../create-account-confirm/create-account-confirm';
// import { CreateAccountStepThirdPage } from '../create-account-step-third/create-account-step-third';

// import { CameraModal } from "../../modals/camera/camera";

import { ImageTakerController } from "../../components/image-taker-controller";
// import { ImageTaker } from "../../components/image-taker-controller";
import { FsProvider, FileType } from "../../providers/fs/fs";
import { AccountServiceProvider } from "../../providers/account-service/account-service";

@Component({
    selector: "page-identification",
    templateUrl: "identification.html",
    // template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class IdentificationPage extends SecondLevelPage {
    private images = [
        {
            name: "front",
            text: "正　面",
            image: null,
            fid: "",
            uploading: false,
        },
        {
            name: "back",
            text: "反　面",
            image: null,
            fid: "",
            uploading: false,
        },
    ];

    constructor(
        public platform: Platform,
        public actionsheetCtrl: ActionSheetController,
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public imageTakerCtrl: ImageTakerController,
        public fs: FsProvider,
        public accountService: AccountServiceProvider,
    ) {
        super(navCtrl, navParams);
    }

    get canSubmit() {
        return this.images.every(img => {
            return !img.uploading && !!img.fid;
        });
    }
    @asyncCtrlGenerator.loading()
    @asyncCtrlGenerator.error("身份证提交失败")
    async submitPhoto() {
        // await this.accountService.submitCertification()
        const result = {};
        this.images.forEach(({ name, image, fid }) => {
            result[name] = fid;
        });
        this.viewCtrl.dismiss(result);
    }
    // caConfirm(){
    //     this.navCtrl.push(CreateAccountConfirmPage);
    // };

    cancelSubmit() {
        //TOConfirm: 不传照片数据
        this.viewCtrl.dismiss();
    }

    upload(name) {
        const imageTaker = this.imageTakerCtrl.create(name);
        const fid_promise = this.fs.getImageUploaderId(FileType.身份证图片);
        imageTaker.onDidDismiss((result, role) => {
            if (role !== "cancel" && result) {
                const image = this.images.find(
                    item => item.name === result.name,
                );
                // console.log('index: ', index, result);
                if (result.data) {
                    // 开始上传
                    this.updateImage(fid_promise, image, result);
                } else {
                    image.image = "assets/images/no-record.png";
                }
                // console.log(this.images);
            }
        });
        imageTaker.present();
    }

    @asyncCtrlGenerator.error("图片上传失败")
    async updateImage(
        fid_promise: Promise<any>,
        image: typeof IdentificationPage.prototype.images[0],
        result: any,
    ) {
        image.uploading = true;
        try {
            const fid = await fid_promise;
            const result_data = result.data;
            const blob = this.dataURItoBlob(result_data);
            const blob_url = URL.createObjectURL(blob);
            image.image = result_data;
            const upload_res = await this.fs.uploadImage(fid, blob);
            console.log("upload_res", upload_res);
            if (image.image === result_data) {
                image.fid = fid;
            }
        } finally {
            image.uploading = false;
        }
    }

    dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(",")[0].indexOf("base64") >= 0)
            byteString = atob(dataURI.split(",")[1]);
        else byteString = decodeURI(dataURI.split(",")[1]);

        // separate out the mime component
        var mimeString = dataURI
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], { type: mimeString });
    }
}
