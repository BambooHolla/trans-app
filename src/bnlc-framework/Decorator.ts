import {
  AlertController,
  AlertOptions,
  ToastOptions,
  LoadingController,
  LoadingOptions,
  Loading,
} from 'ionic-angular';
import { PAGE_STATUS } from './const';
import { Toast } from '@ionic-native/toast';
import { PromptControlleService } from "../providers/prompt-controlle-service";

export const ERROR_FROM_ASYNCERROR = { NAME: 'CATCHED_ERROR' };

export function asyncErrorWrapGenerator(
  error_title: any = '错误',
  opts?: AlertOptions,
  hidden_when_page_leaved = true
) {
  return function asyncErrorWrap(target, name, descriptor) {
    const source_fun = descriptor.value;
    descriptor.value = function(...args) {
      var page_leaved = false;
      if ('PAGE_STATUS' in this) {
        this.event.once('didLeave', () => {
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
          var err_msg;
          if (err instanceof Error) {
            err_msg = err.message;
          } else if(err.message) { 
            err_msg = err.message;
          } else {
            err_msg = err + '';
          }
          console.group('CATCH BY asyncErrorWrapGenerator:');
          console.warn(err);
          console.groupEnd();
          if (hidden_when_page_leaved && page_leaved) {
            console.log(
              '%c不弹出异常提示因为页面的切换 ' + (this.cname || ''),
              'color:yellow'
            );
            return ERROR_FROM_ASYNCERROR;
          }
          const alertCtrl: AlertController = this.alertCtrl;
          if (!(alertCtrl instanceof AlertController)) {
            console.warn(
              '需要在',
              target.constructor.name,
              '中注入 AlertController 依赖'
            );
            alert(err_msg);
          } else {
            alertCtrl
              .create(
                Object.assign(
                  {
                    title: String(error_title),
                    subTitle: err_msg,
                    buttons: [{
                      text:'确定'
                    }] 
                  },
                  opts
                )
              )
              .present();
          }
          return ERROR_FROM_ASYNCERROR;
        });
    };
    return descriptor;
  };
}
export function asyncSuccessWrapGenerator(
  success_msg: any = '成功',
  position = 'bottom',
  duration = 3000,
  hidden_when_page_leaved = true
) {
  return function asyncSuccessWrap(target, name, descriptor) {
    const source_fun = descriptor.value;
    descriptor.value = function(...args) {
      return source_fun.apply(this, args).then(data => {
        if (data === ERROR_FROM_ASYNCERROR) {
          return ERROR_FROM_ASYNCERROR;
        }
        if (
          hidden_when_page_leaved &&
          // this.hasOwnProperty("PAGE_STATUS") &&
          isFinite(this.PAGE_STATUS) &&
          this.PAGE_STATUS > PAGE_STATUS.WILL_LEAVE
        ) {
          console.log('不弹出成功提示因为页面的切换');
          return data;
        }
        const message = String(success_msg);
        if ('plugins' in window && 'toast' in window['plugins']) {
          const toast = window['toast'] as Toast;
          toast.show(message, duration + '', position).toPromise();
        } else {
          console.log( this.promptCtrl)
          const promptCtrl: any = this.promptCtrl;
          if (!(promptCtrl instanceof PromptControlleService)) {
            console.warn(
              '需要在',
              target.constructor.name,
              '中注入 ModalControlleService 依赖'
            );
            alert(String(success_msg));
          } else {
            promptCtrl
              .toastCtrl({
                message,
                position,
                duration
              })
              .present();
          }
        }
        return data;
      });
    };
    return descriptor;
  };
}

const loadingIdLock = (window['loadingIdLock'] = new Map<
  string,
  {
    // readonly is_presented: boolean;
    loading: Loading;
    promises: Set<Promise<any>>;
  }
>());
export function asyncLoadingWrapGenerator(
  loading_msg: any = '请稍后',
  check_prop_before_present?: string,
  opts?: LoadingOptions,
  id?: string
) {
  if (id) {
    var id_info = loadingIdLock.get(id);
    if (!id_info) {
      id_info = {
        // get is_presented() {
        //   return this.promises.size && this.loading;
        // },
        loading: null,
        promises: new Set<Promise<any>>()
      };
      loadingIdLock.set(id, id_info);
    }
  }
  return function asyncLoadingWrap(target, name, descriptor) {
    const source_fun = descriptor.value;
    descriptor.value = function(...args) {
      const loadingCtrl: LoadingController = this.loadingCtrl;
      if (!(loadingCtrl instanceof LoadingController)) {
        throw new Error(target.constructor.name + ' 缺少 LoadingController 依赖');
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
      const loading = loadingCtrl.create(
        Object.assign(
          {
            content: String(loading_msg),
            cssClass: 'can-goback'
          },
          opts
        )
      );
      loading.onWillDismiss(() => {
        loading['_is_dissmissed'] = true;
      });
      loading['_my_present'] = () => {
        if (loading['_is_presented'] || loading['_is_dissmissed']) {
          return;
        }
        loading['_is_presented'] = true;
        loading.present();
      };
      const loading_present = (...args) => {
        if (id_info) {
          if (!id_info.loading) {
            id_info.loading = loading;
            loading['_my_present']();
          }
        } else {
          loading['_my_present']();
        }
      };

      loading['_my_dismiss'] = () => {
        if (loading['_is_dissmissed']) {
          return;
        }
        loading['_is_dissmissed'] = true;
        if (loading['_is_presented']) {
          loading.dismiss();
        }
      };
      let before_dismiss = null;
      const loading_dismiss = (...args) => {
        before_dismiss && before_dismiss();
        if (id_info) {
          if (id_info.promises.has(res)) {
            // 从集合中移除
            id_info.promises.delete(res);
            if (id_info.promises.size === 0 && id_info.loading) {
              id_info.loading['_my_dismiss']();
              id_info.loading = null;
            }
          }
        } else {
          loading['_my_dismiss']();
        }
      };
      if ('PAGE_STATUS' in this) {
        // 还没进入页面
        const run_loading_present = with_dealy => {
          before_dismiss = null;
          with_dealy ? setImmediate(loading_present) : loading_present();
          this.event.once('didLeave', loading_dismiss);
        };
        if (this.PAGE_STATUS === PAGE_STATUS.WILL_ENTER) {
          // 等到进入页面后再开始调用
          this.event.once('didEnter', run_loading_present);
          before_dismiss = () => {
            this.event.off('didEnter', run_loading_present);
          };
        } else if (this.PAGE_STATUS === PAGE_STATUS.DID_ENTER) {
          run_loading_present(true);
        } else {
          debugger;
        }
      } else {
        console.warn('loading修饰器请与FirstLevelPage或者其子类搭配使用最佳');
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
    return descriptor;
  };
}

export const asyncCtrlGenerator = {
  success: asyncSuccessWrapGenerator,
  loading: asyncLoadingWrapGenerator,
  error: asyncErrorWrapGenerator
};
