import { NgModule } from "@angular/core";
// import { CommonModule } from '@angular/common';
import { IonicModule } from "ionic-angular";

import { RichText } from "../components/rich-text/rich-text";
import { Comments } from "../components/comments/comments";
import { LikedDirective } from "../directives/liked/liked";
import { TimespanPipe } from "../pipes/timespan-pipe";
import { Inputer } from "../components/inputer/inputer";

@NgModule({
    imports: [
        // CommonModule,
        IonicModule,
    ],
    declarations: [RichText, Comments, LikedDirective, TimespanPipe, Inputer],
    exports: [
        // CommonModule,
        RichText,
        Comments,
        LikedDirective,
        TimespanPipe,
        Inputer,
    ],
})
export class InfoSharedModule {}
