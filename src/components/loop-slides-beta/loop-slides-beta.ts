import { Component, ViewChild, ElementRef } from '@angular/core';

/**
 * Generated class for the LoopSlidesBetaComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'loop-slides-beta',
  templateUrl: 'loop-slides-beta.html'
})
export class LoopSlidesBetaComponent {

  dataIndex = 0;
  slidePastIndex = 1;

  cardListData: object[] = [
    {

    },
  ]

  originData: object[] = [
    {
      name: "云开智能0",
      dateTime: "2017.08.08 10:10",
      average: (Math.random() * 32.8).toFixed(2),
      shares: (Math.random() * 1000).toFixed(2),//股票数量
      bOs: "买",
    },
    {
      name: "云动智能1",
      dateTime: "2017.08.08 10:10",
      average: (Math.random() * 32.8).toFixed(2),
      shares: (Math.random() * 1000).toFixed(2),//股票数量
      bOs: "买",
    },
    {
      name: "云关智能2",
      dateTime: "2017.08.08 10:10",
      average: (Math.random() * 32.8).toFixed(2),
      shares: (Math.random() * 1000).toFixed(2),//股票数量
      bOs: "买",
    },
    {
      name: "云开智能3",
      dateTime: "2017.08.08 10:10",
      average: (Math.random() * 32.8).toFixed(2),
      shares: (Math.random() * 1000).toFixed(2),//股票数量
      bOs: "买",
    },
    {
      name: "云动智能4",
      dateTime: "2017.08.08 10:10",
      average: (Math.random() * 32.8).toFixed(2),
      shares: (Math.random() * 1000).toFixed(2),//股票数量
      bOs: "买",
    },
    {
      name: "云关智能5",
      dateTime: "2017.08.08 10:10",
      average: (Math.random() * 32.8).toFixed(2),
      shares: (Math.random() * 1000).toFixed(2),//股票数量
      bOs: "买",
    },
    {
      name: "云开智能6",
      dateTime: "2017.08.08 10:10",
      average: (Math.random() * 32.8).toFixed(2),
      shares: (Math.random() * 1000).toFixed(2),//股票数量
      bOs: "买",
    },
    {
      name: "云动智能7",
      dateTime: "2017.08.08 10:10",
      average: (Math.random() * 32.8).toFixed(2),
      shares: (Math.random() * 1000).toFixed(2),//股票数量
      bOs: "买",
    },
    {
      name: "云关智能8",
      dateTime: "2017.08.08 10:10",
      average: (Math.random() * 32.8).toFixed(2),
      shares: (Math.random() * 1000).toFixed(2),//股票数量
      bOs: "买",
    },
  ]

  index = 4;
  cardInfo = this.originData[this.index];
  backCardInfo = this.originData[this.index];

  @ViewChild('frontCard')
  frontCard: ElementRef;

  constructor() {

  }

  startLocationY: any;
  endLocationY: any;
  itemLocationY: any;
  itemHeight: any;
  boundaryTop: any;
  boundaryBottom: any;
  transBoundaryTop: any;
  transBoundaryBottom: any;

  ngAfterViewInit() {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.itemLocationY = window.getComputedStyle(this.frontCard.nativeElement).getPropertyValue("top") || "0";
    this.itemHeight = window.getComputedStyle(this.frontCard.nativeElement).getPropertyValue("height");

    this.boundaryTop = parseFloat(this.itemLocationY) - parseFloat(this.itemHeight);
    this.boundaryBottom = parseFloat(this.itemLocationY) + parseFloat(this.itemHeight);

    this.transBoundaryTop = parseFloat(this.itemLocationY) - parseFloat(this.itemHeight) / 2;// * 2 / 3;
    this.transBoundaryBottom = parseFloat(this.itemLocationY) + parseFloat(this.itemHeight) * 2 / 3;

    console.log("itemLocationY: " + this.itemLocationY);
    console.log("itemHeight: " + this.itemHeight);
    console.log("boundaryTop: " + this.boundaryTop);
    console.log("boundaryBottom: " + this.boundaryBottom);
    console.log("");
  }

  touchstartFun(event: any) {
    event.preventDefault();
    this.startLocationY = event.touches[0].pageY;
  }
  touchmoveFun(event: any) {
    event.preventDefault();

    let spanY = event.touches[0].pageY - this.startLocationY;
    let transitionH = parseFloat(this.itemLocationY) + spanY;

    //触发数据变动,span大于0往前翻,span小于0往后翻;
    this.backCardInfo = spanY > 0 ?
      this.originData[(this.index - 1 + this.originData.length) % this.originData.length]
      : this.originData[(this.index + 1) % this.originData.length];

    //限定移动边界
    transitionH = transitionH < this.boundaryTop ?
      this.boundaryTop : (transitionH > this.boundaryBottom ?
        this.boundaryBottom : transitionH);
    // if (transitionH < boundaryTop) {
    //   transitionH = boundaryTop;
    // } else if (transitionH > boundaryBottom) {
    //   transitionH = boundaryBottom;
    // }
    // console.log("transitionH: " + transitionH);

    this.frontCard.nativeElement.style.top = transitionH + "px";
  }
  touchendFun(event: any) {
    event.preventDefault();
    let transitionH = parseFloat(this.frontCard.nativeElement.style.top);
    if (transitionH < this.transBoundaryTop) {
      // this.frontCard.nativeElement.style = "top:" + this.boundaryTop + "px;opacity:0;transition:.5s";
      this.frontCard.nativeElement.setAttribute("style", "top:" + this.boundaryTop + "px;opacity:0;transition:.5s");
      this.index = (++this.index) % this.originData.length;
    } else if (transitionH > this.transBoundaryBottom) {
      // this.frontCard.nativeElement.style = "top:" + this.boundaryBottom + "px;opacity:0;transition:.5s";
      this.frontCard.nativeElement.setAttribute("style", "top:" + this.boundaryBottom + "px;opacity:0;transition:.5s");      
      this.index = (--this.index + this.originData.length) % this.originData.length;
    } else {
      // this.frontCard.nativeElement.style = "top:" + this.itemLocationY + ";transition:.5s";
      this.frontCard.nativeElement.setAttribute("style", "top:" + this.itemLocationY + ";transition:.5s");      
    }
    setTimeout(() => {
      this.cardInfo = this.originData[this.index];
      // this.frontCard.nativeElement.style = "top:" + this.itemLocationY;
      this.frontCard.nativeElement.setAttribute("style", "top:" + this.itemLocationY);            
    }, 500);
  }
}
