import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { IonicModule } from "ionic-angular";

import { TriColListComponent } from "../components/tri-col-list/tri-col-list";

import { NumMaskPipe } from "../pipes/num-mask";
import { RiseOrFallPipe } from "../pipes/rise-or-fall";
import { PositiveSignPipe } from "../pipes/positive-sign";
import { NumberFilterPipe } from "../pipes/number-filter";
import { NumberUnitFormatPipe } from "../pipes/number-unit-format";

@NgModule({
  imports: [
    // CommonModule,
    IonicModule,
  ],
  declarations: [
    TriColListComponent,
    NumMaskPipe,
    RiseOrFallPipe,
    PositiveSignPipe,
    NumberFilterPipe,
    NumberUnitFormatPipe,
  ],
  exports: [
    TriColListComponent,
    NumMaskPipe,
    RiseOrFallPipe,
    PositiveSignPipe,
    NumberFilterPipe,
    NumberUnitFormatPipe,
  ]
})
export class ListSharedModule { }
