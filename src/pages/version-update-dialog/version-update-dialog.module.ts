import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { VersionUpdateDialogPage } from "./version-update-dialog";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [VersionUpdateDialogPage],
  imports: [
    IonicPageModule.forChild(VersionUpdateDialogPage),
    TranslateModule,
  ],
})
export class VersionUpdateDialogPageModule {}
