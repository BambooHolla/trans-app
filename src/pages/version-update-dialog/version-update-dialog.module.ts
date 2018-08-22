import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { VersionUpdateDialogPage } from "./version-update-dialog";
import { ComponentsModule } from "../../components/components.module";
import { TranslateModule } from "@ngx-translate/core";
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  declarations: [VersionUpdateDialogPage],
  imports: [
    IonicPageModule.forChild(VersionUpdateDialogPage),
    ComponentsModule,
    TranslateModule,
    PipesModule,
  ],
})
export class VersionUpdateDialogPageModule {}
