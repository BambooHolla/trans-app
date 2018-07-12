import { FLP_Lifecycle } from "./FLP_Lifecycle";
import {
    NavController,
    NavOptions,
    NavParams,
    ViewController,
} from "ionic-angular";
import { asyncCtrlGenerator } from "./Decorator";
import { AccountServiceProvider } from "../providers/account-service/account-service";
import { IframepagePage } from "../pages/iframepage/iframepage";
import { PAGE_STATUS } from "./const";

export class FLP_Route extends FLP_Lifecycle {
    constructor(public navCtrl: NavController, public navParams: NavParams) {
        super();
    }
    _navCtrlPush(path: string, params?: any, opts?: NavOptions, done?: any) {
        return this.navCtrl.push(path, params, opts, done);
    }
    @FLP_Route.FromGlobal accountService: AccountServiceProvider;

    /** 路由loading显示与否的控制器 */
    hide_jump_loading = true;
    current_routeTo_page = "";

    static jump_loading_message = {
        msg: "",
        toString() {
            return this.msg;
        },
    };
    static jump_error_title = {
        title: "",
        toString() {
            return this.title;
        },
    };

    // JOB模式
    // 页面A为了实现某个任务，打开页面B
    // 页面B完成任务后，返回页面A，触发任务完成的回调
    // 这个流程相关的API
    viewCtrl: ViewController;
    finishJob(is_force_remove_view?: boolean) {
        this.navParams.data["is_finish_job"] = true;
        if (
            this.navParams.get("remove_view_after_finish") ||
            is_force_remove_view
        ) {
            setTimeout(() => {
                const viewCtrl = this.viewCtrl;
                if (viewCtrl) {
                    this.navCtrl.removeView(this.viewCtrl);
                } else {
                    console.warn(
                        "使用remove_view_after_finish必须注入viewCtrl: ViewController对象",
                    );
                    this.PAGE_STATUS === PAGE_STATUS.DID_ENTER &&
                        this.navCtrl.pop();
                }
            }, 500);
        }
    }
    @FLP_Route.didLeave
    private _doAfterFinishJob() {
        // 检查页面退出后要做的事情，从上一级页面传下来的
        if (this.navParams.get("is_finish_job")) {
            const after_finish_job = this.navParams.get("after_finish_job");
            if (after_finish_job instanceof Function) {
                after_finish_job();
            }
        }
    }

    /** 页面跳转专用的核心函数
     *  内置了跳转拦截的功能，需要通过registerRouteToBeforeCheck来注册拦截检测器
     */
    routeTo(path: string, ...args: any[]): Promise<any>;
    @asyncCtrlGenerator.loading(
        FLP_Route.jump_loading_message,
        "hide_jump_loading",
        {
            showBackdrop: false,
            cssClass: "can-tap",
        },
    )
    @asyncCtrlGenerator.error(FLP_Route.jump_error_title)
    async routeTo(path: string, params?: any, opts?: any, force = false) {
        if (this.current_routeTo_page === path && !force) {
            // 禁止重复点击
            return;
        }
        try {
            this.current_routeTo_page = path;
            // 参数重置
            this.hide_jump_loading = true;
            FLP_Route.jump_loading_message.msg =
                window["language"]["PLEASE_WAIT_2"] || "请稍候";
            FLP_Route.jump_error_title.title =
                window["language"]["PAGE_SWITCH_ERROR"] || "页面切换异常";
            // 开始执行
            const checkInfo = await FLP_Route.doRouteToBeforeCheck(
                this,
                path,
                params,
                opts,
            );
            if (checkInfo.preventDefault) {
                console.log("页面发生重定向");
                return;
            }
            params = Object.assign(checkInfo.to_next_params, params);
            return await this._navCtrlPush(path, params, opts);
        } finally {
            this.current_routeTo_page = "";
        }
    }
    async routeToThenElse(condition, then_path, else_path) {
        if (condition instanceof Promise) {
            condition = await condition;
        }
        const path = condition ? then_path : else_path;
        if (path instanceof Array) {
            this.routeTo(path[0], path[1], path[2]);
        } else {
            this.routeTo(path);
        }
    }

