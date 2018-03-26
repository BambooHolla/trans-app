import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';

import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import { FsProvider, FileType } from '../../providers/fs/fs';
import {
	WorkOrderServiceProvider,
	ContactType
} from '../../providers/work-order-service/work-order-service';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageTakerController } from '../../components/image-taker-controller';

@Component({
	selector: 'page-work-order-add',
	templateUrl: 'work-order-add.html'
})
export class WorkOrderAddPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public fs: FsProvider,
		public san: DomSanitizer,
		public imageTakerCtrl: ImageTakerController,
		public workOrderService: WorkOrderServiceProvider
	) {
		super(navCtrl, navParams);
	}

	formData = new FormGroup({
		realName: new FormControl('', [Validators.required]),
		phoneNumber: new FormControl('', [
			Validators.required,
			Validators.pattern(/^1[34578]\d{9}$/)
		]),
		email: new FormControl('', [Validators.required, Validators.email]),
		category: new FormControl('', [Validators.required]),
		detail: new FormControl('', [Validators.required]),
		files: new FormControl('', [Validators.required])
	});
	get realName() {
		return this.formData.get('realName');
	}
	get phoneNumber() {
		return this.formData.get('phoneNumber');
	}
	get email() {
		return this.formData.get('email');
	}
	get category() {
		return this.formData.get('category');
	}
	get detail() {
		return this.formData.get('detail');
	}
	get files() {
		return this.formData.get('files');
	}

	images = [
		{ name: '1', text: '', image: null, fid: '', uploading: false },
		{ name: '2', text: '', image: null, fid: '', uploading: false },
		{ name: '3', text: '', image: null, fid: '', uploading: false }
	];

	category_list = [
		{
			key: ContactType[ContactType.question],
			value: ContactType.question,
			text: '常见问题'
		},
		{
			key: ContactType[ContactType.advice],
			value: ContactType.advice,
			text: '意见反馈'
		}
	];

	//上传图片失败弹窗(modal->alert)
	describeModal(title,msg) {
		let modal = this.alertCtrl.create( {
			title: title,
			message: msg,
			buttons: [
				{
					text: '确定',
					handler: () => {
					
					}
				}]
		});
		modal.present();
	}

	upload(name) {
		
		const imageTaker = this.imageTakerCtrl.create(name);
		const fid_promise = this.fs.getImageUploaderId(FileType.工单图片);
		imageTaker.onDidDismiss(async (result, role) => {
			
			if( !result.err){
				if (role !== 'cancel' && result) {
					const image = this.images.find(
						item => item.name === result.name
					);
				// console.log('index: ', index, result);
			
					if (result.data) {
						// 开始上传
						await this.updateImage(fid_promise, image, result);
						const fids = this.images
							.map(img => img.fid)
							.filter(fid => fid);
						this.files.setValue(fids.join(' '));
					} else {
						image.image = 'assets/images/no-record.png';
					}
				}
				// console.log(this.images);
			}else {
				this.describeModal(result.err,result.msg)
			}
		});
		imageTaker.present();
	}

	@asyncCtrlGenerator.loading('图片上传中')
	@asyncCtrlGenerator.error('图片上传失败')
	async updateImage(
		fid_promise: Promise<any>,
		image: typeof WorkOrderAddPage.prototype.images[0],
		result: any
	) {
		image.uploading = true;
		try {
			const fid = await fid_promise;
			const result_data = result.data;
			const result_files = result.files;
			// const blob = this.dataURItoBlob(result_data);
			// const blob_url = URL.createObjectURL(blob);

			//上传图片，展示对应图片（本地的，因为上传到服务器的那个图片不能给外部访问）
			image.image = this.san.bypassSecurityTrustUrl(result_data);
			const upload_res = await this.fs.uploadImage(fid, result_files);
		
			console.log('upload_res', result);
			image.fid = fid;
		}catch (e){
			//上传图片失败，展示失败图片
			image.image = 'assets/images/no-record.png';
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
	@asyncCtrlGenerator.error('工单提交失败')
	@asyncCtrlGenerator.success('工单提交成功')
	submitForm() {
		return this.workOrderService.addWorkOrder({
			name: this.realName.value,
			phone: this.phoneNumber.value,
			email: this.email.value,
			type: this.category.value,
			content: this.detail.value,
			attachment: this.files.value.split(' ')
		}).then(()=>{
			this.finishJob(true)
		})
	}
}
