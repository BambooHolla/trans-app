import { Component } from "@angular/core";

import { NavController } from "ionic-angular";

@Component({
    selector: "page-about",
    templateUrl: "about.html",
})
export class AboutPage {
    commandData: any[] = [
        {
            icon: "gemail",
            name: "service@picaex.com",
        },
        // {
        //   icon: "gphone",
        //   name: '0591-87275881',
        // },
        {
            icon: "gcompany",
            name: "PICASSO BLOCKCHAIN TECHNOLOGY (MALTA) LIMITED",
        },
        {
            icon: "gaddress",
            name:
                "SmartCity Malta, SCM 01, Floor 4, 401, Ricasoli, Kalkara SCM 1001, Malta",
        },
    ];

    constructor(public navCtrl: NavController) {}
}
