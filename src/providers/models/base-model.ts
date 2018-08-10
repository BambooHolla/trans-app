import { Injectable } from "@angular/core";

import { Http } from "@angular/http";

import { AppSettings } from "../app-settings";
import { AppDataService } from "../app-data-service";
import { HttpService } from "../http-service";

@Injectable()
export class BaseModel {
    constructor(
        public httpService: HttpService,
        public appSettings: AppSettings,
        public appDataService: AppDataService,
    ) {}

    public http: Http;

    public inited: boolean = false;
    public loading: boolean = false;

    public path: string;
    public pageSize: number = 10;

    public listData: any[] = [];

    //notice-list
    public notice_more_data: Object[];
    public notice_data: Object[];

    public loadList(force: boolean = true) {
        if ((!this.inited || force) && !this.loading) {
            this.loading = true;
            return this.httpService
                .get(this.path, {
                    pageSize: this.pageSize,
                })
                .then(data => {
                    this.inited = true;
                    this.loading = false;
                    this.listData = data;
                    return Promise.resolve();
                })
                .catch(err => {
                    this.inited = true;
                    this.loading = false;
                    console.log(err.message);
                    return Promise.resolve(err);
                });
        } else {
            return Promise.resolve();
        }
    }

    public loadMore(): Promise<boolean | Error> {
        let id = 0;
        const listData = this.listData;
        if (listData.length) {
            id = listData[listData.length - 1].id;
        }

        this.loading = true;

        return this.httpService
            .get(this.path, {
                pageSize: this.pageSize,
                id,
            })
            .then(data => {
                const hasMore = !!data.length;
                this.listData = listData.concat(data);
                this.loading = false;
                return Promise.resolve(hasMore);
            })
            .catch(err => {
                this.loading = false;
                console.log(err.message);
                return Promise.resolve(err);
            });
    }
}
