import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { NavController, Toast } from 'ionic-angular';
import { NoticePage } from '../notice/notice';
import { AppDataService } from '../../providers/app-data-service';
import { NoticeListModel } from '../../providers/models/notice-list-model';
import { PromptControlleService } from "../../providers/prompt-controlle-service";
@Component({
  selector: 'page-notice-list',
  templateUrl: 'notice-list.html',
})
export class NoticeListPage implements AfterViewInit{

  firstNoticeNull = {
    title: '-',
    id: 0,
  };

  hasMore: boolean = true; 

  //public navParams: NavParams
  constructor(public navCtrl: NavController,
    public appDataService: AppDataService,
    public promptCtrl: PromptControlleService,
    public noticeListModel: NoticeListModel,
    private el: ElementRef,
  ) {
    this.noticeListModel
      .loadList(false)
      .then(err => {
        if (err) {
          // this.toastAlert('加载列表错误:' + (err as any).message, 5000);
        }
      })
  }

  ngAfterViewInit() {
    // setTimeout(()=>{
    // const dom = this.el.nativeElement
    // const iframeEle = dom.getElementsByTagName('iframe')[0]

    // const vw = window.innerWidth//  .getComputedStyle(dom).width
    // // const iframeWidth = +window.getComputedStyle(iframeEle).width.slice(0, -2)
    // // const iframeWidth = iframeEle.contentWindow.innerWidth
    // const iframeWidth = iframeEle.clientWidth
    // console.log('vw/iframe: ', `${vw}/${iframeWidth}`)
    // if (vw < iframeWidth) {
    //   let percent = vw / iframeWidth
    //   iframeEle.style.transform = `scale(${percent})`
    //   iframeEle.style.transformOrigin = '0 0'
    //   const wrapper = dom.querySelector('#iframeWrapper')
    //   wrapper.style.height = `${iframeEle.clientHeight * percent}px` 
    //   wrapper.style.overflow= 'hidden'
    // }
    //   // console.log(iframeEle.clientWidth)
    //   // window['a'] = iframeEle
    // }, 350);//FIXME：延迟300ms执行一些未知的过程。。。这里不是异步队列导致的问题，所以延时数值可能不能完全保证正确

    // const dom = this.el.nativeElement
    // const iframeEle = dom.getElementsByTagName('iframe')[0] as HTMLFrameElement

    // const vw = window.innerWidth
    // const wrapper = dom.querySelector('#iframeWrapper')
    
    // iframeEle.onload = function () {
    //   // console.log('iframe window: ', window)
    //   // console.log('vw/iframe: ', `${vw}/${iframeWidth}`)
    //   const iframeWidth = iframeEle.clientWidth
    //   if (vw < iframeWidth) {
    //     let percent = vw / iframeWidth
    //     iframeEle.style.transform = `scale(${percent})`
    //     iframeEle.style.transformOrigin = '0 0'
    //     wrapper.style.height = `${iframeEle.clientHeight * percent}px`
    //     wrapper.style.overflow = 'hidden'
    //   }
    // }
  }

  //TODO:公告浏览器控制

  // 下拉刷新
  noticeListRefresh(refresher) {
    //需要设置第一个公告的对象
    this.toastDismiss();
    this.noticeListModel.loadList()
      .then(err => {
        if (err){
          // this.toastAlert('加载列表错误:' + (err as any).message, 5000);
        } else {
          this.hasMore = true;
        }
        refresher.complete();
      });
  }

  //上拉加载更多
  doInfinite(infiniteScroll) {
    this.toastDismiss();
    this.noticeListModel.loadMore()
      .then(result => {
        if (result instanceof Error){
          // this.toastAlert((result as Error).message, 5000);
        } else {
          this.hasMore = result;
          if (!result){
            // this.toastAlert('没有更多公告了！', 3000, 'bottom');
          }
        }
        infiniteScroll.complete();
      });
  }

  //进入公告详情页面
  noticeDetail(id) {
    console.log(id);
    if (id) {
      this.navCtrl.push(NoticePage, {
        id
      });
    }
  }

  toast: Toast;

  toastAlert(message, duration = 3000, position = 'top'){
    this.toastDismiss();
    this.toast = this.promptCtrl.toastCtrl({
      message,
      duration,
      position,
    });
    this.toast.present();
  }

  toastDismiss(){
    if (this.toast){
      this.toast.dismiss();
    }
  }
}

