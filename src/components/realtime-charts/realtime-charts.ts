import { Component, Input, Output, EventEmitter, } from '@angular/core';
import { EchartsBaseComponent } from '../echarts-base/echarts-base';

@Component({
    selector: 'realtime-charts-component',
    template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class RealTimeChartsComponent extends EchartsBaseComponent {

    @Input() baseData: any;
    @Input() tradingTimeArray: any;

    @Output() tooltipEmitted: any = new EventEmitter();

    computeAvgPrice(realTimeData: any[]) {
        let sum = 0,
            arrTemp = [],
            n = 0;
        for (let i = 0; i < realTimeData.length; i++){
            if (!realTimeData[i]){  //undefiend
                arrTemp.push(undefined);
            } else {
                sum += realTimeData[i].price;
                n++;
                arrTemp.push(Math.round(sum / n * 100) / 100);
            }
        }
        return arrTemp;
    }

    private lastTooltipDataIndex = -1;

    createCharts() {
        const options = this.options || {};
        //解构赋值解析options变量,使用默认值保证配置参数正常
        const {
            showAxisBoundaryLabel = true,
            tooltipShow = true,
            gridLeft = '2px',
            gridRight = '0px',
            gridTop = '10px',
            gridBottom = '5px',
            axisLabelShow = true,
            xAxisShow = true,
            customTooltip = false,
            yAxisStyle = {},
            xAxisInside = false,
            yAxisSplitLine = true,
            align = 'middle',
            yAxisSize = '',
            area = {
              normal: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0, color: 'rgba(0,128,255,.2)' // 0% 处的颜色
                  }, {
                    offset: 1, color: 'rgba(0,128,255,.2)' // 100% 处的颜色
                  }],
                }
              }
            },
            seriesColor = '#fff',
            axisLabelColor = '#fff',
            rangeColor = ['#ff4238','#30d94c'],
            seriesLineColor = 'orange',
            showTimeLabelPerHour = true,
        } = options;

        const priceData = this.echartsData.map(item => item.price);
        // const turnoverQuantity = this.echartsData.map(item => item.turnoverQuantity);

        let mid = this.baseData.yesterdayPrice;
        // 指定图表的配置项和数据

        const avgPriceData = this.computeAvgPrice(this.echartsData as any[]);
        const maxSpan = Math.max(mid / 100, priceData.reduce((max, value) =>
            value ? Math.max(Math.abs(value - mid), max) : max,
        0));

        const option = {
            tooltip: {
                show: tooltipShow,
                trigger: 'axis',
                extraCssText: 'width: 88px',
                position: function (pos, params, el, elRect, size) {
                    var obj = {top: 10};
                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 60;
                    return obj;
                },
                formatter: customTooltip ? (params) => {
                    const dataIndex = params[0].dataIndex;
                    if (this.lastTooltipDataIndex !== dataIndex){
                        this.lastTooltipDataIndex = dataIndex;
                        this.tooltipEmitted.emit(params);
                    }
                } : 
                (params) => {
                    return `${params[0].name} <br/>
                        价格:  ${params[0].data} <br/>
                        均价:  ${params[1].data} <br/>`
                },
            },
            grid: {
                left: gridLeft,
                right: gridRight,
                top: gridTop,
                bottom: gridBottom,
                show: false,
                containLabel: true
            },
            xAxis: {
                type: 'category',
                show: xAxisShow,
                splitLine: {
                    show: true,
                    lineStyle: yAxisStyle
                },
                data: this.tradingTimeArray,
                axisLabel: {
                    textStyle: {
                        color: axisLabelColor
                    },
                    inside: xAxisInside,
                    show: axisLabelShow,
                    interval: (59),
                    margin: 3,
                    //控制X轴刻度的显示间隔
                    formatter: function (value) {
                        switch (value){
                            case '09:30':
                                return '         09:30';
                            case '10:30':
                                return showTimeLabelPerHour ? value : '';
                            case '11:30':
                                return `  11:30/13:00`;
                            case '13:59':
                                return showTimeLabelPerHour ? '14:00' : '';
                            case '14:59':
                            case '15:00':
                                return `15:00         `;
                            default:
                                return value;
                        }
                    }
                },
                axisLine: {
                    show: false,
                    onZero: false,
                    lineStyle: {
                        color: '#505050'
                    }
                },
                axisTick: {
                    show: false,
                },
                axisPointer: {
                    snap: false
                },
            },
            yAxis: [{
                type: 'value',
                splitLine: {
                    show: yAxisSplitLine,
                    // interval: 2,
                    lineStyle: yAxisStyle
                },
                axisPointer: {
                    snap: false
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    textStyle:{
                        color: axisLabelColor,
                        baseline: align,
                        fontSize: yAxisSize,
                    },
                    show: true,
                    inside: true,
                    // interval: 2,
                    formatter: function (value) {
                        return value.toFixed(2)
                    },
                    lineStyle: {
                        color: '#505050'
                    }
                },
                // scale: true,
                max: mid + maxSpan,
                min: mid - maxSpan,
                // max: mid + maxSpan * 1.1,
                // min: mid - maxSpan * 1.1,
                splitNumber: 1,
                minInterval: 0.01,
                interval: maxSpan,
                // 在设置 min 与 max 之后， boundaryGap 就会无效
                // boundaryGap: ['20%', '20%'],
                zlevel: 100,
            }, {
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    show: true,
                    inside: true,
                    formatter: function (e) {
                        return (e * 100).toFixed(2) + "%"
                    },
                    textStyle: {
                        baseline : align,
                        fontSize: yAxisSize,
                        color: function (e) {
                            if (e > 1e-8)
                                return rangeColor[0];
                            if (e === 0)
                                return "#a1a1a1";
                            if (e < -1e-8)
                                return rangeColor[1]
                        }
                    },
                    showMinLabel: showAxisBoundaryLabel,
                    showMaxLabel: showAxisBoundaryLabel,
                    //控制X轴刻度的显示间隔
                },
                splitNumber: 1,
                // interval: maxSpan / mid,
                max: maxSpan / mid,
                min: -maxSpan / mid,
                // data: [maxSpan / mid * 1.1, maxSpan / mid, -maxSpan / mid, -maxSpan / mid * 1.1],
                // boundaryGap: ['20%', '20%'],
                zlevel: 100,
            }],
            series: [
                 {
                    name: '价格',
                    type: 'line',
                    lineStyle: {
                        normal: {
                            width: 1,
                            color: seriesColor
                        }
                    },
                    areaStyle: area,
                    symbol: "none",
                    data: priceData
                },
                {
                    name: '均价',
                    type: 'line',
                    smooth: true,
                    lineStyle: {
                        normal: {
                            width: 1,
                            color: seriesLineColor
                        }
                    },
                    symbol: "none",
                    data: avgPriceData,
                },
            ],
            animation: false,
        };
        console.log(option)
        // 使用刚指定的配置项和数据显示图表。
        this.chartInstance.setOption(option);
        // this.chartInstance.resize();
    }

    inputDataValid() {
        return !!(this.baseData &&
            this.baseData.yesterdayPrice &&
            Array.isArray(this.echartsData)
        );
    }

}
