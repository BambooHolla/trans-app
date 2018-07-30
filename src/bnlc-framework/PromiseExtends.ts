import { Executor } from "./RxExtends";
import { EventEmitter } from "eventemitter3";
/**
 * 将resolve和reject暴露出来
 *
 * @export
 * @class PromiseOut
 * @template T
 */
export class PromiseOut<T> {
  resolve!: (value?: T | PromiseLike<T> | undefined) => void;
  reject!: (reason?: any) => void;
  promise: Promise<T>;
  constructor(promiseCon: PromiseConstructor = Promise) {
    this.promise = new promiseCon<T>((_resolve, _reject) => {
      this.resolve = _resolve;
      this.reject = _reject;
    });
  }
}
/**
 * Why AbortError
 * 为了和其它的Error进行区分
 * 一般的Error是来自代码的异常、数据服务的异常
 * 但是AbortError是来自用户的操作，主动取消某个执行中的动作
 * 一般来说如果是AbortError，我们可以跳过不处理，至少不需要将这种异常展示给用户
 *
 * @export
 * @class AbortError
 * @extends {Error}
 */
export class AbortError extends Error {
  ABORT_ERROR_FLAG = true;
}

export class PromisePro<T> extends PromiseOut<T> {
  constructor(promiseCon?: PromiseConstructor) {
    super(promiseCon);
  }
  is_done = false;
  abort_error?: AbortError;
  abort(abort_message = "Abort") {
    if (this.is_done) {
      return;
    }
    this.reject((this.abort_error = new AbortError(abort_message)));
    this._tryEmit("abort", this.abort_error, this);
  }
  private _event?: EventEmitter;
  get event() {
    if (!this._event) {
      this._event = new EventEmitter();
    }
    return this._event;
  }
  private _tryEmit(eventname: string, ...args: any[]) {
    if (this._event) {
      this._event.emit(eventname, ...args);
    }
  }
  onAbort(cb: () => void) {
    this.event.on("abort", cb);
  }
  follow(from_promise: Promise<T>) {
    from_promise.then(this.resolve).catch(this.reject);
    return this.promise;
  }
  static fromPromise<T>(promise: Promise<T>) {
    const res = new PromisePro();
    if (promise instanceof DelayPromise) {
      promise.delayThen(res.resolve);
      promise.delayCatch(res.reject);
    } else {
      promise.then(res.resolve);
      promise.catch(res.reject);
    }
    return res;
  }
}
export function autoAbort(
  target,
  name: string,
  descriptor: PropertyDescriptor,
) {
  const fun = descriptor.value;
  let _lock: PromisePro<any> | undefined;
  descriptor.value = function(...args) {
    if (_lock) {
      _lock.abort();
      _lock = undefined;
    }
    const res = (_lock = fun.apply(this, args));
    res.promise.then(() => {
      _lock = undefined;
    });
    return res;
  };
}

/**
 * 在调用.then或者.catch的时候才会执行启动函数
 */
export class DelayPromise<T> extends Promise<T> {
  constructor(
    executor: (
      resolve: (value?: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
    ) => void,
  ) {
    var _resolve: any;
    var _reject: any;
    super((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });
    var is_runed = false;
    const run_executor = () => {
      if (!is_runed) {
        executor(_resolve, _reject);
        is_runed = true;
      }
    };

    this.then = (onfulfilled?: any, onrejected?: any) => {
      run_executor();
      return this.delayThen(onfulfilled, onrejected) as any;
    };
    this.catch = (onrejected?: any) => {
      run_executor();
      return this.delayCatch(onrejected) as any;
    };
  }
  delayThen(onfulfilled?: any, onrejected?: any) {
    return super.then(onfulfilled, onrejected);
  }
  delayCatch(onrejected?: any) {
    return super.catch(onrejected);
  }
}

export const sleep = (ms: number) => {
  return new Promise(cb => setTimeout(cb, ms));
};
