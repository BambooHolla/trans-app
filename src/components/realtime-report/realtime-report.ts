import { Component, Input, Output, EventEmitter, } from '@angular/core';
import { EchartsBaseComponent } from "../echarts-base/echarts-base";

/**
 * Generated class for the RealtimeReportComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'realtime-report',
  template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class RealtimeReportComponent extends EchartsBaseComponent {

  // @Input() baseData: any;
  // @Input() tradingTimeArray: any;

  @Output() tooltipEmitted: any = new EventEmitter();

  computeAvgPrice(realTimeData: any[]) {
    let sum = 0,
      arrTemp = [],
      n = 0;
    for (let i = 0; i < realTimeData.length; i++) {
      if (!realTimeData[i]) {  //undefiend
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
            y: 1,
            x2: 1,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(193,177,127,.1)' // 0% 处的颜色
            }, {
              offset: 1, color: 'rgba(193,177,127,.8)' // 100% 处的颜色
            }],
          }
        }
      },
      seriesColor = '#fff',
      axisLabelColor = '#fff',
      rangeColor = ['#ff4238', '#30d94c'],
      seriesLineColor = 'orange',
      showTimeLabelPerHour = true,
    } = options;

    window['temp_price'] = 50
//item.value.avg || 
    const priceData = this.echartsData.map(item => 
      (window['temp_price'] = Math.random() > 0.5 ? 
        window['temp_price'] + Number((Math.random() * 5).toFixed(2)) : 
        window['temp_price'] - Number((Math.random() * 5).toFixed(2))
      ));
    const tradingTimeArray = this.echartsData.map(item => { 
      //处理时间
      const timestamp = new Date(item.beginTime)
      const time = `${timestamp.getHours()}:${timestamp.getMinutes()}`
      return time
    });
    console.log('priceData:', priceData)
    console.log('tradingTimeArray:', tradingTimeArray)
    // const turnoverQuantity = this.echartsData.map(item => item.turnoverQuantity);

    // let mid = this.baseData.yesterdayPrice;
    // 指定图表的配置项和数据

    const avgPriceData = this.computeAvgPrice(this.echartsData as any[]);
    // const maxSpan = Math.max(mid / 100, priceData.reduce((max, value) =>
    //   value ? Math.max(Math.abs(value - mid), max) : max,
    //   0));

    const option = {
      tooltip: {
        show: tooltipShow,
        trigger: 'axis',
        extraCssText: 'width: 88px',
        position: function (pos, params, el, elRect, size) {
          var obj = { top: 10 };
          obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 60;
          return obj;
        },
        formatter: customTooltip ? (params) => {
          const dataIndex = params[0].dataIndex;
          if (this.lastTooltipDataIndex !== dataIndex) {
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
        data: tradingTimeArray,
        axisLabel: {
          textStyle: {
            color: axisLabelColor
          },
          inside: xAxisInside,
          show: axisLabelShow,
          // interval: (59),
          margin: 3,
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
          textStyle: {
            color: axisLabelColor,
            baseline: align,
            fontSize: yAxisSize,
          },
          show: axisLabelShow,
          inside: true,
          // interval: 2,
          formatter: function (value) {
            return value.toFixed(4)
          },
          lineStyle: {
            color: '#505050'
          }
        },
        // scale: true,
        // max: mid + maxSpan,
        // min: mid - maxSpan,
        // max: mid + maxSpan * 1.1,
        // min: mid - maxSpan * 1.1,
        splitNumber: 1,
        minInterval: 0.01,
        // interval: maxSpan,
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
            baseline: align,
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
        // max: maxSpan / mid,
        // min: -maxSpan / mid,
        // data: [maxSpan / mid * 1.1, maxSpan / mid, -maxSpan / mid, -maxSpan / mid * 1.1],
        // boundaryGap: ['20%', '20%'],
        zlevel: 100,
      }],
      dataZoom: [{
        type: 'inside',
        filterMode: 'filter',
        zoomLock: true,
        preventDefaultMouseMove:false,
        startValue: tradingTimeArray.length - 1 - 60*24,//一分钟一条数据,取24小时的数据
        endValue: tradingTimeArray.length - 1
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
          areaStyle: area,//折线包围面积颜色
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
    // console.log(option)
    // 使用刚指定的配置项和数据显示图表。
    this.chartInstance.setOption(option);
    // this.chartInstance.resize();
  }

  inputDataValid() {
    return !!Array.isArray(this.echartsData);
  }

}
