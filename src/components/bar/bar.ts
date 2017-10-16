import { Component, Input } from '@angular/core';
import { EchartsBaseComponent } from '../echarts-base/echarts-base';

@Component({
  selector: 'bar-component',
  template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class BarComponent extends EchartsBaseComponent {
  @Input() barTitle: any;

  // constructor() {
  // 
  // }

  backInOut(k) {
    var s = 1.70158 * 1.525;
    if ((k *= 2) < 1) { return 0.5 * (k * k * ((s + 1) * k - s)); }
    return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
  }

  createCharts() {    
    const echartsData = this.echartsData;
    // 指定图表的配置项和数据
  const option = {
    backgroundColor:'transparent',
    title : {
      text: this.barTitle,
      x:'center',
      textStyle:{
        color:'#fff',
        fontWeight:'normal',
        fontSize:'15'
      },
      subtext: ''
    },
    tooltip : {
      trigger: 'axis'
    }, 
    grid: {
      left: '0',
      right:'0',
      bottom: '3',
      containLabel: false
    },
    xAxis : [
    {
      type : 'category',
      splitLine: {show: false},
      splitNumber: {show: false},
      axisTick:{show: false},
      axisLine:{
        show: true,
        lineStyle:{color:'rgb(125,206,228)',},
      },
      axisLabel:{
        textStyle:{
          color:'#fff',
        }
      },
      data : echartsData[0],
    }
    ],
    yAxis : [
    {
      type : 'value',
      show:false,
    }
    ],
    series : [
    {
      name:'',
      type:'bar',
      barWidth:'35%',
      // barCategoryGap:'10%',
      itemStyle: {
        normal: {
          color: 'rgb(125,206,228)',
          // barBorderColor: 'tomato',
          // barBorderWidth: 6,
          // barBorderRadius:0,
          label : {
            show: true, 
            textStyle:{
              color:'#fff',
            },
            position: 'top'
          }
        }
      },
      data:echartsData[1],
    },
    ]
    };

    // 使用刚指定的配置项和数据显示图表。
    this.chartInstance.setOption(option);
  }

}
