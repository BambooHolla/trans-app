import { Component, Input, Output, EventEmitter, } from '@angular/core';
import { EchartsBaseComponent } from '../echarts-base/echarts-base';

@Component({
  selector: 'candlestick-component',
  template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class CandlestickComponent extends EchartsBaseComponent {
    // constructor(
    // 
    // ) {
    //     super();
    // }

  @Input() candlestickTitle: any;

  @Output() tooltipEmitted = new EventEmitter<any>();

  private lastTooltipDataIndex = -1;

  createCharts() {
      //数组处理
      function splitData(rawData) {
          const datas = [];
          const kdatas = [];
          const times = [];
          const vols = [];
          // const macds = [];
          // const difs = [];
          // const deas = [];
          for (let item of rawData) {
              kdatas.push();
              datas.push([
                  item.startPrice,
                  item.endPrice,
                  item.minPrice,
                  item.maxPrice,
                  item.yesterdayPrice,
                  item.turnoverQuantity/10000,
                  item.turnoverAmount/10000,
              ]);
              times.push(item.date);
              vols.push(item.turnoverQuantity);
              // macds.push(item[7]);
              // difs.push(item[8]);
              // deas.push(item[9]);
          }
          return {
              kdatas,
              datas,
              times,
              vols,
              // macds,
              // difs,
              // deas,
          };
      }
      const data = splitData(this.echartsData);

    //MA计算公式
    // 修改算法，不使用低效的嵌套循环
    function calculateMA(dayCount) {
        const result = [];
        let sum = 0;

        for (let i = 0, len = Math.min(data.times.length, dayCount - 1); i < len; i++) {
            sum += data.datas[i][1];
            result.push('-');
        }

        for (let i = dayCount - 1, len = data.times.length; i < len; i++) {
            sum += data.datas[i][1];
            result.push(Math.round(sum / dayCount * 100) / 100);
            sum -= data.datas[i - dayCount + 1][1];
        }

        return result;
    }
    
    const options = this.options || {};
    const {
        gridLeft = '5px',
        gridRight = '5px',
        gridTop = '5px',
        gridBottom = '5px',
        xAxisShow = true,
        yAxisShow = true,
        splitLineShow=false,
        axisLineShow=false,
        yAxisLabel = {
            margin: 0,
            textStyle: {
                fontSize: 10,
                color:'#fff'
            },
        },
        ySplitLine = {
            show: true,
            lineStyle: {
                color:'#999',
                // color:'transparent',
            }
        },
        ySplitNumber = 3,
        customTooltip = false,
        specialallTooltip = false,
    } = options;

    function splitSeries(seriesData){
          const scolor = [];
          const snum= [];
          for (var i = 0; i < seriesData.length; i++) {
            snum.push(seriesData[i][0]);
            scolor.push(seriesData[i][1])
          }
          return {
              snum,
              scolor,
          };
    }
   
    var seriesList=[];
    seriesList.push(
      {
            name: 'KLine',
            type: 'candlestick',
            data: data.datas,
            itemStyle: {
                normal: {
                    color: '#DD3838',
                    color0: '#44D63D',
                    borderColor: '#DD3838',
                    borderColor0: '#44D63D',
                }
            },
            animation: false,
        }, 
    );
    if(options.candlestickcalculateList!=null){
      const seriesdata=splitSeries(options.candlestickcalculateList);
      for(var i=0;i<=seriesdata.scolor.length;i++){
        seriesList.push({
          name: 'MA5',
          type: 'line',
          data: calculateMA(seriesdata.snum[i]),
          smooth: true,
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: {
            normal: {
              width:1,
              color:seriesdata.scolor[i],
            }
          },
          itemStyle:{
            normal: {
              color: 'transparent',
            }
          },
          animation: false,
        })
      }
    }
    var candlestickdataLength=this.echartsData.length;
    var start=Math.floor(100 - (6000 / this.echartsData.length));
    // console.log(candlestickdataLength,start)
    var zoomList=[];
    var intervarcandle=15;
    if(candlestickdataLength<=60){
     var axismax=60;
     zoomList.push(
     {
       type: 'inside',
       xAxisIndex: [0],
       startValue:0,
       endValue :60,
       minValueSpan: 20
     }, 
     );
    }
    else{
      intervarcandle=parseInt((data.times.length/4.1).toString());
      zoomList.push(
      {
        type: 'inside',
        xAxisIndex: [0],
        start: start,
        end:100,
        minValueSpan: 20
      }, 
      );
    }
    // const startValue=candlestickdataLength-60;
    // const endValue=candlestickdataLength;
    // const start=startValue/candlestickdataLength;

    
    // 指定图表的配置项和数据
    const option = {
        legendHoverLink:'true',
        backgroundColor: 'transparent',
        title: {
            text: this.candlestickTitle,
        },
        // 关闭点击时的数据浮动显示。
        // （视觉效果太差，暂时关闭，以后再寻找更好的解决方式）
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: 'rgba(255,255,255,0.3)',
                    width: 2,
                }
            },
            alwaysShowContent:false,
            hideDelay : 0,
            triggerOn : 'mousemove|click',
            showDelay: 0,             // 显示延迟，添加显示延迟可以避免频繁切换，单位ms
            position: function (pos, params, el, elRect, size) {
                var obj = {top: 10};
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            },
           
            formatter: (params) => {
              if (customTooltip){
                  const dataIndex = params[0].dataIndex;
                  if (this.lastTooltipDataIndex !== dataIndex){
                      this.lastTooltipDataIndex = dataIndex;
                      this.tooltipEmitted.emit(params);
                  }
              } else {
                if(specialallTooltip){
                  this.tooltipEmitted.emit(params);
                }
                var res = params[0].name;
                res += '<br/>' + params[0].seriesName;
                res += '<br/>  开盘 : ' + params[0].value[1] + '  最高 : ' + params[0].value[4];
                res += '<br/>  收盘 : ' + params[0].value[2] + '  最低 : ' + params[0].value[3];
                return res;
              }
            }
        },
        dataZoom:zoomList,
        grid: [{
            left: gridLeft,
            right: gridRight,
            top: gridTop,
            bottom: gridBottom,
        }],
        xAxis: [{
            name: '时间',
            type: 'category',
            show: xAxisShow,
            splitLine: {
                show: splitLineShow,
                lineStyle:{
                    color:'transparent',
                }
            },
            // splitNumber: 5,
            axisTick:{
                inside:true,
                lineStyle:{
                    color:'#fff',
                }
            },
            axisLabel:{
                  interval:intervarcandle,
                // interval:15,
                showMinLabel:false,
                showMaxLabel:true,
                margin:-10,
                textStyle:{
                    color:'#fff',

                }
            },
            boundaryGap: false,
            axisLine: {
                show: false,
                lineStyle:{
                    color:'#fff',
                }
            },
            data: data.times,
            min: 'dataMin',
            max: axismax,
            // max: 60,
        }],
        yAxis: {
            type: 'value',
            name: '',
            scale:true,
            color:'#fff',
            show: yAxisShow,
            axisTick: {
                show: false,
            },
            axisLine: {
                show: axisLineShow,
                lineStyle: {
                    color: '#fff'
                }
            },
            axisLabel: yAxisLabel,
            splitLine: ySplitLine,
            splitNumber: ySplitNumber,
            zlevel : 1,
            min: 'dataMin',
            max: 'dataMax',
        },
        series: seriesList,
    };
    // 使用刚指定的配置项和数据显示图表。
    this.chartInstance.setOption(option);
    // this.resize();
  }
}
