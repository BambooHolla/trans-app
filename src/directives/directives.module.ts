import { NgModule } from "@angular/core";
import { CopyDirective } from "./copy/copy";
import { ScrollFixKeyboardDirective } from "./scroll-fix-keyboard/scroll-fix-keyboard";
@NgModule({
    declarations: [CopyDirective, ScrollFixKeyboardDirective],
    imports: [],
    exports: [CopyDirective, ScrollFixKeyboardDirective],
})
export class DirectivesModule {}
