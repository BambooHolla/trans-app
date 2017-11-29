// import { Component, ViewChild, Input, OnChanges, OnDestroy, NgZone } from '@angular/core';
import { Component, ViewChild, Input, OnChanges, OnDestroy } from '@angular/core';
import * as echarts from 'echarts';

@Component({
    selector: 'echarts-base-component',
    template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class EchartsBaseComponent implements OnChanges, OnDestroy {
    constructor(
        // protected ngZone: NgZone,
    ) {

    }

    @Input() echartsData: any;
    @Input() options: any;

    @ViewChild('echartsPlaceholder') chartElem;

    chartInstance: echarts.ECharts;

    ngOnInit() {
        this.chartInstance = echarts.init(this.chartElem.nativeElement as HTMLDivElement);
        this.callEchartsCreator();
    }

    ngOnChanges(changes) {
        // console.log('chart ngOnChanges', Object.keys(changes));
        // console.log('charts changed:ngOnChanges', changes)
        this.callEchartsCreator();
    }

    ngOnDestroy() {
        // console.log('chart destroy');
        if (this.chartInstance){
            this.chartInstance.dispose();
            this.chartInstance = null;
        }

        // const canvasList = (this.realTimeCharts.nativeElement as HTMLDivElement).querySelectorAll('canvas');
        // for (let i = 0; i < canvasList.length; i++){
        //     canvasList[i].parentNode.removeChild(canvasList[i]);
        // }
    }

    createCharts() {
        // this.myChart.resize();
        throw new Error('createCharts method must called within derived class!');
    }

    inputDataValid(): boolean {
        return true;
    }

    callEchartsCreator() {
        if (this.echartsData && this.inputDataValid()) {
            setTimeout(() => {
                if (this.chartInstance) {
                    this.createCharts()
                    // this.ngZone.runOutsideAngular(() => {
                    //     this.createCharts()
                    // });
                }
            }, 0);
        }
    }

    resize(){
        // 图表的缩放处理。
        // 需要将 svg 的容器宽度样式先删除，否则从宽缩到窄时，
        // 外层的界面会无法自适应。
        // 使用了 setTimeout 进行样式的异步处理！
        // 此处暂时只处理了宽度问题，未处理高度。
        if (this.chartElem){
            const chartElem = this.chartElem.nativeElement as HTMLElement;
            const container = chartElem.firstChild as HTMLElement;
            container.style.width = '';
            setTimeout(() => {
                (<any>this.chartInstance).resize({width: window.getComputedStyle(chartElem).width});
            }, 0);
        }
    }

}
