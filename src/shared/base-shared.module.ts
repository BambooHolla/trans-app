import { NgModule } from "@angular/core";
// import { CommonModule } from '@angular/common';
// import { IonicModule } from 'ionic-angular';

import { IsLoadingDirective } from "../directives/is-loading/is-loading";
import { ScrollFixXDirective } from "../directives/scroll-fix-x/scroll-fix-x";

@NgModule({
    imports: [
        // CommonModule,
        // IonicModule,
    ],
    declarations: [IsLoadingDirective, ScrollFixXDirective],
    exports: [
        // CommonModule,
        IsLoadingDirective,
        ScrollFixXDirective,
    ],
})
export class BaseSharedModule {}
