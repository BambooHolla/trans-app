import {Component, ElementRef, ViewChild, Renderer2} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController, Events, Platform, AlertController} from 'ionic-angular';
import {Storage} from "@ionic/storage";
import { TabsPage } from '../tabs/tabs';
import { PicassoApp } from '../../app/app.component';
import { FLP_Tool } from '../../bnlc-framework/FLP_Tool';



export class Point {
  x: number;
  y: number;
  index?: number;
}
export class TipSelectPoint {
  value: Point;
  select: boolean;
}
export class GestureLockObj {
  password: string;
  chooseType: number;
  step: number;

  constructor() {
    this.chooseType = 3;
    this.step = 0;
  }
}

export class GestureAttemptObj {
  lockDate: number;
  lastAttemptDate: number;
  attemptsNu: number;

  constructor() {
    this.attemptsNu = 3;
  }
 
}


@IonicPage()
@Component({
  selector: 'page-gesture-lock',
  templateUrl: 'gesture-lock.html',
})
export class GestureLockPage {
    @FLP_Tool.FromGlobal picassoApp!: PicassoApp;
  height = Math.floor((window.innerHeight*0.7)) || 320;
  width = Math.floor((window.innerWidth)) || 320;
  chooseType = 3;
  devicePixelRatio; // 设备密度
  titleMes = "GESTURE_UNLOCK";
  titleMes_supplement = '';
  titleMes_number:any = '';
  unSelectedColor = '#666159';
  selectedColor = '#666159';
  // successColor = '#C1B17F';
  errorColor = '#d54e20';
  tipColor = "#999999";
  lockTimeUnit = 60; //尝试失败后锁定多少秒
  gestureLockObj: GestureLockObj = new GestureLockObj(); //密码本地缓存
  gestureAttemptObj: GestureAttemptObj = new GestureAttemptObj();  //尝试日期和次数本地缓存
  unregisterBackButton:any;// 硬件返回
  firstPassword: string;
  showDelete:boolean = false;
  private hasGestureLock:boolean = false;// 是否设置
  private canTouch = false;
  private radius: number; //小圆点半径

  private tipPoint: Array<TipSelectPoint> = [];

  private allPointArray: Point[] = [];
  private unSelectedPointArray: Point[] = [];
  private selectedPointArray: Point[] = [];
  private ctx;

  private lockTime = this.lockTimeUnit;

  _is_gesture_lock: boolean = false;

