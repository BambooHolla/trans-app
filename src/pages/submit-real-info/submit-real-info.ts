import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
	IonicPage,
	NavController,
	NavParams,
	ViewController
} from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	AccountServiceProvider,
	CertificationCertificateType,
	CertificateType,
	CertificationPatternType,
	CertificationCollectType
} from '../../providers/account-service/account-service';
import { IdentificationNumberCheckerProvider } from '../../providers/identification-number-checker/identification-number-checker';
import { ImageTakerController } from '../../components/image-taker-controller';
import { FsProvider, FileType } from '../../providers/fs/fs';

@Component({
	selector: 'page-submit-real-info',
	templateUrl: 'submit-real-info.html'
})
export class SubmitRealInfoPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public accountService: AccountServiceProvider,
		public imageTakerCtrl: ImageTakerController,
		public fs: FsProvider,
		public idNumberChecker: IdentificationNumberCheckerProvider
	) {
		super(navCtrl, navParams);
	}

	certificate_type_list = [
		{ value: CertificateType.二代身份证, text: '二代身份证' },
		{ value: CertificateType.护照, text: '护照' }
	];
	formData = new FormGroup({
		IDnumber: new FormControl('', [
			Validators.required,
			(c => {
				if (!this.idNumberChecker.checkIdCardNo(c.value)) {
					return {
						wrongIdNumber: true
					};
				}
				return null;
			}).bind(this)
		]),
		realName: new FormControl('', [Validators.required]),
		IDtype: new FormControl('', [Validators.required])
	});
	get IDnumber() {
		return this.formData.get('IDnumber');
	}
	get realName() {
		return this.formData.get('realName');
	}
	get IDtype() {
		return this.formData.get('IDtype');
	}
	private images = [
		{ name: 'front', text: '正　面', image: null, fid: '', uploading: false },
		{ name: 'back', text: '反　面', image: null, fid: '', uploading: false }
	];

	upload(name) {
		const imageTaker = this.imageTakerCtrl.create(name);
		const fid_promise = this.fs.getImageUploaderId(FileType.身份证图片);
		imageTaker.onDidDismiss((result, role) => {
			if (role !== 'cancel' && result) {
				const image = this.images.find(
					item => item.name === result.name
				);
				// console.log('index: ', index, result);
				if (result.data) {
					// 开始上传
					this.updateImage(fid_promise, image, result);
				} else {
					image.image = 'assets/images/no-record.png';
				}
				// console.log(this.images);
			}
		});
		imageTaker.present();
	}

	@asyncCtrlGenerator.error('图片上传失败')
	async updateImage(
		fid_promise: Promise<any>,
		image: typeof SubmitRealInfoPage.prototype.images[0],
		result: any
	) {
		image.uploading = true;
		try {
			const fid = await fid_promise;
			const result_data = result.data;
			const blob = this.dataURItoBlob(result_data);
			const blob_url = URL.createObjectURL(blob);
			image.image = result_data;
			const upload_res = await this.fs.uploadImage(fid, blob);
			console.log('upload_res', upload_res);
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
		if (dataURI.split(',')[0].indexOf('base64') >= 0)
			byteString = atob(dataURI.split(',')[1]);
		else byteString = decodeURI(dataURI.split(',')[1]);

		// separate out the mime component
		var mimeString = dataURI
			.split(',')[0]
			.split(':')[1]
			.split(';')[0];

		// write the bytes of the string to a typed array
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		return new Blob([ia], { type: mimeString });
	}

	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('提交出错')
	@asyncCtrlGenerator.success('认证申请提交成功')
	submitForm() {
		const media = this.images.map(im => im.fid).filter(v => v);
		if (media.length !== this.images.length) {
			throw new Error('请上传证件');
		}
		const formVal = this.formData.getRawValue();
		return this.accountService
			.submitCertification({
				type: CertificationCertificateType.身份,
				category: formVal.IDtype,
				value: formVal.IDnumber,
				pattern: CertificationPatternType.人工审核,
				collectType: CertificationCollectType.证件照片,
				name: formVal.realName,
				media
			})
			.then(d => {
				this.finishJob(true);
				return d;
			});
	}
}
