import { Component, Input, Output, EventEmitter } from "@angular/core";
import { KlineEchartsBaseComponent } from "../kline-base/kline-base";
import * as moment from "moment";
import { checkNoChangesNode } from "@angular/core/src/view/view";
import { LoadingController } from "ionic-angular";

@Component({
    selector: "kline-report",
    template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class KlineReportComponent extends KlineEchartsBaseComponent {
    @Input() riseOrFall: any = "";
    @Output() tooltipEmitted: any = new EventEmitter();
    private riseColor: string =  this.appDataService.risefallColor ? "#d9564f" : "#549e5c";
    private fallColor: string =  !this.appDataService.risefallColor ? "#d9564f" : "#549e5c";
    // 记录报表的最后一个时间，用于判断推送的数据，是旧数据还是新数据，如果没有，就取现在的时间，注：时间格式要对应
    private _LAST_TIME: any;
    // 保存的报表数据
    private klineDatas: any = {
        times: [],
        datas: [],
        vols: [],
    };

    // 记录指标显示的类型
    private saveQuotas = {
        MA: this.appDataService.KlineParameter.MA,
    };
    // k线图展示数据
    private showKlineDates: any = {
        times: [],
        datas: [],
        vols: [],
        EMA12: [],
        EMA26: [],
        DIF: [],
        DEA: [],
        MACD: [],
    };

    // 日期格式
    private FORMATS = {
        "1m": "HH:mm",
        "5m": "MM-DD HH:mm",
        "15m": "MM-DD HH:mm",
        "30m": "MM-DD HH:mm",
        "1h": "MM-DD HH:mm",
        "1d": "YYYY-MM-DD",
        "1w": "YYYY-MM-DD",
    };

    // 报表数据过少，moment 添加时间段
    private MIN_TIME_LENGTH: number = 24;
    private DATE_TYPE = {
        "1m": [1, "m"],
        "5m": [5, "m"],
        "15m": [15, "m"],
        "30m": [30, "m"],
        "1h": [1, "h"],
        "1d": [1, "d"],
        "1w": [1, "w"],
    };

    // private option:any ;

    // 配置
    private _echart_option = {
        zoomLock: false, // 是否锁定选择区的大小，如果设置为 true 则锁定选择区域的大小，也就是说，只能平移，不能缩放。
        start: 0,
        end: 100, // 视图显示范围 0 ~ 100
        minSpan: 10,
        maxSpan: 90, // 设置最大最小 缩放 比例 0 ~ 100，
    };
    get option() {
        let that = this;
        return {
            backgroundColor: "#262739",
            animation: false,
            legend: {
                show: false,
                selected: {
                    MA: that.saveQuotas["MA"],
                },
            },
            tooltip: {
                trigger: "axis",
                // triggerOn: 'none',
                confine: true,
                axisPointer: {
                    type: "cross",
                    label: {
                        backgroundColor: "#262739",
                        color: "#cccccc",
                        borderColor: "#00000",
                        borderWidth: "1",
                        shadowBlur: "0", 
                    },
                },
                backgroundColor: "rgba(245, 245, 245, 0.8)",
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 2,

                position: function(pos, params, el, elRect, size) {
                    let obj = { top: "1%" };
                    obj[
                        ["left", "right"][+(pos[0] < size.viewSize[0] / 2)]
                    ] = 5;
                    return obj;
                },
                formatter: function(datas) {
                    console.log("echart data", datas);
                    if (!(datas.length > 0)) {
                        return;
                    }
                    let candlestick_index: number = 0;
                    for (
                        let length = datas.length;
                        candlestick_index < length;
                        candlestick_index++
                    ) {
                        if (
                            datas[candlestick_index].seriesType == "candlestick"
                        ) {
                            break;
                        }
                    }
                    if (candlestick_index >= datas.length) {
                        return;
                    }

                    let res: any = `
                        <table class="prompt-box">
                            <tr>
                            <td class="prompt-title">时间</td>
                            <td class="prompt-value">${
                                datas[candlestick_index].name
                            }</td>
                            </tr>
                            <tr>
                            <td class="prompt-title">开</td>
                            <td class="prompt-value">${that._numberFormatAdd0(datas[candlestick_index].data[1]*1)}</td>
                            </tr>`;
                    let val_max: any = that._numberFormatAdd0(datas[candlestick_index].data[4]*1);
                    let val_min: any = that._numberFormatAdd0(datas[candlestick_index].data[3]*1);
                    // for(let i = 1, length = datas[candlestick_index].data.length - 1; i < length; i++) {
                    //     val_max = datas[candlestick_index].data[i] > datas[candlestick_index].data[i+1] ?
                    //         datas[candlestick_index].data[i] : datas[candlestick_index].data[i+1];

                    //     val_min = datas[candlestick_index].data[i] < datas[candlestick_index].data[i+1] ?
                    //         datas[candlestick_index].data[i] : datas[candlestick_index].data[i+1];
                    // }

                    // res += `<tr>
                    //         <td>高</td>
                    //         <td>${val_max}</td>
                    //         </tr>
                    //         <tr>
                    //         <td>低</td>
                    //         <td>${val_min}</td>
                    //         </tr>
                    //         <tr>
                    //         <td>收</td>
                    //         <td>${datas[candlestick_index].data[datas[candlestick_index].data.length-1]}</td>
                    //         </tr>
                    //     </table>`
                    res += `<tr>
                            <td class="prompt-title">高</td>
                            <td class="prompt-value">${val_max}</td>
                            </tr>
                            <tr>
                            <td class="prompt-title">低</td>
                            <td class="prompt-value">${val_min}</td>
                            </tr>
                            <tr>
                            <td class="prompt-title">收</td>
                            <td class="prompt-value">${that._numberFormatAdd0(datas[candlestick_index].data[2]*1)}</td>
                            </tr>
                        </table>`;
                        console.log(that._numberFormatAdd0(datas[candlestick_index].data[2]*1),datas[candlestick_index].data[2],datas[candlestick_index].data[2]*1)
                    return res;
                },
            },
            axisPointer: {
                link: {
                    xAxisIndex: "all",
                },
                label: {
                    backgroundColor: "#777",
                    margin: 0,
                },
                lineStyle: {
                    type: "dashed",
                },
            },
            grid: [
                {
                    left: "5%",
                    right: "3%",
                    top: "2%",
                    height: "60%",
                },
                {
                    left: "3%",
                    right: "3%",
                    top: "70%",
                    height: "10%",
                    tooltip: {
                        show: true,
                    },
                },
                {
                    left: "3%",
                    right: "3%",
                    top: "82%",
                    height: "14%",
                    tooltip: {
                        show: true,
                    },
                },
            ],
            xAxis: [
                {
                    type: "category",
                    data: this.showKlineDates.times,
                    // data: time,
                    scale: true,
                    boundaryGap: ["20%", "20%"],

                    axisLine: {
                        onZero: false,
                        lineStyle: {
                            color: "#6b6b6b",
                        },
                    },
                    splitLine: {
                        show: true,

                        lineStyle: {
                            color: "rgba(107,107,107,0.32)",
                        },
                    },
                    axisLabel: {
                        showMinLabel: true,
                        showMaxLabel: true,
                        fontSize: 12,
                    },
                    axisTick: {},
                },
                {
                    type: "category",
                    gridIndex: 1,
                    boundaryGap: ["20%", "20%"],
                    data: this.showKlineDates.times,
                    // data: time,
                    axisLabel: { show: false },
                    axisPointer: {
                        show: false,
                        label: {
                            show: false,
                        },
                    },
                },
                {
                    type: "category",
                    gridIndex: 2,
                    boundaryGap: ["20%", "20%"],
                    data: this.showKlineDates.times,
                    // data: time,
                    axisLabel: { show: false },
                    axisPointer: {
                        show: false,
                        label: {
                            show: false,
                        },
                    },
                },
            ],
            yAxis: [
                {
                    scale: true,
                    show: true,
                    boundaryGap: ["20%", "20%"],
                    position: "right",
                    splitNumber: 5,
                    splitArea: {
                        show: false,
                    },
                    axisLine: {
                        onZero: false,
                        show: true,
                        lineStyle: {
                            color: "#6b6b6b",
                        },
                    },
                    axisTick: { show: true },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(107,107,107,0.32)",
                        },
                    },
                    axisLabel: {
                        inside: true,
                        showMinLabel: false,
                        showMaxLabel: true,
                        fontSize: 12,
                    },
                    axisPointer: {},
                },
                {
                    gridIndex: 1,
                    splitNumber: 3,
                    position: "right",
                    silent: true,
                    axisLine: {
                        onZero: false,
                        show: false,
                        lineStyle: {
                            color: "#6b6b6b",
                        },
                    },
                    axisTick: {
                        show: false,
                    },
                    splitLine: { show: false },
                    axisLabel: {
                        show: false,
                    },
                    axisPointer: {
                        show: false,
                        label: {
                            show: false,
                        },
                    },
                },
                {
                    gridIndex: 2,
                    splitNumber: 4,
                    position: "right",
                    silent: true,
                    axisLine: {
                        onZero: false,
                        show: false,
                        lineStyle: {
                            color: "#6b6b6b",
                        },
                    },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: {
                        show: false,
                    },
                    axisPointer: {
                        show: false,
                        label: {
                            show: false,
                        },
                    },
                },
            ],
            dataZoom: [
                {
                    type: "inside",
                    xAxisIndex: [0, 0],
                    start: this._echart_option.start,
                    end: this._echart_option.end,
                    maxSpan: this._echart_option.maxSpan,
                    minSpan: this._echart_option.minSpan,
                    zoomLock: this._echart_option.zoomLock,
                },
                {
                    show: false,
                    xAxisIndex: [0, 1],
                    type: "slider",
                    top: "97%",
                    start: this._echart_option.start,
                    end: this._echart_option.end,
                    maxSpan: this._echart_option.maxSpan,
                    minSpan: this._echart_option.minSpan,
                    zoomLock: this._echart_option.zoomLock,
                },
                {
                    show: false,
                    xAxisIndex: [0, 2],
                    type: "slider",
                    start: this._echart_option.start,
                    end: this._echart_option.end,
                    maxSpan: this._echart_option.maxSpan,
                    minSpan: this._echart_option.minSpan,
                    zoomLock: this._echart_option.zoomLock,
                },
            ],
            series: [
                {
                    type: "candlestick",
                    data: this.showKlineDates.datas,
                    // data: aData,
                    itemStyle: {
                        normal: {
                            color: this.riseColor, // 阳线填充颜色
                            color0: this.fallColor, // 阴线填充颜色
                            borderColor: this.riseColor,
                            borderColor0: this.fallColor,
                        },
                    },
                    markPoint: {
                        label: {
                            normal: {
                                formatter: function(param) {
                                    return param != null ? param.value : "";
                                },
                            },
                        },
                        data: [
                            {
                                name: "highest value",
                                type: "max",
                                symbol: "2",
                                valueDim: "highest",
                                itemStyle: {
                                    normal: {
                                        color: "none",
                                    },
                                },
                                label: {
                                    color: "#cccccc",
                                },
                            },
                            {
                                name: "lowest value",
                                type: "min",
                                symbol: "2",
                                valueDim: "lowest",
                                itemStyle: {
                                    normal: {
                                        color: "none",
                                    },
                                },
                                label: {
                                    color: "#cccccc",
                                },
                            },
                        ],
                    },
                },
                {
                    name: "MA",
                    type: "line",
                    symbol: "none",
                    data: this.calculateMA(5),
                    smooth: true,
                    lineStyle: {
                        normal: {
                            opacity: 0.6,
                            color: "#00FFFF",
                            width: 1,
                        },
                    },
                },
                {
                    name: "MA",
                    type: "line",
                    symbol: "none",
                    data: this.calculateMA(10),
                    smooth: true,
                    lineStyle: {
                        normal: {
                            opacity: 0.6,
                            color: "#EE00EE",
                            width: 1,
                        },
                    },
                },
                {
                    name: "MA",
                    type: "line",
                    symbol: "none",
                    data: this.calculateMA(30),
                    smooth: true,
                    lineStyle: {
                        normal: {
                            opacity: 0.6,
                            color: "#00FF00",
                            width: 1,
                        },
                    },
                },
                {
                    name: "Volumn",
                    type: "bar",
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: this.showKlineDates.vols,
                    itemStyle: {
                        normal: {
                            color: (params) => {
                                const index = params.dataIndex;
                                if (
                                    that.showKlineDates.datas[index][1] >
                                    that.showKlineDates.datas[index][0]
                                ) {
                                    return this.riseColor;
                                } else {
                                    return this.fallColor;
                                }
                            },
                        },
                    },
                },
                {
                    name: "MACD",
                    type: "bar",
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    data: this.showKlineDates.MACD,
                    itemStyle: {
                        normal: {
                            color: params => {
                                let colorList;
                                if (params.data >= 0) {
                                    colorList = this.riseColor;
                                } else {
                                    colorList = this.fallColor;
                                }
                                return colorList;
                            },
                        },
                    },
                    barWidth: 2,
                },
                {
                    name: "DIF",
                    type: "line",
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    symbol: "none",
                    lineStyle: {
                        width: 1,
                        normal: {
                            color: "#EE6363",
                            width: 1,
                        },
                    },
                    data: this.showKlineDates.DIF,
                },
                {
                    name: "DEA",
                    type: "line",
                    symbol: "none",
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    lineStyle: {
                        width: 1,
                        normal: {
                            color: "#D4D4D4",
                            width: 1,
                        },
                    },
                    data: this.showKlineDates.DEA,
                },
            ],
        };
    }

    computeAvgPrice(realTimeData: any[]) {
        let sum = 0,
            arrTemp = [],
            n = 0;
        for (let i = 0; i < realTimeData.length; i++) {
            if (!realTimeData[i]) {
                //undefiend
                arrTemp.push(undefined);
            } else {
                sum += realTimeData[i].price;
                n++;
                arrTemp.push(Math.round((sum / n) * 100) / 100);
            }
        }
        return arrTemp;
    }

    //数组处理
    splitData(rawData) {
        let datas = [];
        let times = [];
        let vols = [];
        let macds = [];
        let difs = [];
        let deas = [];

        for (let i = 0; i < rawData.length; i++) {
            datas.push(rawData[i]);
            times.push(rawData[i].splice(0, 1)[0]);
            vols.push(rawData[i][4]);
            macds.push(rawData[i][6]);
            difs.push(rawData[i][7]);
            deas.push(rawData[i][8]);
        }
        return {
            datas: datas,
            times: times,
            vols: vols,
            macds: macds,
            difs: difs,
            deas: deas,
        };
    }

    //MA计算公式
    calculateMA(dayCount) {
        let result = [];
        let len =
            this.showKlineDates.times.length > this.showKlineDates.datas.length
                ? this.showKlineDates.datas.length
                : this.showKlineDates.times.length;
        for (let i = 0; i < len; i++) {
            if (i < dayCount) {
                result.push("-");
                continue;
            }
            let sum = 0;
            for (let j = 0; j < dayCount; j++) {
                sum += this.showKlineDates.datas[i - j][1];
            }
            result.push((sum / dayCount).toFixed(8));
        }
        
        return result;
    }

    pushEchartsData() {
        let nowTime: any;
        let length: number;
        let updateSwitch: boolean = true;
        // 新的报表推送
        this.echartsData.forEach(item => {
            let newTime = new Date(this.funcTimeFormat(item.endTime)).getTime();
            let lastTime = new Date(
                this.funcTimeFormat(this._LAST_TIME),
            ).getTime();
            if (!updateSwitch || newTime < lastTime) {
                updateSwitch = false;
                return;
            }
            nowTime = moment(item.beginTime).add(
                this.DATE_TYPE[this.timeType][0],
                this.DATE_TYPE[this.timeType][1],
            );
            this.klineDatas.times.push(
                this.funcTimeFormat(item.beginTime, this.timeType),
            );
            this.klineDatas.datas.push([
                item.start * 1,
                item.end * 1,
                item.min * 1,
                item.max * 1,
            ]);
            this.klineDatas.vols.push(item.amount / 1);
        });
        if (updateSwitch) {
            length = this.klineDatas.datas.length || 0;
            // 生成展示数据，保存的报表 + 这个时间段的
            this.showKlineDates.times = this.klineDatas.times.concat();
            this.showKlineDates.datas = this.klineDatas.datas.concat();
            this.showKlineDates.vols = this.klineDatas.vols.concat();
            if (length) {
                this.showKlineDates.times.push(
                    nowTime.format(this.FORMATS[this.timeType] || "YYYY-MM-DD"),
                );
                this.showKlineDates.datas.push([
                    this.klineDatas.datas[length - 1][1] * 1,
                    this.klineDatas.datas[length - 1][1] * 1,
                    this.klineDatas.datas[length - 1][1] * 1,
                    this.klineDatas.datas[length - 1][1] * 1,
                ]);
                this.showKlineDates.vols.push(0);
            }

            // 如果数据过少 本地生成
            if (this.showKlineDates.times.length < this.MIN_TIME_LENGTH) {
                let length =
                    this.MIN_TIME_LENGTH - this.showKlineDates.times.length;
                for (let i = 0; i < length; i++) {
                    this.showKlineDates.times.push(
                        nowTime
                            .add(
                                this.DATE_TYPE[this.timeType][0],
                                this.DATE_TYPE[this.timeType][1],
                            )
                            .format(
                                this.FORMATS[this.timeType] || "YYYY-MM-DD",
                            ),
                    );
                }
            }
            // 一些指标参数生成
            this.QUOTA(this.showKlineDates.datas);

            this.chartInstance.setOption({
                xAxis: [
                    {
                        data: this.showKlineDates.times,
                    },
                    {
                        data: this.showKlineDates.times,
                    },
                    {
                        data: this.showKlineDates.times,
                    },
                ],
                series: [
                    {
                        data: this.showKlineDates.datas,
                    },
                    {
                        data: this.calculateMA(5),
                    },
                    {
                        data: this.calculateMA(10),
                    },
                    {
                        data: this.calculateMA(30),
                    },
                    {
                        data: this.showKlineDates.vols,
                    },
                    {
                        data: this.showKlineDates.MACD,
                    },
                    {
                        data: this.showKlineDates.DIF,
                    },
                    {
                        data: this.showKlineDates.DEA,
                    },
                ],
            });
        }
    }

    createCharts() {
        //    this.splitData();
        this.tradeChartV2Page.changeTimeEnable = true;
        console.log("......", this.echartsData);
        this.integrationData();

        let that = this;

        console.log("kline-report:showLineRangeColor", true);
        // console.log('realtime-report:linecolor',option.series[0].lineStyle.normal.color)
        // 使用刚指定的配置项和数据显示图表。

        if (this.show) {
            if (this.echartsData.length > 0 || this.nowTimeArr.beginTime) {
                this.chartInstance.setOption(this.option);
                setTimeout(() => {
                    this.chartInstance.hideLoading();
                }, 500);
            }
        }

        // this.chartInstance.resize();
    }

    inputDataValid() {
        return !!Array.isArray(this.echartsData);
    }

    integrationData() {
        if (!Array.isArray(this.echartsData)) {
            return;
        }
        let _length = 0;
        let _nowPriceArr = [];

        let _price = Number(this.price.price) || 0;
        let _date = moment();
        this.klineDatas.times = [];
        this.klineDatas.datas = [];
        this.klineDatas.vols = [];
        for (let i in this.showKlineDates) {
            this.showKlineDates[i] = [];
        }
        // 数据整合

        this.echartsData.forEach(item => {
            if (item.beginTime != item.endTime) {
                this.klineDatas.times.push(
                    this.funcTimeFormat(item.beginTime, this.timeType),
                );
                // 固定格式 [开，收，低，高]
                this.klineDatas.datas.push([
                    this._numberFormatAdd0(item.start * 1),
                    this._numberFormatAdd0(item.end * 1),
                    this._numberFormatAdd0(item.min * 1),
                    this._numberFormatAdd0(item.max * 1),
                ]);
                this.klineDatas.vols.push(item.amount / 1);
            }
        });
        this._LAST_TIME = this.echartsData[this.echartsData.length - 1]
            ? this.echartsData[this.echartsData.length - 1].beginTime
                ? this.echartsData[this.echartsData.length - 1].beginTime
                : this.funcTimeFormat()
            : this.funcTimeFormat();
        _length = this.klineDatas.datas.length;
        this.showKlineDates.times = this.klineDatas.times.concat();
        this.showKlineDates.datas = this.klineDatas.datas.concat();
        this.showKlineDates.vols = this.klineDatas.vols.concat();
        // 查看是否 有过去的报表.如果有，新时间段的开 = 最后报表的收
        if (this.showKlineDates.datas.length) {
            _nowPriceArr[0] = [this.klineDatas.datas[_length - 1][0] * 1];
        }

        // 查看 新时间段的接口
        // 如果 开有值 取开，否则 判断是否有值 ，没有的话取当前价格
        if (this.nowTimeArr && this.nowTimeArr.start) {
            _nowPriceArr[0] = this.nowTimeArr.start * 1;
        } else {
            _nowPriceArr[0] = (_nowPriceArr[0] || _price) * 1;
        }
        // 如果 收有值 取收，否则取当前价格
        if (this.nowTimeArr && this.nowTimeArr.end) {
            _nowPriceArr[1] = this.nowTimeArr.end * 1;
        } else {
            _nowPriceArr[1] = _price * 1;
        }

        // 排查 高低，如果高/低 没有， 就从 开/收 取
        _nowPriceArr[2] = this.nowTimeArr.min * 1 || 0;
        _nowPriceArr[3] = this.nowTimeArr.max * 1 || 0;
        if (!_nowPriceArr[2]) {
            _nowPriceArr[2] =
                _nowPriceArr[0] * 1 > _nowPriceArr[1] * 1
                    ? _nowPriceArr[1] * 1
                    : _nowPriceArr[0] * 1;
        }
        if (!_nowPriceArr[3]) {
            _nowPriceArr[3] =
                _nowPriceArr[0] * 1 > _nowPriceArr[1] * 1
                    ? _nowPriceArr[0] * 1
                    : _nowPriceArr[1] * 1;
        }

        // 最新时间段
        if (this.nowTimeArr.beginTime) {
            _date = moment(this.nowTimeArr.beginTime || moment()).add(
                1,
                "milliseconds",
            );
            this.showKlineDates.times.push(
                moment(this.nowTimeArr.beginTime || moment())
                    .add(1, "milliseconds")
                    .format(this.FORMATS[this.timeType] || "YYYY-MM-DD"),
            );
            console.log(_nowPriceArr);
            this.showKlineDates.datas.push(_nowPriceArr);
            // this.showKlineDates.datas = [[50,40,20,80]]
            this.showKlineDates.vols.push(this.nowTimeArr.amount / 1);
        }

        // 如果数据过少 本地生成
        if (this.showKlineDates.times.length < this.MIN_TIME_LENGTH) {
            let length =
                this.MIN_TIME_LENGTH - this.showKlineDates.times.length;
            for (let i = 0; i < length; i++) {
                this.showKlineDates.times.push(
                    _date
                        .add(
                            this.DATE_TYPE[this.timeType][0],
                            this.DATE_TYPE[this.timeType][1],
                        )
                        .format(this.FORMATS[this.timeType] || "YYYY-MM-DD"),
                );
            }
        }
        // 一些指标参数生成
        this.QUOTA(this.showKlineDates.datas);

        // 配置
        this._echart_option.zoomLock =
            this.showKlineDates.datas.length < this.MIN_TIME_LENGTH;
        this._echart_option.start = Math.floor(
            (1 - this.MIN_TIME_LENGTH / this.showKlineDates.times.length) * 100,
        );
        console.log("K 整合数据", this.klineDatas);
    }
    funcTimeFormat(time?: any, type?: any) {
        return moment(time || moment()).format(
            this.FORMATS[type] || "YYYY-MM-DD HH:mm",
        );
    }

    ionViewWillLeave() {
        this.chartInstance.dispose();
    }
    showQuotas(quota) {
        this.saveQuotas[quota.title] = quota.active;
        let option: any = {
            legend: {
                show: false,
                selected: {},
            },
        };
        if (quota.title) {
            option.legend.selected[quota.title] = quota.active;
        }
        this.chartInstance.setOption(option);
    }
    transactionChange() {
        let length: number = this.klineDatas.datas.length
            ? this.klineDatas.datas.length
            : 1;
        let price = Number(this.price.price);
        let amount = this.price.amount / 1;
        // 比较高低
        this.showKlineDates.datas[length - 1][1] =
            price * 1 || this.showKlineDates.datas[length - 1][1] * 1;
        if (this.showKlineDates.datas[length - 1][2] * 1 > price * 1) {
            this.showKlineDates.datas[length - 1][2] = this._numberFormatAdd0(price * 1);
        }
        if (this.showKlineDates.datas[length - 1][3] * 1 < price * 1) {
            this.showKlineDates.datas[length - 1][3] = this._numberFormatAdd0(price * 1);
        }

        // 数据量增加
        this.showKlineDates.vols[length - 1] =
            this.showKlineDates.vols[length - 1] +
            (amount >= 0 ? amount : 0 - amount);

        // 一些指标参数生成
        this.QUOTA(this.showKlineDates.datas);

        this.chartInstance.setOption({
            series: [
                {
                    data: this.showKlineDates.datas,
                },
                {
                    data: this.calculateMA(5),
                },
                {
                    data: this.calculateMA(10),
                },
                {
                    data: this.calculateMA(30),
                },
                {
                    data: this.showKlineDates.vols,
                },
                {
                    data: this.showKlineDates.MACD,
                },
                {
                    data: this.showKlineDates.DIF,
                },
                {
                    data: this.showKlineDates.DEA,
                },
            ],
        });
    }
    QUOTA(dataArr) {
        this.EMA12(dataArr);
        this.EMA26(dataArr);
        this.DIF();
        this.DEA();
        this.MACD();
    }
    EMA12(dataArr) {
        this.showKlineDates.EMA12 = [];
        // EMA（12）=前一日EMA（12）×11/13＋今日收盘价×2/13
        dataArr.forEach((item, index) => {
            let lastEMA12 = this.showKlineDates.EMA12[index - 1] || 0;
            let EMA12 = (lastEMA12 * 11) / 13 + (item[1] * 2) / 13;
            this.showKlineDates.EMA12.push(EMA12);
        });
    }
    EMA26(dataArr) {
        this.showKlineDates.EMA26 = [];
        // EMA（26）=前一日EMA（26）×25/27＋今日收盘价×2/27
        dataArr.forEach((item, index) => {
            let lastEMA26 = this.showKlineDates.EMA26[index - 1] || 0;
            let EMA26 = (lastEMA26 * 25) / 27 + (item[1] * 2) / 27;
            this.showKlineDates.EMA26.push(EMA26);
        });
    }
    DIF() {
        this.showKlineDates.DIF = [];
        // DIF=今日EMA（12）－今日EMA（26）
        let length =
            this.showKlineDates.EMA26.length > this.showKlineDates.EMA12.length
                ? this.showKlineDates.EMA12.length
                : this.showKlineDates.EMA26.length;
        for (let i = 0; i < length; i++) {
            this.showKlineDates.DIF.push(
                this.showKlineDates.EMA12[i] - this.showKlineDates.EMA26[i],
            );
        }
    }
    DEA() {
        this.showKlineDates.DEA = [];
        // 当日 DEA ( 9 ) = 2/ ( 9+1 ) DIFF+ ( 9-1 ) / ( 9+1 )前日 DEA
        this.showKlineDates.DIF.forEach((item, index) => {
            let lastDEA = this.showKlineDates.DEA[index - 1] || 0;
            let DEA = (2 / 10) * item + (8 / 10) * lastDEA;
            this.showKlineDates.DEA.push(DEA);
        });
    }
    MACD() {
        this.showKlineDates.MACD = [];
        // MACD=2×(DIFF - DEA)
        let length =
            this.showKlineDates.DIF.length > this.showKlineDates.DEA.length
                ? this.showKlineDates.DEA.length
                : this.showKlineDates.DIF.length;
        for (let i = 0; i < length; i++) {
            this.showKlineDates.MACD.push(
                this.showKlineDates.DIF[i] - this.showKlineDates.DEA[i],
            );
        }
    }
    _numberFormatAdd0( number: string | number) {
        const precision = isNaN(this.pricePrecision)? 8 : this.pricePrecision;
        let numberArr = ('' + number).split(".");
        let zero: string = "";
        if (numberArr.length > 1) {
            for (let i = 0; i < precision - numberArr[1].length; i++) {
                zero += "0";
            }
            
        } else {
            zero = ".";
            for (let i = 0; i < precision; i++) {
                zero += "0";
            }
        }
        return number + zero;
    }
}
