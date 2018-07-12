import { Directive, Input } from "@angular/core";
import { LoadingController } from "ionic-angular";

/**
 * Generated class for the IsLoadingDirective directive.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
 * for more info on Angular Directives.
 */
@Directive({
    selector: "[is-loading]", // Attribute selector
})
export class IsLoadingDirective {
    constructor(public loadingCtrl: LoadingController) {}
    @Input("is-loading")
    set loadingAnimate(value: boolean) {
        if (value) {
            this.presentLoadingDefault();
        }
    }
    presentLoadingDefault() {
        let loading = this.loadingCtrl.create({
            content: "Please wait...",
        });

        loading.present();

        setTimeout(() => {
            loading.dismiss();
        }, 5000);
    }
}
