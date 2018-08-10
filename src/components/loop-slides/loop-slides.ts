import { Component, ViewChild } from "@angular/core";
import { Slides } from "ionic-angular";

/**
 * Generated class for the LoopSlidesComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
    selector: "loop-slides-component",
    templateUrl: "loop-slides.html",
})
export class LoopSlidesComponent {
    @ViewChild(Slides) slides: Slides;

    dataIndex = 0;
    slidePastIndex = 1;

    cardListData: object[] = [{}];

    originData: object[] = [
        {
            name: "云开智能",
            dateTime: "2017.08.08 10:10",
            average: 32.8,
            shares: 1000, //股票数量
            bOs: "买",
        },
        {
            name: "云开智能",
            dateTime: "2017.08.08 10:10",
            average: 32.8,
            shares: 1000, //股票数量
            bOs: "买",
        },
        {
            name: "云开智能",
            dateTime: "2017.08.08 10:10",
            average: 32.8,
            shares: 1000, //股票数量
            bOs: "买",
        },
    ];

    constructor() {}

    // refreshData() {
    //   console.log(`
    //     ionSlideDidChange:${this.slides.getActiveIndex()}
    //   `)
    //   // let slideActiveIndex = this.slides.getActiveIndex();
    //   // let preIndex = this.index + 0 - slideActiveIndex ;
    //   // let afterIndex = this.index + 2 - slideActiveIndex;
    //   // this.cardListData = this.originData.slice(preIndex, afterIndex);
    //   // this.index = preIndex;
    // }

    // refreshPre() {
    //   this.dataIndex--;
    //   let preIndex = this.dataIndex - 1;
    //   let afterIndex = this.dataIndex + 1;
    //   this.cardListData = this.originData.slice(preIndex, afterIndex);
    // }
    // refreshNext() {
    //   this.dataIndex++;
    //   let preIndex = this.dataIndex - 1;
    //   let afterIndex = this.dataIndex + 1;
    //   this.cardListData = this.originData.slice(preIndex, afterIndex);
    // }
}
