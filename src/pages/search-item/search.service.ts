import {Injectable} from '@angular/core';
import { Http, Headers, Response, URLSearchParams} from "@angular/http";

import { Observable } from "rxjs/Observable";
import { AppDataService } from "../../providers/app-data-service";
import { AppSettings } from "../../providers/app-settings";


@Injectable()
export class SearchService {

    constructor(
        private http: Http,
        public appDataService: AppDataService,
        public AppSettings: AppSettings,
    ) {
        
    }

    search(term: string) {
        let serverUrl = ``//${this.AppSettings.SERVER_URL}/api/v1/gjs/biz/equities/info`
        
        let params = new URLSearchParams();
        params.set('equityCode', term);
        console.dir(params.toString())

        const headers = new Headers();
        headers.append('X-AUTH-TOKEN', this.appDataService.token);
        headers.append('x-bnqkl-platform', this.AppSettings.Platform_Type);

        return this.http
            .get(serverUrl, {
                search: params,
                headers: headers,
            })
            // .do(value => console.dir("1: " + value))
            .map(response => response.json())
            .map(json => {
                const resData = json.data
                // let data: EquityInfo[] = [];
                let data = [];                
                //后端返回异常处理
                if (!resData) {
                    if (json.error) {
                        throw (json)
                    } else {
                        console.dir(json)
                    }
                } else {
                    //FID_GQDM	股权代码
                    //FID_GQMC	股权名称
                    //FID_PYDM	拼音代码
                    //FID_GQLB	股权类别
                    //FID_ZSP	昨收盘
                    //FID_ZXJ	最新价
                    //FID_LX	利息
                    //FID_CPID	产品集
                    //FID_JJJYBZ	净价交易标志
                    //FID_JYDW	交易单位
                    //FID_JYJS	交易基数
                    //FID_ZGB	总股本
                    //FID_ZED	总额度
                    //FID_FXRQ	发行日期
                    //FID_FXJ	发行价
                    //FID_SSRQ	上市日期
                    //FID_JYZT	交易状态
                    //FID_JSSJ	结束时间
                    //FID_ZGBJ	最高报价
                    //FID_ZDBJ	最低报价
                    //FID_WTSX	委托上限
                    //FID_WTXX	委托下限
                    //FID_TZXX	投资下限
                    //FID_XQXZ	星期限制
                    //FID_XGDM	相关代码
                    //FID_XJFS	限价方式
                    //FID_BZ	币种
                    //FID_JYJW	交易价位
                    //FID_MMXZ	买卖限制
                    //FID_FLLB	费率类别
                    //FID_EN_WTLB	委托类别范围
                    //FID_JYXZ	交易限制
                    //FID_YXSJ	订单有效天数
                    //FID_SLSX	限制股东户数
                    //FID_CCSLXZ	持仓数量限制
                    //FID_CCSLXZ_JG	机构持仓限制
                    //FID_QTZGCCSX	全体职工上限
                    //FID_QTJGCCXX	全体机构下限
                    //FID_CPTX	产品特性
                    //FID_JZJ	基准价类型
                    //FID_GRZDJC	个人最大减持
                    //FID_JGZDJC	机构最大减持
                    //FID_GRSHDRSX	个人当日最大减持
                    //FID_JGSHDRSX	机构当日最大减持
                    //FID_DQRQ	到期日期
                    //FID_KSRQ	开始日期
                    //FID_TJJSRQ	预售截止日期
                    //FID_CPMC	产品全称
                    //FID_PBU	通道机构
                    //FID_TDBH	通道编号
                    //FID_CPDM	产品代码
                    //FID_TZSL	实际募集数量
                    //FID_CODE
                    //FID_MESSAGE	　

                    data = resData.map((item: AnyObject): EquityInfo => ({
                        stockCode: item.FID_GQDM,
                        name: item.FID_GQMC,
                        count: 0,//这个在搜索页没用
                        id: item.FID_PYDM,//这个在搜索页没用
                        latestPrice: item.FID_ZXJ || 0,
                        changeRate: (item.FID_ZXJ - item.FID_ZSP) / item.FID_ZSP || 0,
                        circulationValue: 0,//这个在搜索页没用
                    }))
                }
                return data
            })
            .catch(this.handleError)
    }

    public handleError(error: Response | any, donotThrow) {
        let errMsg: string;
        console.dir(error)
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        if (!donotThrow) {
            return Observable.throw(errMsg);
        } else {
            return [];
        }
    }
}