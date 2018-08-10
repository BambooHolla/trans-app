import { NgModule } from "@angular/core";
import { CopyDirective } from "./copy/copy";
import { ScrollFixKeyboardDirective } from "./scroll-fix-keyboard/scroll-fix-keyboard";
import { AutoFixedDirective } from "./auto-fixed/auto-fixed";

@NgModule({
    declarations: [CopyDirective, ScrollFixKeyboardDirective,AutoFixedDirective],
    imports: [],
    exports: [CopyDirective, ScrollFixKeyboardDirective,AutoFixedDirective],
})
export class DirectivesModule {}
