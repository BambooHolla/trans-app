import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModifyPwdPage } from './modify-pwd';

@NgModule({
  declarations: [
    ModifyPwdPage,
  ],
  imports: [
    IonicPageModule.forChild(ModifyPwdPage),
  ],
  exports: [
    ModifyPwdPage
  ]
})
export class ModifyPwdPageModule {}
