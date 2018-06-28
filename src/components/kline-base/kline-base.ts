// import { Component, ViewChild, Input, OnChanges, OnDestroy, NgZone } from '@angular/core';
import { Component, ViewChild, Input, OnChanges, OnDestroy } from '@angular/core';
import { LoadingController, } from 'ionic-angular';
import * as echarts from 'echarts';
import { TradeChartV2Page } from '../../pages/trade-chart-v2/trade-chart-v2';
import { AccountServiceProvider } from '../../providers/account-service/account-service';
@Component({
    selector: 'line-base-component',
    template: `<div class="echarts-placeholder" #echartsPlaceholder></div>`,
})
export class KlineEchartsBaseComponent implements OnChanges, OnDestroy {
    constructor(
        // protected ngZone: NgZone,
        public loadingCtrl: LoadingController,
        public tradeChartV2Page: TradeChartV2Page,
        public accountService: AccountServiceProvider,
    ) {

    }
   

    @Input() echartsData: any;
    @Input() options: any;
    @Input() timeType: any;
    @Input() traderId: any;
    @Input() price: any;
    @Input() quota: any;
    
    @ViewChild('echartsPlaceholder') chartElem;

    public show:boolean = false;
    public nowTimeArr:any = {
        beginTime: '',
        value:{}
    };
    chartInstance: echarts.ECharts;

    showLoading() {
        this.chartInstance.showLoading('default',{
            text: '',
            color: '#c1b17f',
            maskColor: 'rgba(255, 255, 255, 0)',
        });
    }
    async ngOnInit() {
        this.chartInstance = echarts.init(this.chartElem.nativeElement as HTMLDivElement);
        this.showLoading();
        await this.accountService.getDeliverType(this.traderId,this.timeType).then( data => {
            console.log('1111,',this.price)
            this.show = true;
            this.nowTimeArr = data||  {
                beginTime: '',
                value:{}
            };
        }).catch( () => this.show = false );
        this.firstCallEchartsCreator();
    }

    async ngOnChanges(changes) {
        // console.log('chart ngOnChanges', Object.keys(changes));
        console.log('charts changed:ngOnChanges', changes)  
        
        if( changes.echartsData ) {
            // 报表
            if( !this._FIRST_ECHART && changes.echartsData.currentValue && changes.echartsData.currentValue.length == 1) {
                this.pushEchartsData()
            } else if(changes.echartsData.currentValue){
                console.log('k线图 changes.echartsData.currentValue  ' ,changes.echartsData.currentValue)
                await this.accountService.getDeliverType(this.traderId,this.timeType).then( data => {
                    console.log('1111,',this.price)
                    this.show = true;
                    this.nowTimeArr = data||  {
                        beginTime: '',
                        value:{}
                    };
                }).catch( () => this.show = false );
                this.showLoading();
                this.callEchartsCreator();
            }
            
        } else if( changes.quota ) {
            // 指标
            this.showQuotas(changes.quota.currentValue);
        } else if( changes.price ) {
            this.transactionChange()
        }
         
        
    }

    ngOnDestroy() {
        // console.log('chart destroy');
        if (this.chartInstance){
            this.chartInstance.dispose();
            this.chartInstance = null;
        }

        // const canvasList = (this.realTimeCharts.nativeElement as HTMLDivElement).querySelectorAll('canvas');
        // for (let i = 0; i < canvasList.length; i++){
        //     canvasList[i].parentNode.removeChild(canvasList[i]);
        // }
    }

    createCharts() {
        // this.myChart.resize();
        throw new Error('createCharts method must called within derived class!');
    }

    inputDataValid(): boolean {
        return true;
    }

    transactionChange() {
        throw new Error('createCharts method must called within derived class!');
    }

    showQuotas(quota) {
        throw new Error('createCharts method must called within derived class!');
    }
    
    private _RUN_LOADING:boolean = false ;
    private _FIRST_ECHART:boolean = true;
 
    firstCallEchartsCreator() {
        if( this._RUN_LOADING ) {
            return void 0;
        }
        this._RUN_LOADING = true;
     
    
        this._RUN_LOADING = false;
        this._FIRST_ECHART = false;
        if (this.echartsData && this.echartsData.length > 0 && this.inputDataValid()) {
            setTimeout(() => {
                if (this.chartInstance) {
                    this.createCharts()
                    // this.ngZone.runOutsideAngular(() => {
                    //     this.createCharts()
                    // });
                } else {
                    this.callEchartsCreator();
                }
            }, 0);
        } else if(!this.echartsData || this.echartsData.length <= 0) {
            setTimeout(() => {
                this.callEchartsCreator();
            }, 0);
        }
       

    }

    pushEchartsData() {
        if( this._FIRST_ECHART) {
            return void 0;
        }
        throw new Error('createCharts method must called within derived class!');
    }

    
    callEchartsCreator() {
   
        if( this._FIRST_ECHART) {
            return void 0;
        }

        if (this.echartsData && this.inputDataValid()) {
            this._RUN_LOADING = false;
           
            setTimeout(() => {
                if (this.chartInstance) {
                    this.createCharts()
                    // this.ngZone.runOutsideAngular(() => {
                    //     this.createCharts()
                    // });
                }
            }, 0);
        } 
    }

    resize(){
        // 图表的缩放处理。
        // 需要将 svg 的容器宽度样式先删除，否则从宽缩到窄时，
        // 外层的界面会无法自适应。
        // 使用了 setTimeout 进行样式的异步处理！
        // 此处暂时只处理了宽度问题，未处理高度。
        if (this.chartElem){
            const chartElem = this.chartElem.nativeElement as HTMLElement;
            const container = chartElem.firstChild as HTMLElement;
            container.style.width = '';
            setTimeout(() => {
                (<any>this.chartInstance).resize({width: window.getComputedStyle(chartElem).width});
            }, 0);
        }
    }

}
