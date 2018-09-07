import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { AppSettingProvider, } from "../../bnlc-framework/providers/app-setting/app-setting";
import { AppFetchProvider } from "../../bnlc-framework/providers/app-fetch/app-fetch";
import { FileOpener } from "@ionic-native/file-opener";
import { FileTransferObject, FileTransfer } from "@ionic-native/file-transfer";
import { File } from "@ionic-native/file";
import { VersionUpdateDialogPage } from "../../pages/version-update-dialog/version-update-dialog";
import { AppDataService } from "../app-data-service";

/*
  Generated class for the FsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UpgradeServiceProvider {
    constructor(
        public http: Http,
        public appSetting: AppSettingProvider,
        public fetch: AppFetchProvider,
        public file: File,
        public fileOpener: FileOpener,
        public transfer: FileTransfer,
        public appDataService: AppDataService,
    ) {}

    readonly GET_VERSION_INFO = this.appSetting.APP_URL("upgrade/versionInfo");
    readonly DOWN_URL = this.appSetting.APP_URL('file/read/')

    getVersionInfo() {
        
        return this.fetch.get<VERSION_INFO>(this.GET_VERSION_INFO, {
            search: {
            app: 1,
            },
        }).then( data => {
            const _data = data[0]
            _data.up = VersionUpdateDialogPage.versionToNumber(_data.version) > VersionUpdateDialogPage.versionToNumber(this.appDataService.APP_VERSION);
            _data.url = this.DOWN_URL + _data.url;
            return _data;
        })
    }
    
    get fileTransfer() {
        return this.transfer.create();
    }
    get fileDataDirectory() {
        return this.file.dataDirectory;
    }
    async checkVersion() {
        const _version: VERSION_INFO = await this.getVersionInfo();
        return _version.up && _version;
    }
    
    openAPK(entry) {
        return this.fileOpener.open(
            entry.toURL(),
            "application/vnd.android.package-archive",
        );
    }
}

export type VERSION_INFO = {
    [x: string]: any;
    app: number;
    osName: number;
    version: string;
    model: number;
    url: string;
    log: string[];
  };
  