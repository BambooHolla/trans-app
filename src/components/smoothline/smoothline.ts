import { Component } from "@angular/core";
import { EchartsBaseComponent } from "../echarts-base/echarts-base";

@Component({
    selector: "smoothline-component",
    template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class SmoothlineComponent extends EchartsBaseComponent {
    // constructor() {
    //
    // }

    createCharts() {
        // 指定图表的配置项和数据
        const option = {
            backgroundColor: "transparent",
            color: ["white"],
            title: {
                text: "",
            },
            grid: {
                left: "0",
                right: "0",
                top: "0",
                bottom: "23",
                containLabel: false,
            },
            tooltip: {},
            xAxis: {
                type: "value",
                boundaryGap: false,
                // min: 0,
                // max: 1,
                splitNumber: 3,
                axisLabel: {
                    show: true,
                    margin: 2,
                    interval: 10,
                    textStyle: {
                        color: "#fff",
                    },
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ["rgba(255,255,255,.6)"],
                        width: 1,
                        type: "dashed",
                    },
                },
                axisTick: { show: false },
                axisLine: { show: false },
            },
            yAxis: {
                type: "value",
                splitNumber: 2,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ["rgba(255,255,255,.6)"],
                        width: 1,
                        type: "dashed",
                    },
                },
                axisLabel: {
                    show: true,
                },
                axisTick: { show: false },
                axisLine: { show: false },
            },
            series: [
                {
                    name: "test",
                    type: "line",
                    data: this.echartsData,
                    showSymbol: false,
                    animationEasing: "backInOut",
                    animationDuration: 1000,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1,
                                shadowBlur: 8,
                                shadowColor: "rgba(255, 255, 255, 1)",
                            },
                            emphasis: {
                                shadowColor: "rgba(255, 255, 255, 0.5)",
                                shadowBlur: 15,
                                opacity: 1,
                            },
                        },
                    },
                },
            ],
        };

        // 使用刚指定的配置项和数据显示图表。
        this.chartInstance.setOption(option);
    }
}
