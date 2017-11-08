import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ForgetPwdPage } from './forget-pwd';

@NgModule({
  declarations: [
    ForgetPwdPage,
  ],
  imports: [
    IonicPageModule.forChild(ForgetPwdPage),
  ],
  exports: [
    ForgetPwdPage
  ]
})
export class ForgetPwdPageModule {}
