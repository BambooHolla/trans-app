import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
	IonicPage,
	NavController,
	NavParams,
	ViewController,
	AlertController,
	TextInput
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
import { CommonAlert } from "../../components/common-alert/common-alert";
import { DomSanitizer } from '@angular/platform-browser';
import {AppSettingProvider} from "../../bnlc-framework/providers/app-setting/app-setting"

@Component({
	selector: 'page-submit-real-info',
	templateUrl: 'submit-real-info.html'
})
export class SubmitRealInfoPage extends SecondLevelPage {
	@ViewChild('selectIDtype') selectIDtype:ElementRef;
	@ViewChild('typeIDnumber') typeIDnumber:ElementRef;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public accountService: AccountServiceProvider,
		public imageTakerCtrl: ImageTakerController,
		public fs: FsProvider,
		public alertCtrl: AlertController,
		public idNumberChecker: IdentificationNumberCheckerProvider,
		public san: DomSanitizer,
		public appSetting:AppSettingProvider
	) { 
		super(navCtrl, navParams);
	}

	certificate_type_list = [
		{ value: CertificateType.二代身份证, text: '二代身份证' },
		{ value: CertificateType.护照, text: '护照' }
	];
	
	checkIDtype = CertificateType.二代身份证;

	formData = new FormGroup({
		IDnumber: new FormControl('', [
			Validators.required,
			(c => {
				
				if (this.checkIDtype == CertificateType.二代身份证 && !this.idNumberChecker.checkIdCardNo(c.value)) {
					
					return {
						wrongIdNumber: true
					};
				}

				if(this.checkIDtype == CertificateType.护照 && !this.idNumberChecker.checkPassport(c.value)){
					
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
	get serverUrl(){
		return this.appSetting.APP_URL('file/read/')
	}
	private images = [
		{ name: 'front', text: '正 面', image: null, fid: '', uploading: false },
		{ name: 'back', text: '反 面', image: null, fid: '', uploading: false }
	];



	//上传图片失败弹窗(modal->alert)
	describeModal(title,msg) {
		let modal = this.alertCtrl.create( {
			title: title,
			message: msg,
			buttons: [
				{
					text: '确定',
					handler: () => {}
				}]
		});
		modal.present();
	  }

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

				} 
				// 隐藏没选图片的情况，这个图片提示用于图片上传失败
				// else {
				// 	image.image = 'assets/images/no-record.png';
				// }
				// console.log(this.images);
			}
			
		});
		imageTaker.present();
	}
	@asyncCtrlGenerator.loading('图片上传中')
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
			const blob = await this.minImage(result_data);
			const blob_url = URL.createObjectURL(blob);
			image.image = this.san.bypassSecurityTrustUrl(blob_url);
			const upload_res = await this.fs.uploadImage(fid, blob);
			image.fid = fid;
		}catch (e){
			//上传图片失败，展示失败图片
			console.log('图片上传失败',e)
			image.image = 'assets/images/no-record.png';
		} finally {
			image.uploading = false;
		}
	}

	async dataURItoBlob(dataURI) {
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
		let media = this.images.map(im => im.fid).filter(v => v);
		if (media.length !== this.images.length) {
			throw new Error('请上传证件');
		}
		media = [media.join('|')]
		console.log('0',CertificationCertificateType.身份)
		console.log('1',this.formData.getRawValue().IDtype)
		console.log('2',this.formData.getRawValue().IDnumber)
		console.log('3',CertificationPatternType.人工审核)
		console.log('4',CertificationCollectType.证件照片)
		console.log('5', this.formData.getRawValue().realName)
		console.log('6',media)
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

	inputText(ele:TextInput){
		ele.type = "text";
	}

	inputNumber(ele:TextInput){
		ele.type = "email";	
	}
	getIDtype(){
		//获取证件类型，进行校验判断，并情况证件号码
		this.checkIDtype = this.IDtype.value;
		this.typeIDnumber.nativeElement.value = '';
	}	

	async minImage(url) { //压缩
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
						resolve(this.dataURItoBlob(url))
					}
					if (width === max_WH) {
						image.width = canvas.width = maxSize;
						image.height = canvas.height = height / width * maxSize;
					} else {
						image.height = canvas.height = maxSize;
						image.width = canvas.width = width / height * maxSize;
					}
					console.log(canvas.width, canvas.height)

					ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
					// ios  canvas.toBolo not function
					// canvas.toBlob(resolve);
					this.canvasToBlob(canvas,resolve)
				} catch (err) { reject(err) }
			}
			image.onerror = reject
		})
	}

	canvasToBlob(canvas, cb){
		cb(this.dataURLToBlob(this.canvasToDataURL(canvas)));
	}

	canvasToDataURL(canvas, format?, quality?){
		return canvas.toDataURL(format||'image/jpeg', quality||1.0);
	}

	dataURLToBlob(dataurl){
		let arr = dataurl.split(',');
		let mime = arr[0].match(/:(.*?);/)[1];
		let bstr = atob(arr[1]);
		let n = bstr.length;
		let u8arr = new Uint8Array(n);
		while(n--){
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], {type:mime});
	}
}