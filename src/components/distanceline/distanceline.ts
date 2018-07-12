import { Component } from "@angular/core";
import { EchartsBaseComponent } from "../echarts-base/echarts-base";

@Component({
    selector: "distanceline-component",
    template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class DistancelineComponent extends EchartsBaseComponent {
    // constructor() {
    //
    // }

    createCharts() {
        // 指定图表的配置项和数据
        var option = {
            backgroundColor: "transparent",
            title: {
                text: "",
                subtext: "",
            },
            xAxis: [
                {
                    type: "time",
                    splitNumber: 10,
                    splitLine: { show: false },
                    axisTick: { show: false },
                    axisLine: { show: false },
                    axisLabel: {
                        textStyle: {
                            color: "#fff",
                        },
                    },
                },
            ],
            yAxis: [
                {
                    type: "value",
                    show: false,
                    boundaryGap: [0, "100%"],
                    splitLine: {
                        show: false,
                    },
                },
            ],
            series: [
                {
                    name: "series1",
                    type: "line",
                    smooth: false,
                    showSymbol: false,
                    hoverAnimation: false,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1,
                                color: "#fff",
                                shadowBlur: 7,
                                shadowColor: "rgba(255, 255, 255, 1)",
                                opacity: 1,
                            },
                            emphasis: {
                                shadowColor: "#fff", //默认透明
                                shadowBlur: 15,
                                opacity: 1,
                            },
                        },
                    },
                    data: this.echartsData,
                },
            ],
        };

        // 使用刚指定的配置项和数据显示图表。
        this.chartInstance.setOption(option);
    }
}
