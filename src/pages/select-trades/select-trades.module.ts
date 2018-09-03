import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectTradesPage } from './select-trades';
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [
    SelectTradesPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectTradesPage),
    TranslateModule,
  ],
  exports: [SelectTradesPage],
})
export class SelectTradesPageModule {}
