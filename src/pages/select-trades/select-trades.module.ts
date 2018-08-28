import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectTradesPage } from './select-trades';

@NgModule({
  declarations: [
    SelectTradesPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectTradesPage),
  ],
})
export class SelectTradesPageModule {}
