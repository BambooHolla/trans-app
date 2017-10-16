import { Component } from '@angular/core';
import 'echarts-liquidfill';

import { EchartsBaseComponent } from '../echarts-base/echarts-base';

@Component({
  selector: 'liquid-component',
  template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class LiquidComponent extends EchartsBaseComponent {
  // constructor() {
  //   super();
  // }

  createCharts() {
    // var data = this.liquiddata;
    // 指定图表的配置项和数据
    const option={
      // backgroundColor: 'rgb(48, 166, 199)',
      backgroundColor: 'transparent',
      title: {
        text: '',
        subtext: '',
        textStyle: {
          fontSize: 12,
          color: '#19B8E0',
        },
        subtextStyle: {
          fontSize: 15,
          color: '#999',
        },

        textAlign: 'center',
        textBaseAlign: 'middle'
      },
      tooltip: {
        show: true,
      },
      series: [{
        color: ['rgba(74,173,202,0.3)', 'rgba(74,173,202,0.4)'],
        amplitude: 8,
        name: 'Liquid Fill',
        waveLength: '100%',
        type: 'liquidFill',
        // silent: true,
        // animationDurationUpdate: 200,
        data: this.echartsData,
        radius: '95%',
        direction: 'left',
        outline: {
          show: false,
          borderDistance: 0,
          itemStyle: {
            borderWidth: 5,
            borderColor: '#156ACF',
            shadowBlur: 20,
            shadowColor: 'rgba(255, 0, 0, 1)'
          }
        },
        backgroundStyle: {
          borderColor: 'rgb(43,145,186)',
          borderWidth: 5,
          // shadowColor: 'rgba(43,145,186, 0.8)',
          // shadowBlur: 100,
          color: '#2d2d2d'
        },
        shape: 'circle',
        label: {
          normal: {
            position: ['50%', '48%'],
            textStyle: {
              fontSize: 18
            }
          }
        }
      }]
    }
    
    // 使用刚指定的配置项和数据显示图表。
    this.chartInstance.setOption(option);
  }

}
