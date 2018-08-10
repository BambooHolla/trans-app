import { Component } from "@angular/core";

import { FormControl, FormGroup } from "@angular/forms";
import { NavController, Platform, ActionSheetController } from "ionic-angular";

import { ImageTakerController } from "../../components/image-taker-controller";

@Component({
    selector: "page-help",
    templateUrl: "help.html",
})
export class HelpPage {
    private images: object[] = [];

    constructor(
        public navCtrl: NavController,
        public platform: Platform,
        public actionsheetCtrl: ActionSheetController,
        public imageTakerCtrl: ImageTakerController,
    ) {}
    HelpForm: FormGroup = new FormGroup({
        helpDetail: new FormControl(""),
    });

    addFile(url: string) {}

    uploadImage(name: string = "test") {
        const imageTaker = this.imageTakerCtrl.create(name);
        imageTaker.onDidDismiss((result, role) => {
            if (role !== "cancel" && result) {
                // const index = this.images.findIndex(item => item.name === result.name);
                // console.log('index: ', index, result);
                // if (result.data) {
                //     // console.log(result.data);
                //     this.images[index].image = result.data;
                // } else {
                //     this.images[index].image = 'assets/images/no-record.png';
                // }
                console.dir(result.data);
                if (result.data) {
                    this.images.push({ image: `url(${result.data})` });
                }
            }
        });
        imageTaker.present();
    }

    doSubmit() {
        console.log("be submit");
    }
}