  @ViewChild('canvas') canvas: ElementRef;
  textColor = this.tipColor;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private render: Renderer2,
    private storage: Storage,
    private viewCtrl: ViewController,
    public events: Events,
    public platform: Platform,
    public alterCtrl: AlertController,
  ) {
  }

  async ngOnInit() {
    this.height = this.width = this.height > this.width ? this.width : this.height;
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.radius = this.width * this.devicePixelRatio / (1 + 2 * this.chooseType) / 2; // 半径计算
    this.canvas.nativeElement.height = this.height * this.devicePixelRatio;
    this.canvas.nativeElement.width = this.width * this.devicePixelRatio;
    this.ctx = this.canvas.nativeElement.getContext('2d');

    this.initPointArray();
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawCircles(this.allPointArray);
    this.bindEvent();

    await this.storage.get('gestureLockObj').then(data => {
      if (data) {
        this.gestureLockObj = data;
      }
    });

    await this.storage.get('gestureAttemptObj').then(data => {
      if (data) {
        this.gestureAttemptObj = data;
        if (this.gestureAttemptObj.attemptsNu === 0) {
          const now = Date.now();
          const last =this.gestureAttemptObj.lockDate;
          const secend = (now - last) / 1000 - this.lockTimeUnit;
          if (secend < 0) {
            this.setInteralFun( Math.abs(Math.ceil(secend)) );
          } else { 
            this.gestureAttemptObj = new GestureAttemptObj();
            this.storage.set("gestureAttemptObj", this.gestureAttemptObj);
          }
        }
      }
    });
    this.hasGestureLock = await this.navParams.get('hasGestureLock');
    // 新登入
    this._is_gesture_lock = await  this.storage.get("gestureLockObj")
    if(this.hasGestureLock) {
      this.resetPasswordFun();
    }
    if( this.hasGestureLock != false && this.hasGestureLock != true && !this.unregisterBackButton && !!this._is_gesture_lock) {
      // 打开app解锁，屏蔽
      this.unregisterBackButton = this.platform.registerBackButtonAction(
        () => {
           
        },
      ); 
      this.gestureLockObj.step = 2;
      this.titleMes = "GESTURE_UNLOCK";
    }
    if (this.gestureLockObj.step === 0) {
      this.titleMes = "GESTURE_DRAW";
    }
  }
  ionViewDidEnter() {
    if( this.hasGestureLock != false && this.hasGestureLock != true && !this.unregisterBackButton) {
      // 打开app解锁，屏蔽
      this.unregisterBackButton = this.platform.registerBackButtonAction(
        () => {
           
        },
      ); 
    }
  }
  //滑动结束后处理密码
  private dealPassword(selectedArray) {
    // 每次清空，避免提示错误
    this.titleMes_number = '';
    this.titleMes_supplement = '';

    if (this.gestureLockObj.step === 2) {   /** 进入解锁 **/
      if (this.checkPassword(selectedArray, this.gestureLockObj.password)) {  // 解锁成功
        // this.textColor = this.successColor;
        this.titleMes = 'GESTURE_UNLOCK_SUCCESS';
        // this.drawAll(this.successColor);
        this.drawAll(this.selectedColor);
        this.storage.remove('gestureAttemptObj')
        this.unregisterBackButton && this.unregisterBackButton();
        this.unregisterBackButton = undefined;
        if(this.viewCtrl.isFirst()) {
            this.picassoApp.openPage(TabsPage)
        } else {
            this.viewCtrl.dismiss()
            
        }
       
      } else {   //解锁失败
        this.titleMes = 'GESTURE_UNLOCK_FAIL';
        this.lockFaile(); 
      }
    } else if (this.gestureLockObj.step === 1) {  // 设置密码确认密码
      if (this.checkPassword(selectedArray, this.firstPassword)) { //设置密码成功
        this.gestureLockObj.step = 2;
        this.gestureLockObj.password = this.firstPassword;
        this.titleMes = 'GESTURE_SET_PASSWORD_SUCCESS';

        this.storage.set('gestureLockObj', this.gestureLockObj).then( data => {
          setTimeout( () => { 
            if(this.viewCtrl.isFirst()) {
                this.picassoApp.openPage(TabsPage)
            } else {
                this.navCtrl.pop({
                    animate: true,
                    direction: "back",
                    animation: "ios-transition",
                })
                
            }
          },500)

        });
        this.drawAll(this.selectedColor);
        
      } else {  //设置密码失败
        this.textColor = this.errorColor;
        this.titleMes = 'GESTURE_TWO_ERR';
        this.drawAll(this.errorColor);
        this.gestureLockObj = new GestureLockObj();
      }
    } else if (this.gestureLockObj.step === 0) { //设置密码
      if(selectedArray.length < 3) {
        this.titleMes = 'GESTURE_3_POINTS';
        return ;
      }
      this.gestureLockObj.step = 1;
      this.firstPassword = this.parsePassword(selectedArray);
      this.textColor = this.tipColor;
      this.titleMes = 'GESTURE_DRAW_2';
    } else if (this.gestureLockObj.step === 3) {//重置密码输入旧秘密
      if (this.checkPassword(selectedArray, this.gestureLockObj.password)) {  // 旧密码成功
        this.gestureLockObj.step = 0;
        // this.textColor = this.selectedColor;
        this.titleMes = 'GESTURE_NEW_PASSWORD';
        this.showDelete =this.hasGestureLock
        this.drawAll(this.selectedColor);
      } else {   //旧密码失败
        this.lockFaile();
      }
    }
  }

  //解锁失败
  lockFaile() {
    this.drawAll(this.errorColor);
    this.textColor = this.errorColor;
    this.gestureAttemptObj.attemptsNu = this.gestureAttemptObj.attemptsNu - 1;
    if (this.gestureAttemptObj.attemptsNu > 0) {
      this.titleMes = `GESTURE_HAVE_CHANCES_1`;
      this.titleMes_number = this.gestureAttemptObj.attemptsNu;
      this.titleMes_supplement = 'GESTURE_HAVE_CHANCES_2';
    } else {
      this.gestureAttemptObj.lockDate = Date.now();
      this.storage.set("gestureAttemptObj", this.gestureAttemptObj);
      this.titleMes = `GESTURE_60S_AGAIN_1`; 
      this.titleMes_number = this.lockTime;
      this.titleMes_supplement = 'GESTURE_60S_AGAIN_2';
      this.setInteralFun(this.lockTimeUnit);
    }
  }

  setInteralFun(time) { //检查是否超过设定时间
    this.lockTime = time;
    const interval = setInterval(() => {
      this.lockTime = this.lockTime - 1;
      this.titleMes = `GESTURE_60S_AGAIN_1`; 
      this.titleMes_number = this.lockTime;
      this.titleMes_supplement = 'GESTURE_60S_AGAIN_2';
      if (this.lockTime <= 0) {
        this.gestureAttemptObj = new GestureAttemptObj();
        this.storage.set("gestureAttemptObj", this.gestureAttemptObj);
        this.lockTime = this.lockTimeUnit;
        this.titleMes = "GESTURE_UNLOCK";
        this.titleMes_number = '';
        this.titleMes_supplement = '';
        if(this.hasGestureLock) {
          this.resetPasswordFun();
        }
        clearInterval(interval);
      }
    }, 1000);
  }

  //重置手势密码
  resetPasswordFun() {
    this.titleMes = 'GESTURE_OLD_PASSWORD';
    this.gestureLockObj.step = 3;
  }
  //删除手势密码
  deletPasswordFun() {
    this.alterCtrl.create({
      title: "手势密码",
      message:"确定删除？",
      buttons: [
        {
            text: "取消",
            role: "cancel",
            handler: () => {},
        },
        {
            text: "确定",
            handler: () => {
              this.storage.remove("gestureLockObj");
              this.gestureLockObj = new GestureLockObj();
              // this.titleMes = 'GESTURE_PLEASE_SET_PASSWORD';
              this.titleMes_number = '';
              this.titleMes_supplement = '';
              this.reset();
              this.hasGestureLock = false;
              setTimeout( () => {
                if(this.viewCtrl.isFirst()) {
                    this.picassoApp.openPage(TabsPage)
                } else {
                    this.navCtrl.pop({
                        animate: true,
                        direction: "back",
                        animation: "ios-transition",
                    })
                    
                }
                  },300)
            },
        },
    ],
    }).present();
   
  }

  //设置手势密码矩阵
  setChooseType(type) {
    this.chooseType = type;
  }

  //初始化手势点的坐标数组
  private initPointArray() {
    const n = this.chooseType;
    const radius = this.radius;
    this.selectedPointArray = [];
    this.allPointArray = [];
    this.unSelectedPointArray = [];
    this.tipPoint = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const obj = {
          x: (j * 4 + 3) * radius,
          y: (i * 4 + 3) * radius,
          index: ((i * n + 1 + j) + 2) * 7 - 1
        };
        this.allPointArray.push(obj);
        this.unSelectedPointArray.push(obj);
        this.tipPoint.push({
          value: obj,
          select: false
        });
      }
    }
  }

