import { Component, Input } from "@angular/core";
import { EchartsBaseComponent } from "../echarts-base/echarts-base";

@Component({
    selector: "pie-component",
    template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class PieComponent extends EchartsBaseComponent {
    @Input() pieTitle: any;

    // constructor() {
    //
    // }

    backInOut(k) {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) {
            return 0.5 * (k * k * ((s + 1) * k - s));
        }
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }

    createCharts() {
        const echartsData = this.echartsData;
        const labelTop = {
            normal: {
                label: {
                    show: true,
                    formatter: function(params) {
                        return 50 - params.value + "%";
                    },
                    position: "center",
                    textStyle: {
                        baseline: "bottom",
                    },
                },
                labelLine: {
                    show: false,
                },
            },
            emphasis: {
                // color: 'rgba(0,0,0,0)'
            },
        };
        const labelFromatter = {
            normal: {
                color: "#7dcee4",
                label: {
                    formatter: function(params) {
                        return params.name;
                    },
                    textStyle: {
                        baseline: "top",
                        color: "#7dcee4",
                    },
                },
            },
        };
        const labelBottom = {
            normal: {
                color: "#fff",
                label: {
                    show: true,
                    position: "center",
                },
                labelLine: {
                    show: false,
                },
            },
            emphasis: {
                show: false,
            },
        };

        // pie图个数和每行个数
        var num = echartsData.length; //一共有几个pie图
        var digital = 3; //每行几个pie图
        var ca, cb, cbmin;
        var scent = new Array(); //圆心坐标
        var ra = 100 / (digital + 1) - 5; //pie图内半径
        if (ra < 20) {
            ra = 16;
        }
        var rb = ra + 8; //pie图外半径
        var radius = [ra + "%", rb + "%"]; //pie图的内半径和外半径

        for (var x = 0; x < num; x++) {
            ca = (100 / digital) * (0.5 + (x % digital)); //圆心x轴坐标
            cbmin = 100 / digital;
            if (digital > 3) {
                cbmin = 33;
            }
            cb =
                cbmin +
                (digital * (digital - 1) + 100 / digital) *
                    Math.floor(x / digital); //圆心y轴坐标
            scent[x] = [ca + "%", cb + "%"];
        }

        //series里面data数组
        var sedata = new Array();
        var sebot,
            setop = {};
        for (let x = 0; x < echartsData.length; x++) {
            sebot = {
                name: echartsData[x][0],
                value: echartsData[x][1],
                itemStyle: labelBottom,
            };
            var dd = 50 - echartsData[x][1];
            setop = { name: "", value: dd, itemStyle: labelTop };
            sedata[x] = [sebot, setop];
        }

        //series数组
        var series = [];
        for (let x = 0; x < echartsData.length; x++) {
            series.push({
                type: "pie",
                selectedOffset: 0,
                hoverAnimation: false,
                legendHoverLink: false,
                center: scent[x],
                radius: radius,
                itemStyle: labelFromatter,
                data: sedata[x],
            });
        }

        // 指定图表的配置项和数据
        const option = {
            backgroundColor: "transparent",
            title: {
                text: this.pieTitle,
                textStyle: {
                    color: "#fff",
                    fontWeight: "normal",
                    fontSize: "15",
                },
                subtext: "",
                x: "center",
            },
            series: series,
        };
        // 使用刚指定的配置项和数据显示图表。
        this.chartInstance.setOption(option);
    }
}
