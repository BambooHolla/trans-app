import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NavController, NavParams, ActionSheetController } from "ionic-angular";

import { SecondLevelPage } from "../../bnlc-framework/SecondLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
import { FsProvider, FileType } from "../../providers/fs/fs";
import {
    WorkOrderServiceProvider,
    ContactType,
} from "../../providers/work-order-service/work-order-service";
import { DomSanitizer } from "@angular/platform-browser";
import { ImageTakerController } from "../../components/image-taker-controller";
import { PromptControlleService } from "../../providers/prompt-controlle-service";
import { AppDataService } from "../../providers/app-data-service";
@Component({
    selector: "page-work-order-add",
    templateUrl: "work-order-add.html",
})
export class WorkOrderAddPage extends SecondLevelPage {
    private userLanguage: string = "zh";
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public fs: FsProvider,
        public san: DomSanitizer,
        public imageTakerCtrl: ImageTakerController,
        public workOrderService: WorkOrderServiceProvider,
        public promptCtrl: PromptControlleService,
        public actionsheetCtrl: ActionSheetController,
        public appDataService: AppDataService,
    ) {
        super(navCtrl, navParams);
        this.userLanguage = appDataService.LANGUAGE || "zh";
    }

    formData = new FormGroup({
        realName: new FormControl("", [Validators.required]),
        phoneNumber: new FormControl("", [
            Validators.pattern(/^1[34578]\d{9}$/),
        ]),
        email: new FormControl("", [
            //用正则匹配,如用Validators.email，获取焦点不填，在失去焦点会提示错误
            Validators.pattern(
                /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
            ),
        ]),
        category: new FormControl("", [Validators.required]),
        detail: new FormControl("", [
            Validators.required,
            this.getDetailLength.bind(this),
        ]),
        files: new FormControl("", []),
    });

    get realName() {
        return this.formData.get("realName");
    }
    get phoneNumber() {
        return this.formData.get("phoneNumber");
    }
    get email() {
        return this.formData.get("email");
    }
    get category() {
        return this.formData.get("category");
    }
    get detail() {
        return this.formData.get("detail");
    }
    get files() {
        return this.formData.get("files");
    }

    images = [
        { name: "1", text: "", image: null, fid: "", uploading: false },
        { name: "2", text: "", image: null, fid: "", uploading: false },
        { name: "3", text: "", image: null, fid: "", uploading: false },
    ];

    category_list = [
        {
            key: ContactType[ContactType.question],
            value: ContactType.question,
            text: window["language"]["FAQS"] || "常见问题",
        },
        {
            key: ContactType[ContactType.advice],
            value: ContactType.advice,
            text: window["language"]["FEEDBACKS"] || "意见反馈",
        },
    ];

    private detailContent: string = "";
    private detailLength: number = 0;
    //详情内容长度,ionic FormGroup自定义校验 bug不能在这使用this.detail.value去获取内容
    getDetailLength() {
        let length = 0;
        let contentLength = this.detailContent ? this.detailContent.length : 0;
        console.log(this.detailContent);
        for (let i = 0; i < contentLength; i++) {
            if (new RegExp(/[^\x00-\xff]/gi).test(this.detailContent[i])) {
                length += 2;
            } else {
                length += 1;
            }
        }
        this.detailLength = length;
    }

    public telOrEmail = true;
    requiredTelOrEmail() {
        const phoneNumber = this.formData.get("phoneNumber").value;
        const email = this.formData.get("email").value;
        this.telOrEmail = phoneNumber || email ? false : true;
    }

    //上传图片失败弹窗(modal->alert)
    describeModal(title, msg) {
        let modal = this.alertCtrl.create({
            title: title,
            message: msg,
            buttons: [
                {
                    text: window["language"]["COFIRM"] || "确定",
                    handler: () => {},
                },
            ],
        });
        modal.present();
    }

    upload(name) {
        // const imageTaker = this.imageTakerCtrl.create(name);
        // const fid_promise = this.fs.getImageUploaderId(FileType.工单图片);
        // imageTaker.onDidDismiss(async (result, role) => {

        // 	if (role !== 'cancel' && result) {
        // 		const image = this.images.find(
        // 			item => item.name === result.name
        // 		);
        // 	// console.log('index: ', index, result);

        // 		if (result.data) {
        // 			// 开始上传
        // 			await this.updateImage(fid_promise, image, result);
        // 			const fids = this.images
        // 				.map(img => img.fid)
        // 				.filter(fid => fid);
        // 			this.files.setValue(fids.join(' '));
        // 		}
        // 		// 隐藏没选图片的情况，这个图片提示用于图片上传失败
        // 		// else {
        // 		// 	image.image = 'assets/images/no-record.png';
        // 		// }
        // 	}
        // 	// console.log(this.images);

        // });
        // imageTaker.present();

        const imageTaker = this.promptCtrl.imageTakerCtrl(name);
        const fid_promise = this.fs.getImageUploaderId(FileType.工单图片);
        imageTaker.onDidDismiss(async (result, role) => {
            console.log(result);

            if (role !== "cancel" && result) {
                const image = this.images.find(
                    item => item.name === result.name,
                );
                // console.log('index: ', index, result);

                if (result.data) {
                    // 开始上传
                    await this.updateImage(fid_promise, image, result);
                    const fids = this.images
                        .map(img => img.fid)
                        .filter(fid => fid);
                    this.files.setValue(fids.join(" "));
                }
                // 隐藏没选图片的情况，这个图片提示用于图片上传失败
                // else {
                // 	image.image = 'assets/images/no-record.png';
                // }
            }
            // console.log(this.images);
        });
        imageTaker.present();
    }


    @asyncCtrlGenerator.loading("@@UPLOAD_PHOTO") 
    @asyncCtrlGenerator.error("@@UPLOAD_PHOTO_FAIL") 
    async updateImage(
        fid_promise: Promise<any>,
        image: typeof WorkOrderAddPage.prototype.images[0],
        result: any,
    ) {
        image.uploading = true;
        try {
            const fid = await fid_promise;
            const result_data = result.data;

            // const blob = this.dataURItoBlob(result_data);
            // const blob_url = URL.createObjectURL(blob);
            // image.image = this.san.bypassSecurityTrustUrl(result_data);
            // const upload_res = await this.fs.uploadImage(fid, blob);
            // image.fid = fid;

            const blob = await this.minImage(result_data);
            const blob_url = URL.createObjectURL(blob);
            image.image = this.san.bypassSecurityTrustUrl(blob_url);
            const upload_res = await this.fs.uploadImage(fid, blob);
            image.fid = fid;
        } catch (e) {
            //上传图片失败，展示失败图片
            image.image = "assets/images/no-record.png";
            return Promise.reject(window["language"]["REQUEST_OVERTIME"]);
        } finally {
            image.uploading = false;
        }
    }

    async minImage(url) {
        //压缩
        const canvas = document.createElement("canvas");
        const maxSize = 1000;

        const ctx = canvas.getContext("2d");
        const image = new Image();
        image.src = url;
        return new Promise<Blob>((resolve, reject) => {
            image.onload = () => {
                try {
                    const { width, height } = image;
                    const max_WH = Math.max(width, height);
                    if (max_WH < maxSize) {
                        canvas.width = image.width;
                        canvas.height = image.height;
                    }
                    if (width === max_WH) {
                        image.width = canvas.width = maxSize;
                        image.height = canvas.height =
                            (height / width) * maxSize;
                    } else {
                        image.height = canvas.height = maxSize;
                        image.width = canvas.width = (width / height) * maxSize;
                    }
                    console.log(canvas.width, canvas.height);

                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    // ios  canvas.toBolo not function
                    // canvas.toBlob(resolve);
                    this.canvasToBlob(canvas, resolve);
                } catch (err) {
                    reject(err);
                }
            };
            image.onerror = reject;
        });
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
    @asyncCtrlGenerator.loading()
    @asyncCtrlGenerator.error("@@SUBMIT_WORK_ORDER_FAIL") 
    @asyncCtrlGenerator.success("@@SUBMIT_WORK_ORDER_SUCCESSFULLY") 
    submitForm() {
        if (this.telOrEmail) {
            return Promise.reject(
                window["EITHER_TELEPHONE_NUMBER_OR_EMAIL"] ||
                    "电话和邮箱至少填写一个",
            );
        }
        if (this.detailLength > 64) {
            return Promise.reject(
                window["DESCRIPTION_LENGTH_IS_BEYOND"] ||
                    "描述内容字数超出限制",
            );
        }
        return this.workOrderService
            .addWorkOrder({
                name: this.realName.value,
                phone: this.phoneNumber.value,
                email: this.email.value,
                type: this.category.value,
                content: this.detail.value,
                attachment: this.files.value.split(" "),
            })
            .then(() => {
                this.finishJob(true);
            });
    }

    canvasToBlob(canvas, cb) {
        cb(this.dataURLToBlob(this.canvasToDataURL(canvas)));
    }

    canvasToDataURL(canvas, format?, quality?) {
        return canvas.toDataURL(format || "image/jpeg", quality || 1.0);
    }

    dataURLToBlob(dataurl) {
        let arr = dataurl.split(",");
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }
}
