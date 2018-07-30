import {
    AlertController,
    AlertOptions,
    ToastOptions,
    LoadingController,
    LoadingOptions,
    Loading,
    Content,
    ToastController,
    Modal,
    Alert,
  } from "ionic-angular";
  import { PAGE_STATUS } from "./const";
  import { Toast } from "@ionic-native/toast";
  import { TranslateService } from "@ngx-translate/core";
  import { FLP_Tool } from "./FLP_Tool";
  import { AbortError, PromiseOut } from "./PromiseExtends";
  
  function getTranslateSync(key: string | string[], interpolateParams?: Object) {
    return window["translate"].instant(key, interpolateParams);
  }
  
  const _ERROR_FROM_ASYNCERROR_CODE =
    "CATCHED_ERROR@" +
    Math.random()
      .toString(36)
      .substr(2);
  export const ERROR_FROM_ASYNCERROR = { NAME: "CATCHED_ERROR" };
  export function getErrorFromAsyncerror(keep_throw: boolean) {
    const res = {
      code: _ERROR_FROM_ASYNCERROR_CODE,
    };
    if (keep_throw) {
      return Promise.reject(res);
    }
    return res;
  }
  export function isErrorFromAsyncerror(err) {
    return err && err.code === _ERROR_FROM_ASYNCERROR_CODE;
  }
  
  export function translateMessage(self: FLP_Tool, message: any, arg: any) {
    if (message instanceof Function) {
      message = message(arg);
    }
    return Promise.resolve(message).then(message => {
      message = "" + message;
      if (typeof message === "string" && message.startsWith("@@")) {
        const i18n_key = message.substr(2);
        message = () => self.getTranslate(i18n_key);
      }
      if (message instanceof Function) {
        message = message(arg);
      }
      return message as string;
    });
  }
  
  export function asyncErrorWrapGenerator(
    error_title: any = () => FLP_Tool.getTranslate("ERROR"),
    opts?:
      | AlertOptions
      | ((self: FLP_Tool) => AlertOptions)
      | ((self: FLP_Tool) => Promise<AlertOptions>),
    hidden_when_page_leaved = true,
    keep_throw = false,
    dialogGenerator?: (
      params,
      self: FLP_Tool,
    ) => Modal | Alert | Promise<Modal> | Promise<Alert>,
  ) {
    return function asyncErrorWrap(target, name, descriptor) {
      const source_fun = descriptor.value;
      descriptor.value = function ErrorWrap(...args) {
        var page_leaved = false;
        if ("PAGE_STATUS" in this) {
          this.event.once("didLeave", () => {
            page_leaved = true;
          });
        }
        return source_fun
          .apply(this, args)
          .then(data => {
            if (data && data.__source_err__) {
              // 获取隐藏的异常将其抛出
              return Promise.reject(data.__source_err__);
            }
            return data;
          })
          .catch(err => {
            if (isErrorFromAsyncerror(err)) {
              // 这个error已经弹出过了，就不在弹出了
              return keep_throw ? Promise.reject(err) : err;
            }
            var err_msg;
            if (err instanceof Error) {
              err_msg = err.message;
            } else if (err.message) {
              err_msg = err.message + "";
            } else if (err.exception) {
              err_msg = err.exception + "";
            } else {
              err_msg = err + "";
            }
            console.group("CATCH BY asyncErrorWrapGenerator:");
            console.warn(err);
            console.groupEnd();
            if (hidden_when_page_leaved && page_leaved) {
              console.log(
                "%c不弹出异常提示因为页面的切换 " + (this.cname || ""),
                "color:yellow",
              );
              return getErrorFromAsyncerror(keep_throw);
            }
  
            if (!dialogGenerator) {
              const alertCtrl: AlertController = this.alertCtrl;
              if (!(alertCtrl instanceof AlertController)) {
                console.warn(
                  "需要在",
                  target.constructor.name,
                  "中注入 AlertController 依赖",
                );
                dialogGenerator = (params: { title: string }) => {
                  return {
                    present() {
                      alert(params.title);
                    },
                  } as any;
                };
              } else {
                dialogGenerator = params => {
                  return alertCtrl.create(params);
                };
              }
            }
            const _dialogGenerator = dialogGenerator;
  
            error_title = translateMessage(this, error_title, err);
  
            Promise.all([
              error_title,
              err_msg,
              opts instanceof Function ? opts(this) : opts,
            ]).then(([error_title, err_msg, opts]) => {
              const present_able = _dialogGenerator(
                Object.assign(
                  {
                    title: String(error_title),
                    subTitle: String(err_msg),
                    buttons: [getTranslateSync("OK")],
                  },
                  opts,
                ),
                this,
              );
              Promise.resolve<Modal | Alert>(present_able).then(p => p.present());
            });
            return getErrorFromAsyncerror(keep_throw);
          });
      };
      descriptor.value.source_fun = source_fun;
      return descriptor;
    };
  }
  export function asyncSuccessWrapGenerator(
    success_msg: any = () => FLP_Tool.getTranslate("SUCCESS"),
    position = "bottom",
    duration = 3000,
    hidden_when_page_leaved = true,
  ) {
    return function asyncSuccessWrap(target, name, descriptor) {
      const source_fun = descriptor.value;
      descriptor.value = function SuccessWrap(...args) {
        return source_fun.apply(this, args).then(data => {
          if (isErrorFromAsyncerror(data) || data instanceof AbortError) {
            return data;
          }
          if (
            hidden_when_page_leaved &&
            // this.hasOwnProperty("PAGE_STATUS") &&
            isFinite(this.PAGE_STATUS) &&
            this.PAGE_STATUS > PAGE_STATUS.WILL_LEAVE
          ) {
            console.log("不弹出成功提示因为页面的切换");
            return data;
          }
          success_msg = translateMessage(this, success_msg, data);
  
          if ("plugins" in window && "toast" in window["plugins"]) {
            const toast = window["toast"] as Toast;
            Promise.resolve(success_msg).then(message => {
              toast.show(String(message), duration + "", position).toPromise();
            });
          } else {
            const toastCtrl: ToastController = this.toastCtrl;
            if (!(toastCtrl instanceof ToastController)) {
              console.warn(
                "需要在",
                target.constructor.name,
                "中注入 ToastController 依赖",
              );
              alert(String(success_msg));
            } else {
              Promise.resolve(success_msg).then(message => {
                toastCtrl
                  .create({
                    message: String(message),
                    position,
                    duration,
                  })
                  .present();
              });
            }
          }
          return data;
        });
      };
      descriptor.value.source_fun = source_fun;
      return descriptor;
    };
  }
  
  const loadingIdLock = (window["loadingIdLock"] = new Map<
    string,
    {
      // readonly is_presented: boolean;
      loading?: Loading;
      promises: Set<Promise<any>>;
    }
  >());
  export function asyncLoadingWrapGenerator(
    loading_msg: any = () => FLP_Tool.getTranslate("PLEASE_WAIT"),
    check_prop_before_present?: string,
    opts?: LoadingOptions,
    id?: string,
  ) {
    if (id) {
      var id_info = loadingIdLock.get(id);
      if (!id_info) {
        id_info = {
          // get is_presented() {
          //   return this.promises.size && this.loading;
          // },
          loading: undefined,
          promises: new Set<Promise<any>>(),
        };
        loadingIdLock.set(id, id_info);
      }
    }
    return function asyncLoadingWrap(target, name, descriptor) {
      const source_fun = descriptor.value;
      descriptor.value = function(...args) {
        const loadingCtrl: LoadingController = this.loadingCtrl;
        if (!(loadingCtrl instanceof LoadingController)) {
          throw new Error(
            target.constructor.name + " 缺少 LoadingController 依赖",
          );
        }
        const res = source_fun.apply(this, args);
  
        if (check_prop_before_present && this[check_prop_before_present]) {
          // 检测到不用弹出
          return res;
        }
        if (id_info) {
          // 加入到集合中
          id_info.promises.add(res);
        }
  
        loading_msg = translateMessage(this, loading_msg, null);
  
        Promise.resolve(loading_msg).then(loading_msg => {
          loading.setContent(String(loading_msg));
        });
  
        const loadingOpts = Object.assign(
          {
            content: String(loading_msg),
            cssClass: (this.PAGE_LEVEL | 0) > 1 ? "can-goback" : "",
          },
          opts,
        );
        const loading = loadingCtrl.create(loadingOpts);
  
        loading.onWillDismiss(() => {
          loading["_is_dissmissed"] = true;
        });
        loading["_my_present"] = () => {
          if (loading["_is_presented"] || loading["_is_dissmissed"]) {
            return;
          }
          loading["_is_presented"] = true;
          loading.present();
          const checkLoadingPageRef = () => {
            if (!loading.pageRef()) {
              return FLP_Tool.raf(checkLoadingPageRef);
            }
            if (
              this.content instanceof Content &&
              loadingOpts.cssClass.split(/\s+/).indexOf("can-goback") !== -1
            ) {
              const loadingEle = loading.pageRef().nativeElement;
              loadingEle.style.marginTop = this.content._hdrHeight + "px";
              console.log(loadingEle, this.content._hdrHeight);
            }
          };
          FLP_Tool.raf(checkLoadingPageRef);
        };
        const loading_present = (...args) => {
          if (id_info) {
            if (!id_info.loading) {
              id_info.loading = loading;
              loading["_my_present"]();
            }
          } else {
            loading["_my_present"]();
          }
        };
  
        loading["_my_dismiss"] = () => {
          if (loading["_is_dissmissed"]) {
            return;
          }
          loading["_is_dissmissed"] = true;
          if (loading["_is_presented"]) {
            loading.dismiss();
          }
        };
        let before_dismiss: Function | undefined;
        const loading_dismiss = (...args) => {
          before_dismiss && before_dismiss();
          if (id_info) {
            if (id_info.promises.has(res)) {
              // 从集合中移除
              id_info.promises.delete(res);
              if (id_info.promises.size === 0 && id_info.loading) {
                id_info.loading["_my_dismiss"]();
                id_info.loading = undefined;
              }
            }
          } else {
            loading["_my_dismiss"]();
          }
        };
        if ("PAGE_STATUS" in this) {
          // 还没进入页面
          const run_loading_present = with_dealy => {
            before_dismiss = undefined;
            with_dealy ? setImmediate(loading_present) : loading_present();
            this.event.once("didLeave", loading_dismiss);
          };
          if (this.PAGE_STATUS === PAGE_STATUS.WILL_ENTER) {
            // 等到进入页面后再开始调用
            this.event.once("didEnter", run_loading_present);
            before_dismiss = () => {
              this.event.off("didEnter", run_loading_present);
            };
          } else if (this.PAGE_STATUS === PAGE_STATUS.DID_ENTER) {
            run_loading_present(true);
          } else {
            debugger;
          }
        } else {
          console.warn("loading修饰器请与FirstLevelPage或者其子类搭配使用最佳");
          loading_present();
        }
  
        return res
          .then(data => {
            // 这里的触发可能会比didEnter的触发更早
            // 所以应该在执行的时候移除掉present的显示
            loading_dismiss();
            return data;
          })
          .catch(err => {
            loading_dismiss();
            return Promise.reject(err);
          });
      };
      descriptor.value.source_fun = source_fun;
      return descriptor;
    };
  }
  export function autoRetryWrapGenerator(
    maxSeconed_or_timeGenerator?:
      | (() => IterableIterator<number>)
      | number
      | {
          max_retry_seconed?: number;
          max_retry_times?: number;
        },
    onAbort?: Function,
  ) {
    var max_retry_seconed = 16;
    var max_retry_times = 5; // 默认最多重试5次
    if (
      typeof maxSeconed_or_timeGenerator == "number" &&
      maxSeconed_or_timeGenerator > 0
    ) {
      max_retry_seconed = maxSeconed_or_timeGenerator;
    }
    var timeGenerator: () => IterableIterator<number>;
    if (maxSeconed_or_timeGenerator instanceof Function) {
      timeGenerator = maxSeconed_or_timeGenerator;
    } else {
      timeGenerator = function*() {
        var second = 1;
        var times = 0;
        do {
          yield second;
          times += 1;
          if (times >= max_retry_times) {
            // 重试太多了，终止
            return;
          }
          if (second < max_retry_seconed) {
            second *= 2;
          }
          if (second > max_retry_seconed) {
            second = max_retry_seconed;
          }
        } while (true);
      };
    }
    const time_gen = timeGenerator();
    return function(target, name, descriptor) {
      const source_fun = descriptor.value;
      // 强制转为异步函数
      descriptor.value = async function loop(...args) {
        var keep_retry = true;
        do {
          try {
            // 不论同步还是异步，都进行await
            // 如果成功，直接返回，中断重试循环
            return await source_fun.apply(this, args);
          } catch (err) {
            // 有其它任务的执行导致当前任务中断，直接返回不再做任何处理
            if (err instanceof AbortError) {
              return err;
            }
            console.warn(err);
            const time_info = time_gen.next(err);
            if (time_info.done) {
              // 声明中断循环
              keep_retry = false;
              if (onAbort) {
                onAbort(err);
              } else {
                // 停止了重试，抛出异常，中断重试循环
                throw err;
              }
            } else {
              await new Promise(cb => setTimeout(cb, time_info.value * 1e3));
            }
          }
        } while (keep_retry);
      };
      descriptor.value.source_fun = source_fun;
      return descriptor;
    };
  }
  export function singleRunWrap() {
    return function(target, name, descriptor) {
      const source_fun = descriptor.value;
      var run_lock: PromiseOut<any> | undefined;
      descriptor.value = async function lock(...args) {
        if (!run_lock) {
          run_lock = new PromiseOut();
        }
        try {
          run_lock.resolve(source_fun.apply(this, args));
        } catch (err) {
          run_lock.reject(err);
        } finally {
          run_lock = undefined;
        }
      };
      descriptor.value.source_fun = source_fun;
      return descriptor;
    };
  }
  
  export const asyncCtrlGenerator = {
    single: singleRunWrap,
    success: asyncSuccessWrapGenerator,
    loading: asyncLoadingWrapGenerator,
    // error: asyncErrorWrapGenerator,
    retry: autoRetryWrapGenerator,
    error(
      error_title?: any,
      opts?:
        | AlertOptions
        | ((self: FLP_Tool) => AlertOptions)
        | ((self: FLP_Tool) => Promise<AlertOptions>),
      hidden_when_page_leaved?: boolean,
      keep_throw?: boolean,
    ) {
      return asyncErrorWrapGenerator(
        error_title,
        opts,
        hidden_when_page_leaved,
        keep_throw,
        (params, self: FLP_Tool) => {
          if (!(self instanceof FLP_Tool)) {
            alert(
              (
                params.title +
                "\n" +
                params.subTitle +
                "\n" +
                params.message
              ).trim(),
            );
            throw new TypeError(
              "asyncErrorWrapGenerator must within FLP_TOOL subclass",
            );
          }
          const buttons = params.buttons;
          if (
            buttons &&
            buttons.length == 1 &&
            buttons[0] === getTranslateSync("COFIRM")
          ) {
            buttons.length = 0;
          }
          return self.showErrorDialog(
            params.title,
            params.subTitle,
            params.message,
            params.buttons,
            false,
          );
        },
      );
    },
    warning(
      error_title?: any,
      opts?:
        | AlertOptions
        | ((self: FLP_Tool) => AlertOptions)
        | ((self: FLP_Tool) => Promise<AlertOptions>),
      hidden_when_page_leaved?: boolean,
      keep_throw?: boolean,
    ) {
      return asyncErrorWrapGenerator(
        error_title,
        opts,
        hidden_when_page_leaved,
        keep_throw,
        (params, self: FLP_Tool) => {
          const buttons = params.buttons;
          if (
            buttons &&
            buttons.length == 1 &&
            buttons[0] === getTranslateSync("COFIRM")
          ) {
            buttons.length = 0;
          }
          return self.showWarningDialog(
            params.title,
            params.subTitle,
            params.message,
            params.buttons,
            false,
          );
        },
      );
    },
  };
  