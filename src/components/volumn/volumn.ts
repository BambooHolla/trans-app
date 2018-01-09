import { Component, Input , Output, EventEmitter, } from '@angular/core';
import { EchartsBaseComponent } from '../echarts-base/echarts-base';

@Component({
  selector: 'volumn-component',
  template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class VolumnComponent extends EchartsBaseComponent {
  @Input() volumnTitle: any;
  @Output() volumnEmitted = new EventEmitter<any>();

  // constructor() {
  // 
  // }

  createCharts() {
    const echartsData = this.echartsData;

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
                //   item.yesterdayPrice,
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
    var data = splitData(echartsData);
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
              result.push((sum / dayCount).toFixed(2));
              sum -= data.datas[i - dayCount + 1][1];
          }

          return result;
      }
      const options = this.options || {};
      const {
        // gridLeft = '5px',
        // gridRight = '5px',
        // gridTop = '5px',
        // gridBottom = '5px',
        // xAxisShow = true,
        // yAxisShow = true,
        // splitLineShow=false,
        // axisLineShow=false,
        // yAxisLabel = {
        //   margin: 0,
        //   textStyle: {
        //     fontSize: 10,
        //     color:'#fff'
        //   },
        // },
        // ySplitLine = {
        //   show: true,
        //   lineStyle: {
        //     color:'#999',
        //     // color:'transparent',
        //   }
        // },
        // ySplitNumber = 3,
        // customTooltip = false,
      } = options;
      const volumndataLength = Math.max(60, echartsData.length);
      const startValue=volumndataLength-60;
      const endValue=volumndataLength;
      // var zoomStart=startValue;
      // var zoomEnd=endValue;
      var zoomLength=parseInt(((endValue)/4.1).toString());
      
      // 指定图表的配置项和数据
      var option = {
          backgroundColor: 'transparent',
          title: {
              text: this.volumnTitle,
          },
          tooltip: {
              trigger: 'axis',
              axisPointer: {
                  type: 'cross',
                  // type: 'line',
                  lineStyle: {
                      color: 'rgba(255,255,255,0.3)',
                      width: 2,
                  }
              },
              backgroundColor: 'rgba(245, 245, 245, 0.8)',
              // borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              textStyle: {
                  color: '#000'
              },
              position: function (pos, params, el, elRect, size) {
                  return {
                    top: 10,
                    [['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]]: 30,
                  };
              },
              // formatter: function (params) {
              //   var sty='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:';
              //   var i=0;
              //   if(params[i].value[1]==undefined){
              //     i=1;
              //   }
              //   var res = '<span style="' + sty + params[i].color + '"></span>';
              //   res +=  params[0].name;
              //   res += '<br/>  开盘 : ' + params[i].value[1] ;
              //   res += '<br/>  收盘 : ' + params[i].value[2] ;
              //   res += '<br/>  最低 : ' + params[i].value[3] ;
              //   res += '<br/>  最高 : ' + params[i].value[4] ;
              //   res += '<br/> 成交量 : ' + params[i].value[5]  ;

              //   return res;
              // },
              formatter: (params) => {
                  this.volumnEmitted.emit(params);
              },
              extraCssText: 'width: 120px'
          },
          axisPointer: {
              link: {xAxisIndex: 'all'},
              label: {
                  backgroundColor: '#777'
              }
          },
          grid: [{
              left: '0',
              right:'0',
              top: '5%',
              height: '49%'
          },{
              left: '0',
              right:'0',
              top: '66%',
              height: '26%'
          }],
          dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            startValue,
            endValue,
            minValueSpan: 25
          },
          {
            show: true,
            xAxisIndex: [0, 1],
            type: 'inside',
            startValue,
            endValue,
            minValueSpan: 25
          }
          ],
          xAxis: [{
              type: 'category',
              data: data.times,
              scale: true,
              boundaryGap: false,
              axisLine: {
                  onZero: false,
                  show: false,
              },
              axisTick: {show: false,},
              splitLine: { show: false },
              axisLabel:{
                  // interval:parseInt(((zoomEnd-zoomStart)/4.1).toString()),
                  interval:zoomLength,
                  // interval:15,
                  showMinLabel:false,
                  showMaxLabel:true,
                  textStyle:{
                      color:'#fff',
                  }
              },
              splitNumber: 3,
              min: 'dataMin',
              max: 'dataMax',
          },{
              type: 'category',
              gridIndex: 1,
              scale:true,
              boundaryGap: false,
              axisLine: {
                  onZero: false,
                  show:false,
              },
              splitLine: { show: false },
              axisLabel:{
                  interval: Math.floor(data.times.length/4.1),
                  // interval:15,
                  showMinLabel:false,
                  showMaxLabel:true,
                  margin:5,
                  textStyle:{
                      color:'#fff',
                  }
              },
              axisTick:{
                  inside: true,
                  lineStyle:{
                      color:'#fff',
                  }
              },
              data: data.times,
              min: 'dataMin',
              max: 'dataMax',
          }],
          yAxis: [{
              type: 'value',
              name: '',
              scale:true,
              color:'#fff',
              show: true,
              axisTick: {
                  show: false,
              },
              splitLine: { show: false },
              axisLine: {
                  show: false,
                  lineStyle: {
                      color: '#fff'
                  }
              },
              axisLabel: {
                  inside:true,
                  showMinLabel:true,
              },
              minInterval: 2,
              splitNumber: 1,
              zlevel : 1,
              min: 'dataMin',
              max: 'dataMax',
          },{
              show:true,
              gridIndex: 1,
              scale:true,
              position: 'right',
              axisTick: {
                  show: false,
                  inside:false,
              },
              axisLine: {
                  show: false,
                  lineStyle: {
                      color: '#fff'
                  }
              },
              axisLabel: {
                  inside:true,
                  showMinLabel:false,
                  showMaxLabel:false,
                  // formatter: function (v) {
                  //     return Math.round(v/10000) + ' 万'
                  // }
              },
              splitNumber: 2,
              splitLine: { show: false },
              zlevel : 1,
              min: 'dataMin',
              max: 'dataMax',
          }],
          series: [{
              name: 'KLine',
              type: 'candlestick',
              data: data.datas,
              itemStyle: {
                  normal: {
                      color: '#d95654',
                      color0: '#80c269',
                      borderColor: '#d95654',
                      borderColor0: '#80c269'
                  }
              },
              animation: false,
          },
              {
                  name: 'MA5',
                  type: 'line',
                  data: calculateMA(5),
                  smooth: true,
                  showSymbol: false,
                  symbol: 'circle',
                  symbolSize: 5,
                  lineStyle: {
                      normal: {
                          color:'rgba(254, 53, 53, .6)',
                          width:1,
                      }
                  },
                  itemStyle: {
                      normal: {
                          color: 'rgba(255, 255, 255,1)',
                          borderColor: 'rgba(255, 255, 255,0.6)',
                          borderWidth: 12

                      }
                  },
                  animation: false,
              },{
                  name: '成交量',
                  type: 'bar',
                  xAxisIndex: 1,
                  yAxisIndex: 1,
                  data: data.vols,
                  legendHoverLink:true,
                  itemStyle: {
                      normal: {
                          color: function (params) {
                              return data.datas[params.dataIndex][1] > data.datas[params.dataIndex][0] ?
                                '#d95654' :
                                '#80c269';
                          },
                      }
                  }
          }]
      };
      // 使用刚指定的配置项和数据显示图表。
      this.chartInstance.setOption(option);
      // this.resize();
      // this.chartInstance.on('datazoom', function (params) {
      //   zoomStart = params.batch[0].start*volumndataLength/100;
      //   zoomEnd = params.batch[0].end*volumndataLength/100;
      //   console.log(zoomStart,zoomEnd);
      //   zoomLength=parseInt(((zoomEnd-zoomStart)/4.1).toString())
      //   setInterval(function () {
      //     this.chartInstance.setOption(option);
      //   }, 0);
      // });
  }

}
