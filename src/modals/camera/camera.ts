import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ViewController, NavParams } from 'ionic-angular';

// import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@ionic-native/camera-preview';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions } from '@ionic-native/camera-preview';
// import { Diagnostic } from 'ionic-native';

import { Gesture } from 'ionic-angular/gestures/gesture';

import * as Rx from 'rxjs/Rx';

import { KeyboardService } from '../../providers/keyboard-service';

@Component({
    selector: 'modal-camera',
    templateUrl: 'camera.html'
})
export class CameraModal {

    cameraActive: boolean = true;

    pictureValid: boolean = false;
    picture: string;

    pressGesture: Gesture;

    @ViewChild('scroller') scrollerRef;

    imageScale:number = 1;
    scaleBase:number = 1;

    translateX:number = 0;
    translateY:number = 0;
    panning:boolean = false;
    baseX:number = 0;
    baseY:number = 0;

    constructor(
        private viewCtrl: ViewController,
        private cameraPreview: CameraPreview,
        private sanitizer: DomSanitizer,
        params: NavParams,
        public keyboardService: KeyboardService,
    ) {

    }

    ngOnInit() {
        console.log('camera start');
        this.startCamera();

        // console.log(this.scrollerRef);

        // this.initGestureListener();
    }

    initGestureListener(){
        this.pressGesture = new Gesture(this.scrollerRef._scrollContent.nativeElement);
        this.pressGesture.listen();

        // const gestureOn = Rx.Observable.bindCallback(this.pressGesture.on);

        // const pinch$ = gestureOn('pinch');
        // pinch$
        Rx.Observable.fromEvent(this.pressGesture, 'pinch')
            .map(e => {
                const { additionalEvent, eventType, scale } = e as any;
                return { additionalEvent, eventType, scale };
            })
            .subscribe(e => {
                // console.log(e);
                if (e.eventType === 1) {
                    // pinch 事件开始（结束为 4 ）
                    this.scaleBase = this.imageScale;
                } else if (e.eventType === 2) {
                    this.imageScale = Math.min(3, Math.max(0.5, e.scale * this.scaleBase));
                }
            })
        // this.pressGesture.on('pinch', e => {
        //     // this.longPress.emit(e);
        //     console.log('pinch: ', e);
        //     if (e.eventType === 1){
        //         // pinch 事件开始（结束为 4 ）
        //         scaleBase = this.imageScale;
        //     } else if (e.eventType === 2){
        //         this.imageScale = Math.min(3, Math.max(0.5, e.scale * scaleBase));
        //     }

        //     // switch (e.additionalEvent) {
        //     //     case 'pinchout':
        //     //         this.imageScale = Math.min(3, this.imageScale + 0.05);
        //     //         break;
        //     //     case 'pinchin':
        //     //         this.imageScale = Math.max(0.5, this.imageScale - 0.05);
        //     //         break;
        //     // }
        // })

        Rx.Observable.fromEvent(this.pressGesture, 'pan')
            .map(e => {
                const { additionalEvent, eventType, deltaX, deltaY } = e as any;
                return { additionalEvent, eventType, deltaX, deltaY };
            })
            .subscribe(e => {
                console.log(e);

                if (!this.panning) {
                    this.panning = true;
                    this.baseX = this.translateX;
                    this.baseY = this.translateY;
                }

                this.translateX = this.baseX + e.deltaX;
                this.translateY = this.baseY + e.deltaY;

                // eventType 为 4 代表 pan 操作结束
                this.panning = e.eventType !== 4;

                // this.translateX += e.deltaX;
                // this.translateY += e.deltaY;

                // if (e.eventType === 1){
                //     // pinch 事件开始（结束为 4 ）
                //     scaleBase = this.imageScale;
                // } else if (e.eventType === 2){
                //     this.imageScale = Math.min(3, Math.max(0.5, e.scale * scaleBase));
                // }
            })
    }

    startCamera() {
        const cameraPreviewOpts: CameraPreviewOptions = {
            x: 0,
            y: 0,
            width: window.screen.width,
            height: (this.keyboardService.fullHeight || window.screen.height) - 58,
            camera: 'rear',
            tapPhoto: false,
            previewDrag: false,
            toBack: false,
            alpha: 1
        };
        
        // start camera
        this.cameraPreview.startCamera(cameraPreviewOpts).then(
            (res) => {
                console.log('res: ', res);
                this.cameraActive = true;
            },
            (err) => {
                console.log('err: ', err)
            }
        );
    }

    takePicture() {
        if (this.cameraActive) {
            // picture options
            const pictureOpts: CameraPreviewPictureOptions = {
                width: 1000,
                height: 1000,
                quality: 85,
            }  

            // take a picture
            this.cameraPreview.takePicture(pictureOpts).then((imageData) => {
                this.initParams();
                this.picture = 'data:image/jpeg;base64,' + imageData;
                this.cameraPreview.stopCamera();
                this.cameraActive = false;
                this.pictureValid = true;
                this.imageScale = 1;
            }, (err) => {
                console.log(err);
                this.pictureValid = false;
                // this.picture = 'assets/images/no-record.png';
            });
        } else {
            this.startCamera();
        }
    }
  
    changeEffect() {
        // Create an array with 5 effects
        // let effects: any = ['none', 'negative','mono', 'aqua', 'sepia'];
     
        // let randomEffect: string = effects[Math.floor(
        //                             Math.random() * effects.length)];
        // CameraPreview.setColorEffect(randomEffect);
    }
  
    checkPermissions() {
        // More code goes here
        // Diagnostic.isCameraAuthorized()
  
        // Diagnostic.isCameraAuthorized().then((authorized) => {
        //     if(authorized)
        //         this.initializePreview();
        //     else {
        //         Diagnostic.requestCameraAuthorization().then((status) => {
        //             if(status == Diagnostic.permissionStatus.GRANTED)
        //                 this.initializePreview();
        //             else {
        //                 // Permissions not granted
        //                 // Therefore, create and present toast
        //                 this.toastCtrl.create(
        //                     {
        //                         message: "Cannot access camera", 
        //                         position: "bottom",
        //                         duration: 5000
        //                     }
        //                 ).present();
        //             }
        //         });
        //     }
        // });
    }

    usePicture() {
        if (this.pictureValid){
            this.exit(this.picture);
        } else {
            this.exit(null);
        }
    }
  
    close() {
        this.exit(null);
    }

    exit(data) {
        this.cameraPreview.stopCamera()
            .catch(err => console.log(err))
            .then(() => {
                this.cameraActive = false;

                if (this.pressGesture) {
                    this.pressGesture.unlisten();
                    this.pressGesture.destroy();
                }

                this.viewCtrl.dismiss(data);
            });
    }

    getAllTransform(){
        return this.sanitizer.bypassSecurityTrustStyle(
            `translate(${this.translateX}px, ${this.translateY}px) scale(${this.imageScale})`
        );
    }

    initParams(){
        this.imageScale = 1;
        this.scaleBase = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.panning = false;
        this.baseX = 0;
        this.baseY = 0;
    }
}
