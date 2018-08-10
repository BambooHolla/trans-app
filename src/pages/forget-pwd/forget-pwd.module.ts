import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ForgetPwdPage } from "./forget-pwd";
import { TranslateModule } from "@ngx-translate/core";
@NgModule({
    declarations: [ForgetPwdPage],
    imports: [IonicPageModule.forChild(ForgetPwdPage), TranslateModule],
    exports: [ForgetPwdPage],
})
export class ForgetPwdPageModule {}
