import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { RegisterPage } from "./register";
import { TranslateModule } from "@ngx-translate/core";
import {MultiPickerModule} from 'ion-multi-picker';
@NgModule({
    declarations: [RegisterPage],
    imports: [IonicPageModule.forChild(RegisterPage), TranslateModule,MultiPickerModule],
    exports: [RegisterPage],
})
export class RegisterPageModule {}
