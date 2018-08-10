import { Injectable } from "@angular/core";

// import { Http } from '@angular/http';

// import { AppSettings } from '../app-settings';
// import { AppDataService } from '../app-data-service';
// import { HttpService } from '../http-service';
import { BaseModel } from "./base-model";

@Injectable()
export class NoticeListModel extends BaseModel {
    // constructor(
    //   public httpService: HttpService,
    // ) {
    //   super();
    //   //执行父类的构造函数。必须至少执行一次。
    //   // this.noticeListInit();
    //   this.path = 'noticeList';
    //   this.pageSize = 5;
    //   console.log('NoticeListService constructor')
    // }

    public path = "noticeList";
    public pageSize = 5;
}
