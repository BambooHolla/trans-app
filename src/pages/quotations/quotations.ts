import { Component, ViewChildren, ViewChild, ElementRef, Renderer,  } from '@angular/core';
// import { Slides, NavController } from 'ionic-angular';
import { NavController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { QuotationDetailPage } from '../quotation-detail/quotation-detail';
import { StockDetailPage } from '../stock-detail/stock-detail';
import { SearchItemPage } from "../search-item/search-item-page";

import { RealTimeChartsComponent } from '../../components/realtime-charts/realtime-charts';

import { AppSettings } from '../../providers/app-settings';
import { SocketioService } from '../../providers/socketio-service';
import { StockDataService } from '../../providers/stock-data-service';
import { AppDataService } from '../../providers/app-data-service';
import { Subject } from 'rxjs/Subject';
import { TradeInterfacePage } from "../trade-interface/trade-interface";
import { TradeService } from '../../providers/trade-service';

@Component({
	selector: 'page-quotations',
	templateUrl: 'quotations.html'
})
export class QuotationsPage {
	@ViewChild('searchInputWrap', { read: ElementRef }) searchInputWrap;
	showSearch = false
	private searchTermStream = new BehaviorSubject<string>('');
	search(term: string) {
		// console.log('searched');
		this.searchTermStream.next(term);
	}

	tradeInterface: any = TradeInterfacePage;

	traderList: object[] = new Array()
	traderList_show: object[] = new Array()
	tempArray = new Array(5)
	realtimeReports$: Observable<any>

	quotationDetailPage: any = QuotationDetailPage;
	stockDetailPage: any = StockDetailPage;
	searchItemPage: any = SearchItemPage;
	stockCode: string;
	// stockCode = ['000001','000002','010001'];
	restoreTimer = null;

	useTempData: BehaviorSubject<boolean> = new BehaviorSubject(false);

	useTempData$ = this.useTempData
		.asObservable()
		.distinctUntilChanged();

	tempData: BehaviorSubject<AnyObject> = new BehaviorSubject({
		latestPrice: 0,
		maxPrice: 0,
		minPrice: 0,
		yesterdayPrice: 0,
		startPrice: 0,
		turnoverQuantity: 0,
		turnoverAmount: 0,
		changeValue: 0,
		changeRate: 0,
		avgPrice: 0,
	});

	tempData$ = this.tempData
		.asObservable()
		.distinctUntilChanged();

	showData: AnyObject = {};

	private _baseData$: Observable<any>;

	private _realtimeData$: Observable<any>;

	private viewDidLeave: BehaviorSubject<boolean> = new BehaviorSubject(undefined);
	private viewDidLeave$ = this.viewDidLeave
		.asObservable()
		.distinctUntilChanged()
		.filter(value => value === true);

	private lastRealtimeStockList: string[] = [];
	private realtimeStockList: BehaviorSubject<string[]> = new BehaviorSubject([]);
	private realtimeStockList$ = this.realtimeStockList
		.asObservable()
		.distinctUntilChanged();

	@ViewChildren(RealTimeChartsComponent) charts;

	_thisPageActive: boolean = false;

	activeIndex: BehaviorSubject<number> = new BehaviorSubject(-1);

	// activeSectorType: string = '';

	// sectorStockDetailList: any[] = [];

	realtimeOptions = {
		tooltipShow: false,
		showAxisBoundaryLabel: false,
		customTooltip: true,
		xAxisShow: false,
		axisLabelShow: false,
		yAxisStyle: {
			color: 'rgba(255, 255, 255, 0.2)',
			type: 'dashed',
		},
		textColor: 'rgba(255, 255, 255, 1)',
		gridLeft: '0',
		gridTop: '10px',
		gridBottom: '0px',
		xAxisInside: false,
		yAxisSplitLine: false,
		align: 'bottom',
		yAxisSize: '10',
	};

	realtimeOption = {
		customTooltip: true,
		xAxisShow: true,
		axisLabelShow: false,
		yAxisStyle: {
			color: 'rgba(255, 255, 255, 0.2)',
			type: 'dashed',
		},
		textColor: 'rgba(255, 255, 255, 1)',
		gridLeft: '0',
		gridTop: '0px',
		gridBottom: '10px',
		xAxisInside: true,
		yAxisSplitLine: true,
		align: 'top',
		yAxisSize: '10',
		// area: {
		// 	normal: {
		// 		color: {
		// 			type: 'linear',
		// 			x: 0,
		// 			y: 0,
		// 			x2: 0,
		// 			y2: 1,
		// 			colorStops: [{
		// 				offset: 0, color: 'rgb(204,255,255)' // 0% 处的颜色
		// 			}, {
		// 				offset: 1, color: 'rgb(51,153,204)' // 100% 处的颜色
		// 			}],
		// 		}
		// 	}
		// },
	};
	constructor(
		public navCtrl: NavController,
		public appSettings: AppSettings,
		public appDataService: AppDataService,
		public socketioService: SocketioService,
		public stockDataService: StockDataService,
		public tradeService: TradeService,
		public renderer:Renderer,
	) {
		// this.changeActive(0);
	}

	ngOnInit() {
		this.subscribeRealtimeReports()
		this.searchTermStream
			// .takeUntil(this.viewDidLeave$)
			.debounceTime(300)
			.distinctUntilChanged()
			.switchMap((term: string) => Observable.of(term.trim().toLowerCase()))
			.subscribe((string) => {
				// const reg = new RegExp(string)
				this.traderList_show = this.traderList.filter((item: any, index, arr) => {
					return item.traderName.toLowerCase().indexOf(string) !== -1
				}).sort((a:any, b:any) => {
					return a.priceId - b.priceId
				})
			})
	}

	ionViewWillEnter(){
	}

	ionViewDidEnter() {
		console.log('quotations did enter')
		this.viewDidLeave.next(false);

		this.doSubscribe();
		// 延时后再设置 _thisPageActive 的值，是为了配合下面强制销毁 echarts 元素的操作。
		// 对于 echarts 元素的强制销毁，实际上并没有销毁元素本身，
		// 因此需要在 ionViewDidEnter() 触发后渲染视图时，根据 _thisPageActive = false 的条件，
		// 让模板引擎销毁 echarts 元素，
		// 然后再用延时的 _thisPageActive = true ，在一定时间后重新渲染这些元素。
		setTimeout(() => {
			this._thisPageActive = true;
		}, 200);
	}

	ionViewWillLeave() {
		// 将要离开当前页时，设置 _thisPageActive 为 false ，
		// 配合视图上的 ngIf ，让 echarts 图表被销毁，
		// 避免持续占据 cpu 资源。
		// 此处理不可以放在 onDestroy 中，因为 QuotationsPage 是 Tabs 的一级页面，
		// 切换 Tab 时不会触发 destroy 。
		// 也不能放在 ionViewDidLeave 中，因为离开页面后，视图不会重新渲染，
		// 因此需要放在 ionViewWillLeave 中。
		this._thisPageActive = false;

		// 仅仅使用 _thisPageActive 来控制 echarts 图表是否显示，是不完善的。
		// 因为如果切换 tabsPage ，并且切换的目标是一个已经显示过的页面，
		// 则 ionViewWillLeave() 与 ionViewDidLeave() 的执行间隔会非常非常短，
		// 结果导致当前视图没有重新渲染就前往了其他视图，
		// 这样 echarts 元素上的 *ngIf 就不会被触发，导致 echarts 不会被销毁，
		// 会一直占据着系统资源。
		// 目前的解决方案是 hack 方式，在离开页面 1 秒钟之后，若 echarts 元素仍然存在，
		// 就由程序将其强制销毁（元素实际上并未被销毁，只是销毁了 canvas 子元素，并调用 ngOnDestroy 方法）。
		setTimeout(() => {
			this.destoryCharts()
		}, 1e3)
	}

	ionViewDidLeave() {
		this.viewDidLeave.next(true);
		// realtimeStockList 的设置要放在 viewDidLeave 的设置之后，
		// 以便先触发 takeUntil() 。
		// 此处将 realtimeStockList 设置为空数组，
		// 会立刻引发退订操作。
		// 可以考虑对此使用延时，但可能需要结合 ionViewWillLeave 的 takeUntil() ，
		// 避免反复切换页面时，订阅被延时的退订冲掉。
		this.realtimeStockList.next([]);
	}

	// ionViewCanLeave() 可以返回布尔值或 Promise ，
	// 但它只对 navPush 或 navPop 等行为有效，
	// 对 TabsPage 的切换是无效的！
	// ionViewCanLeave() {
	// 	return new Promise(resolve => {
	// 		setTimeout(() => {
	// 			resolve()
	// 		}, 1000)
	// 	});
	// }

	toShowSearch(){
		this.showSearch = true
		this.renderer.setElementStyle(this.searchInputWrap.nativeElement,'width','unset')
	}

	cancelFilter(){
		this.showSearch = false;
		this.traderList_show = this.traderList;
	}

	destoryCharts() {
		if (this._thisPageActive === false && this.charts) {
			// console.log(this.charts);
			for (const chart of this.charts.toArray()) {
				const chartElem = chart.chartElem.nativeElement as HTMLDivElement;
				const childNodes = chartElem.childNodes;
				if (childNodes) {
					[].forEach.call(childNodes, child => {
						chartElem.removeChild(child);
					});
				}
				chart.ngOnDestroy();
				// const chartComponent = chartElem.parentElement;
				// chartComponent.parentElement.removeChild(chartComponent);
			}
		}
	}

	doSubscribe() {
		// 板块行情页面应当使用行情的代码！
		// 目前使用固定的股票代码，只是用于测试，之后必须予以修正。
		const stockCode = this.stockCode;
		if (!this._baseData$) {
			this._baseData$ = this.stockDataService.stockBaseData$
				.map(data => data[stockCode])
				.do(data => console.log('_baseData$',data))
		}
		if (!this._realtimeData$) {
			this._realtimeData$ = this.stockDataService.stockRealtimeData$
				.map(data => data[stockCode])
				.do(data => console.log('_realtimeData$', data))
		}
		this.stockDataService.requestStockBaseData(stockCode)
			.catch(() => { });

		Observable
			.combineLatest(
			this._baseData$,
			this.useTempData$,
			this.tempData$,
		)
			.takeUntil(this.viewDidLeave$)
			.subscribe(([baseData, useTempData, tempData]) => {
				this.showData = useTempData ? tempData : baseData;
			})

		// Observable
		// 	.combineLatest(
		// 	this.activeIndex,
		// 	this.stockDataService.sectorData$,
		// )
		// 	.takeUntil(this.viewDidLeave$)
		// 	.distinctUntilChanged(([oldIndex, oldSectorData], [newIndex, newSectorData]) => {
		// 		// distinctUntilChanged() 的比较是浅比较。
		// 		// 此处自定义 distinctUntilChanged 的回调函数来实现深比较（有限深度），
		// 		// 对于 stockCodeList ，需要逐个比较其元素。
		// 		// 返回值为 true ，表示数据未变化；返回 false 表示已变化。
		// 		if (oldIndex !== newIndex) {
		// 			return false;
		// 		} else if (oldSectorData === newSectorData) {
		// 			return true;
		// 		} else {
		// 			const sectorType = this.activeSectorType;
		// 			const oldStockList = oldSectorData[sectorType].stockCodeList;
		// 			const newStockList = newSectorData[sectorType].stockCodeList;
		// 			if (oldStockList === null || newStockList === null) {
		// 				return oldStockList === newStockList;
		// 			}
		// 			return oldStockList.length === newStockList.length &&
		// 				oldStockList.every((stockCode, index) => newStockList[index] === stockCode);
		// 		}
		// 	})
		// 	.subscribe(([, sectorData]) => {
		// 		// console.log('sectorStockList')
		// 		const sectorType = this.activeSectorType;
		// 		const { stockCodeList } = sectorData[sectorType];
		// 		if (stockCodeList) {
		// 			this.sectorStockDetailList = stockCodeList.map(stockCode => ({
		// 				baseData: this.stockDataService.stockBaseData$.map(data => data[stockCode]),
		// 			}));

		// 			this.lastRealtimeStockList = this.realtimeStockList.getValue().concat();
		// 			this.realtimeStockList.next(stockCodeList.concat());
		// 			console.log('sectorStockList: ', stockCodeList)
		// 			stockCodeList.forEach(stockCode => {
		// 				if (this.lastRealtimeStockList.indexOf(stockCode) !== -1) {
		// 					return;
		// 				}

		// 				this.stockDataService.requestStockBaseData(stockCode)
		// 					.catch(() => { });

		// 				this.stockDataService
		// 					.subscibeRealtimeData(
		// 					stockCode,
		// 					undefined,
		// 					Observable.merge(
		// 						this.viewDidLeave$,
		// 						this.realtimeStockList$.filter(arr => arr.indexOf(stockCode) === -1),
		// 					),
		// 				)
		// 					.takeUntil(Observable.merge(
		// 						this.viewDidLeave$.delay(this.appSettings.UNSUBSCRIBE_INTERVAL),
		// 						this.realtimeStockList$.filter(arr => arr.indexOf(stockCode) === -1),
		// 					))
		// 					.subscribe();
		// 			})
		// 		}
		// 	})
	}

	/**
	 * 获取多支行情数据
	 * TODO:迁移到数据中心处理
	 */
	async subscribeRealtimeReports(){
		await this.appDataService.traderListPromise;
		const srcTraderList = (this.appDataService.traderList.size ? this.appDataService.traderList
			: await this.tradeService.getTradeList()) as Map<string,AnyObject>
		// const traderList = [...this.appDataService.traderList.keys()]
		const traderIdList = []
		const traderList = []
		srcTraderList.forEach((value,key,map)=>{
			traderList.push(value)
			traderIdList.push(key)
		})
		this.traderList = traderList
		this.traderList_show = this.traderList
		console.log('teee', this.viewDidLeave.getValue())
		this.realtimeReports$ = this.socketioService.subscribeRealtimeReports(traderIdList)
			.do(() => console.log('realtimeReports$ success'))
			// .takeUntil(this.viewDidLeave$)
		
		console.log('teee', this.realtimeReports$)
		
		const refCount = this.realtimeReports$.multicast(new Subject()).refCount()		

		srcTraderList.forEach((value, key, map) => {
			value.reportRef = refCount
				// .takeUntil(this.viewDidLeave$)
				.filter(({ type})=>{
					console.log('subscribeRealtimeReports success!')
					return type === value.traderId
				})
				.map(data=>data.data)
				.map(data => {
					//处理增量更新
					const srcArr = value.reportArr
					srcArr.push(...data)//使用push+解构赋值,预期echarts动画实现
					const length = srcArr.length
					if( length > this.appSettings.Charts_Array_Length){
						srcArr.splice(0, length - this.appSettings.Charts_Array_Length)
					}
					return srcArr.concat()
				})
			// value.marketRef = this.stockDataService
			// 	.subscibeRealtimeData(value.traderId, 'price')//, this.viewDidLeave$)
			// 	.map(data=>{
			// 		console.log('quotations ma')
			// 		if(data){
			// 			if (data.amout) value.marketData = data //有交易量的时候其他参数才会变化
			// 			else if (!value.marketData) value.marketData = data //若本来没数据,则先赋上初始值.
			// 		} 
					
			// 		return value.marketData
			// 	})
			// // (value.marketRef as BehaviorSubject<object>).from(this.stockDataService
			// // 	.subscibeRealtimeData(value.traderId, 'price'))
			// 	.do(data=>console.log('marketData:',data))
			console.log('value.traderId',value.traderId)
			this.stockDataService
				.subscibeRealtimeData(value.traderId, 'price')
				.subscribe(value.marketRef)//, this.viewDidLeave$)
		})
	}

	// 由于各个板块的股票数量很少，没有必要按照“涨幅”、“跌幅”等分类列出，
	// 因此停用板块个股列表的 slides 。
	// 
	// Slides 控件在界面上向后切换时，若当前激活的是最后一个 silde ，
	// 则依然会触发切换事件，并且目标索引值等于 silde 的数量，
	// 也就是最后一个有效索引值加 1 。
	// 当前索引值为 0 、并且向前切换时，没有这个问题。
	// 可能是 Ionic 的一个 bug 。
	// 此代码的功能：在向后切换越界时，强制将其调整到最后一个索引值处。
	// tabChange(slides) {
	// 	const destIndex = slides._snapIndex;
	// 	if (slides.isEnd() && slides.getActiveIndex() === destIndex + 1) {
	// 		slides.slideTo(destIndex, 0);
	// 	}
	// }

	// changeActive(index) {
	// 	if (this.activeIndex.getValue() !== index) {
	// 		this.activeSectorType = this.stockDataService.sectorList[index].sectorType;
	// 		this.activeIndex.next(index);
	// 		this.stockDataService.requestEquitiesOfSector(this.activeSectorType)
	// 			.catch(() => { });
	// 	}
	// }

	switchToTempData() {
		this.useTempData.next(true);

		if (this.restoreTimer) {
			clearTimeout(this.restoreTimer);
		}

		this.restoreTimer = setTimeout(() => {
			this.useTempData.next(false);
			this.restoreTimer = null;
		}, 3e3);
	}

	// showRealtimeQutationTooltip(data) {
	// 	const realtimeData = this.stockDataService.getStockRealtimeData(this.stockCode);
	// 	const dataItem = realtimeData[data[0].dataIndex];
	// 	const baseData = this.stockDataService.getStockBaseData(this.stockCode);
	// 	if (!dataItem || !baseData) {
	// 		return;
	// 	}
	// 	const changeValue = data[0].data - (baseData ? baseData.yesterdayPrice : 0);
	// 	const changeRate = baseData && baseData.yesterdayPrice ?
	// 		changeValue / baseData.yesterdayPrice : 0;

	// 	this.tempData.next({
	// 		...this.tempData.getValue(),
	// 		latestPrice: data[0].data,
	// 		avgPrice: data[1].data,
	// 		turnoverQuantity: dataItem.turnoverQuantity,
	// 		turnoverAmount: dataItem.turnoverAmount,
	// 		changeValue,
	// 		changeRate,
	// 	});
	// 	this.switchToTempData();
	// }
}