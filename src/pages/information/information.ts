import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, Slides, NavController } from 'ionic-angular';
import { SearchItemPage } from "../search-item/search-item-page";

/**
 * Generated class for the Information page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-information',
  templateUrl: 'information.html',
})
export class InformationPage implements OnInit, OnDestroy {
  @ViewChild(Slides) slides: Slides;
  //当前的页面,默认在公告页面
  public currentPage: string = 'notice';
  searchItemPage: any = SearchItemPage;

  //页面新闻的列表
  public newsList: number = 333;

  //public navParams: NavParams
  constructor(
    // public appCtrl: App,
    public navCtrl: NavController,
  ) {

  }
  
  ngOnInit() {
    console.log('information: onInit')
  }

  ngOnDestroy() {
    console.log('information: onDestroy')
  }
  ionViewDidLoad() {
    console.log('information: ionViewDidLoad')
    // this.newsListSubscriber = this.newsList.subscribe()
  }
  ionViewDidLeave() {
    console.log('information: ionViewDidLeave')
    // this.newsListSubscriber.unsubscribe()
  }

  tabChanged($event){
    // console.log($event._snapIndex);
    if($event._snapIndex === 1)
      this.currentPage = 'news';
    else
      this.currentPage = 'notice';
  }

  changeToNews(){
    if(this.currentPage === 'notice'){
        this.slides.slideNext();
    }
  }

  changeToNotice(){

    if(this.currentPage === 'news'){
        this.slides.slidePrev();
    }
  }

}
