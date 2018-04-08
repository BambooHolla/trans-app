import { Component, ElementRef, OnInit } from '@angular/core';
import {
  Alert,
  AlertController,
  Loading,
  LoadingController,
  NavController,
  NavParams
} from 'ionic-angular';

import { Observable } from 'rxjs/Observable';

import { NewsService } from './news.service';
import { AppSettings } from '../../providers/app-settings';

@Component({
  selector: 'page-news-content',
  templateUrl: 'news-content.html'
})
export class NewsContent implements OnInit {
  news: any; //Observable<object>
  newsId: string;
  newsType: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public elementRef: ElementRef,
    public newsService: NewsService,
    public appSettings: AppSettings,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController
  ) {
    this.newsType = this.navParams.get('newsType');
  }

  async ngOnInit() {
    this.newsId = this.navParams.get('newsId');
    console.log('新闻id', this.newsId);
    this.news = await this.newsService.getNews(
      undefined,
      this.newsId,
      this.appSettings.SIM_DATA
    );

    console.log('新闻',this,this.news)
  }
}
