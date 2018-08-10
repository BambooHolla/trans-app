import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import { NavController, ModalController, NavParams } from "ionic-angular";

import { AppSettings } from "../../providers/app-settings";

import { InformationModal } from "../../modals/information-modal/information-modal";

import { AuthPendingPage } from "../auth-pending/auth-pending";

@Component({
    selector: "page-create-account-confirm",
    templateUrl: "create-account-confirm.html",
    // template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class CreateAccountConfirmPage {
    ConfirmForm: FormGroup = new FormGroup({
        riskNote: new FormControl(false),
        initiationAgreement: new FormControl(false),
        partnershipAgreement: new FormControl(false),
    });

    constructor(
        public navCtrl: NavController,
        public modalCtrl: ModalController,
        public appSettings: AppSettings,
        public navParams: NavParams,
    ) {}

    showModal(agreementName) {
        console.log(agreementName);
        if (agreementName in this.appSettings.agreementData) {
            const { title, agreementFirst } = this.appSettings.agreementData[
                agreementName
            ];
            const informationModal = this.modalCtrl.create(InformationModal, {
                title,
                agreementFirst,
            });
            informationModal.present();
        }
    }

    checkAll() {
        const controls = this.ConfirmForm.controls;
        return (
            controls.riskNote.value &&
            controls.initiationAgreement.value &&
            controls.partnershipAgreement.value
        );
    }

    doValidate() {
        if (this.checkAll()) {
            const lastBody = this.navParams.get("body");

            this.authPending(lastBody);
        }
    }

    authPending(body: object) {
        console.log(body);
        this.navCtrl.push(AuthPendingPage, {
            body: body,
        });
    }
}