//滑动手势的时候更新画布
  private update(nowPoint: Point) {
    this.drawAll(this.selectedColor, nowPoint);
    this.dealPoint(this.unSelectedPointArray, nowPoint);
  }

  private checkPassword(pointArray, password): boolean {
    return password === this.parsePassword(pointArray);
  }

  private parsePassword(pointArray): string {
    return pointArray.map(data => {
      return data.index;
    }).join("");
  }

  //获得手指滑动点的位置
  private getPosition(e): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.touches[0].clientX - rect.left) * this.devicePixelRatio,
      y: (e.touches[0].clientY - rect.top) * this.devicePixelRatio
    };
  }

  //重置
  reset() {
    this.initPointArray();
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawCircles(this.allPointArray);
  }

  //添加滑动监听事件
  private bindEvent() {
    this.render.listen(this.canvas.nativeElement, "touchstart", (e) => {
      e.preventDefault();
      if (this.selectedPointArray.length === 0 && this.gestureAttemptObj.attemptsNu !== 0) {
        this.dealPoint(this.allPointArray, this.getPosition(e), true);
      }
    });
    this.render.listen(this.canvas.nativeElement, "touchmove", (e) => {
      if (this.canTouch) {
        this.update(this.getPosition(e));
      }
    });
    const self = this;
    this.render.listen(this.canvas.nativeElement, "touchend", () => {
      if (this.canTouch) {
        this.canTouch = false;
        this.dealPassword(this.selectedPointArray);
        setTimeout(function () {
          self.reset();
        }, 1000);
      }
    });
  }

  //绘制滑动屏幕后的点
  private drawAll(color, nowPoint = null) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawLine(this.selectedPointArray, color, nowPoint);
    this.drawCircles(this.allPointArray);
    this.drawCircles(this.selectedPointArray, color);
    this.drawPoints(this.selectedPointArray, color);
  }

  //滑动点的时候处理是否划中点
  private dealPoint(pointArry: Point[], nowPoint: Point, canTouch = false) {
    for (let i = 0; i < pointArry.length; i++) {
      if (Math.abs(Number(nowPoint.x) - Number(pointArry[i].x)) < this.radius && Math.abs(Number(nowPoint.y) - Number(pointArry[i].y)) < this.radius) {
        if (canTouch) {
          this.canTouch = true;
        }
        this.drawPoint(pointArry[i]);
        this.selectedPointArray.push(pointArry[i]);
        // 顶部提示
        for(let j = 0; j < this.tipPoint.length; j++) {
          if( this.tipPoint[j].value.index == pointArry[i].index ) {
            this.tipPoint[j].select = true;
            break;
          }
        }
        this.unSelectedPointArray.splice(i, 1);
        break;
      }
    }
  }

  private drawPoints(pointArray: Point[], style = this.selectedColor) {
    for (const value of pointArray) {
      this.drawPoint(value, style);
    }
  }

  private drawCircles(pointArray: Point[], style = this.unSelectedColor) {
    for (const value of pointArray) {
      this.drawCircle(value, style);
    }
  }

  //画圈
  private drawCircle(point: Point, style = this.unSelectedColor) {
    this.ctx.strokeStyle = style; 
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.radius, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  //画点
  private drawPoint(point: Point, style = this.selectedColor) {
    this.ctx.fillStyle = style;
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.radius / 1.35, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.fillStyle = '#C1B17F';
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.radius / 3.2, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.fill();
  }

  //划线
  private drawLine(pointArray: Point[], style, nowPoint: Point = null) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = style;
    this.ctx.lineWidth = 10;
 
    this.ctx.moveTo(pointArray[0].x, pointArray[0].y);
    for (let i = 1; i < pointArray.length; i++) {
      this.ctx.lineTo(pointArray[i].x, pointArray[i].y);
    }
    if (nowPoint) {
      this.ctx.lineTo(nowPoint.x, nowPoint.y);
    }
    this.ctx.stroke();
    this.ctx.closePath();
  }
  showLogin() {
    this.storage.remove("gestureLockObj");
    this.unregisterBackButton();
    this.unregisterBackButton = undefined;
    this.events.publish(
      "show login",
      "login",
      () => {
        this.storage.remove('gestureAttemptObj');
        // 新登入
        // this.viewCtrl.dismiss();
        this.picassoApp.openPage(TabsPage, undefined, null /*主页*/)
      },
    )
  }
  ionViewWillUnload() {
    const _Fn = this.navParams.get('backFn');
    if(_Fn) {
      _Fn();
    }
  }
}


