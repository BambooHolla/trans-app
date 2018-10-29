import { Component, Optional, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";
import {
  IonicPage,
  NavController,
  NavParams,
  Refresher,
  Content,
  ViewController,
} from "ionic-angular";
import { LATEST_VERSION_INFO } from "./version.types";
import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject,
} from "@ionic-native/file-transfer";
import { File } from "@ionic-native/file";
import { FileOpener } from "@ionic-native/file-opener";
import { FirstLevelPage } from "../../bnlc-framework/FirstLevelPage";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
type buttonOptions = {
  text: string;
  handler?: Function;
  cssClass?: string;
};

export function versionToNumber(version: string) {
  const vcodes = (''+version).replace(/^v/i,'').split(".");
  /* 一共分三位：
   * 大版本号：*100000
   * 中版本号：*1000
   * 小版本号：*1
   */
  var res = 0;
  res += (parseInt(vcodes[0]) || 0) * 100000;
  res += (parseInt(vcodes[1]) || 0) * 1000;
  res += parseInt(vcodes[2]) || 0;
  return res;
}
@IonicPage()
@Component({
  selector: "page-version-update-dialog",
  templateUrl: "version-update-dialog.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionUpdateDialogPage extends FirstLevelPage {
  private unregisterBackButton;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public transfer: FileTransfer,
    public file: File,
    public fileOpener: FileOpener,
    public sanitizer: DomSanitizer,
    public changeDetectorRef: ChangeDetectorRef,
  ) {
    super(navCtrl, navParams);
  }

  version_info!: LATEST_VERSION_INFO;
  @VersionUpdateDialogPage.willEnter
  initData() {
    this.version_info = this.navParams.get("version_info");
    if(this.version_info.model === 1) {
      this.unregisterBackButton = this.platform.registerBackButtonAction(
        () => {
           
        },
      ); 
    }
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();
    if (!this.version_info) {
      // this.closeDialog();
    }
  }
  closeDialog() {
    if (this.isDownloading) {
      this.showConfirmDialog(
        "是否取消更新",
        () => {
          this.fileTransfer && this.fileTransfer.abort();
          this.viewCtrl.dismiss();
        },
      );
    } else {
      this.viewCtrl.dismiss();
    }
  }
  get version() {
    if (!this.version_info) {
      return undefined;
    }
    let res = this.version_info.version;
    // if (this.isAndroid) {
    //   if (this.version_info.android_version) {
    //     res = this.version_info.android_version;
    //   }
    // }
    // if (this.isIOS) {
    //   if (this.version_info.ios_version) {
    //     res = this.version_info.ios_version;
    //   }
    // }
    return res;
  }
  get changelogs() {
    if (!this.version_info) {
      return undefined;
    }
    let res = this.version_info.changelogs;
    if (this.isAndroid) {
      if (this.version_info.android_changelogs) {
        res = this.version_info.android_changelogs;
      }
    }
    if (this.isIOS) {
      if (this.version_info.ios_changelogs) {
        res = this.version_info.ios_changelogs;
      }
    }
    return res;
  }
  fileTransfer?: FileTransferObject;
  @VersionUpdateDialogPage.markForCheck isDownloading = false;
  @VersionUpdateDialogPage.markForCheck download_progress: SafeStyle = "--progress:0%";
  @VersionUpdateDialogPage.markForCheck download_bar_txt = 0;
  @asyncCtrlGenerator.error("@@更新失败")
  async androidUpadate() {
    this.isDownloading = true;
    try {
      this.fileTransfer = this.transfer.create();
      const apk_url = this.version_info.download_link_android;
      // const filename = apk_url.split("/").pop();
      const filename = `picasso-${this.version_info.version}.apk`;
      // fileTransfer.

      this.download_progress = this.sanitizer.bypassSecurityTrustStyle(
        "--progress:0%",
      );
      this.download_bar_txt = 0;
      
      this.fileTransfer.onProgress(e => {
        const _n = (e.loaded / e.total) * 100;
        this.download_progress = this.sanitizer.bypassSecurityTrustStyle(
          `--progress:${_n}%`,
        );
        this.download_bar_txt = Math.floor(_n > 99.8? 100 : _n);
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();
      });
      // this.file.dataDirectory
      const entry = await this.fileTransfer.download(
        apk_url,
        this.file.externalDataDirectory + filename,
      ).catch(err => Promise.reject("由于部分手机出现异常,请您进入手机设置-应用管理-Picasso-权限，将存储权限打开后再进行升级，由此给您带来的不便，敬请谅解"));
      this.fileTransfer = undefined;
      this.isDownloading = false;

      console.log("download complete: " + entry.toURL());
      console.log("download complete: " + this.file.externalDataDirectory,filename);
      await this.fileOpener.open(
        entry.toURL(),
        "application/vnd.android.package-archive",
      );
    } finally {
      this.isDownloading = false;
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    }
  }
  backgroundDownload() {
    // this.viewCtrl.dismiss();
  }

  @VersionUpdateDialogPage.didLeave
  didLeave() {
    this.unregisterBackButton && this.unregisterBackButton();
  }

  iosUpdatge() {
    if (this.version_info.itunes_link) {
      // TODO, 使用app store进行更新
    } else {
      // TODO, 测试plist是否可以通过这种方式更新
      window.open(this.version_info.download_link_web, "_system");
    }
  }
  static versionToNumber = versionToNumber;
}