    // @FLP_Route.FromNavParams ignore_check_set_real_info: string;
    static registerRouteToBeforeCheck(
        match: string | string[] | RouteToBeforeCheck_Match,
        checker: RouteToBeforeCheck_Checker,
        weight = 0,
        name?: string,
    ) {
        if (typeof match === "string") {
            const match_path = match;
            match = path => match_path === path;
        }
        if (match instanceof Array) {
            const match_paths = match;
            match = path => match_paths.indexOf(path) !== -1;
        }
        this.ROUTE_TO_BEFORE_CHECK_LIST.push({
            name,
            match,
            checker,
            weight,
        });
        this.ROUTE_TO_BEFORE_CHECK_LIST.sort((a, b) => a.weight - b.weight);
    }
    static ROUTE_TO_BEFORE_CHECK_LIST: Array<RouteToBeforeCheck> = [];
    static async doRouteToBeforeCheck(
        self: FLP_Route,
        path: string,
        params?: any,
        opts?: any,
    ) {
        const to_next_params = {};
        let preventDefault = false;
        for (
            var i = 0, C: RouteToBeforeCheck;
            (C = this.ROUTE_TO_BEFORE_CHECK_LIST[i]);
            i += 1
        ) {
            const check_label = `CHECK ${i + 1}:${C.name || "NO-NAME"}`;
            console.time(check_label);
            if (C.match(path, params, opts)) {
                if (
                    await C.checker(self, to_next_params, {
                        path,
                        params,
                        opts,
                    })
                ) {
                    i = Infinity;
                    preventDefault = true;
                }
            }
            console.timeEnd(check_label);
        }
        return {
            preventDefault,
            to_next_params,
        };
    }

    /**
     * 智能跳转，尝试使用pop，如果是上一级的页面
     */
    smartRouteTo(path?: string, params?: any, opts?: NavOptions) {
        const views = this.navCtrl.getViews();
        const pre_view = views[views.length - 2];
        if (pre_view.id === path) {
            Object.assign(pre_view.getNavParams().data, params);
            return this.navCtrl.pop();
        } else {
            return this.routeTo(path, params, opts);
        }
    }
    /**
     * 重定向页面
     */
    setRedirectUrl(
        redirect_url,
        title?: string,
        options?: {
            auto_close_when_redirect?: boolean;
            navbar_color?: string;
            after_nav_pop?: () => void;
        },
    ) {
        // this.redirect_url = this.sanitizer.bypassSecurityTrustResourceUrl(redirect_url);
        if (localStorage.getItem("disabled-iframe")) {
            navigator["clipboard"].writeText(redirect_url);
            return;
        }
        this.modalCtrl
            .create(
                IframepagePage,
                Object.assign(
                    {
                        title,
                        // 地址
                        redirect_url,
                        // 在第三方iframe页面加载出来后要显示给用户的提示
                        load_toast: "", //"操作完成后请点击左上角的返回按钮"
                        // 在第三方页面进行再跳转的时候，强制关闭页面
                        auto_close_when_redirect: true,
                    },
                    options,
                ),
            )
            .present();
    }
}

type RouteToBeforeCheck = {
    name: string;
    match: RouteToBeforeCheck_Match;
    checker: RouteToBeforeCheck_Checker;
    weight: number;
};
type RouteToBeforeCheck_Match = (
    path: string,
    params?: any,
    opts?: any,
) => boolean;
type RouteToBeforeCheck_Checker = (
    self: FLP_Route,
    to_next_params: any,
    route_to_args: {
        path: string;
        params?: any;
        opts?: any;
    },
) => Promise<undefined | boolean> | undefined | boolean;
