import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IframepagePage } from './iframepage';

@NgModule({
  declarations: [
    IframepagePage,
  ],
  imports: [
    IonicPageModule.forChild(IframepagePage),
  ],
  exports: [
    IframepagePage
  ]
})
export class IframepagePageModule {}
