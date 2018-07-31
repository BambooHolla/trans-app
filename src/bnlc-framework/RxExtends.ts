import { combineAll } from "rxjs/operator/combineAll";
import { Observable, BehaviorSubject } from "rxjs";
import { PromisePro, DelayPromise } from "./PromiseExtends";
export type Executor<T> = (
  // resolve: (value?: T | PromiseLike<T>) => void,
  // reject: (reason?: any) => void,
  promise_pro: PromisePro<T>,
) => Promise<T>;

const CONSTRUCTOR_HELPER = Promise.resolve() as Promise<any>;
/**
 * BehaviorSubject + PromisePro
 * 额外提供了abort，refresh等对核心Promise操作的方法
 *
 * @export
 * @class CatchAbleFetcher
 */
export class AsyncBehaviorSubject<T> extends BehaviorSubject<
  Promise<T> | undefined
> {
  getPromise(): Promise<T> {
    // super.toPromise();
    const res = new PromisePro<Promise<T>>();
    this._checkPrepare();
    this.take(1).subscribe(res.resolve, res.reject);
    return res.promise.then(v => v);
  }
  constructor(executor: Executor<T>) {
    super(CONSTRUCTOR_HELPER);
    const asyncer = new PromisePro<T>();
    const promise = executor(asyncer);

    this._asyncer = asyncer;
    this.promise = promise;
    this.setupExecutor(executor);
  }
  private _asyncer: PromisePro<T>;

  // 安装执行器
  private _executor!: Executor<T>;
  setupExecutor(executor: Executor<T>) {
    this._executor = executor;
  }
  /**准备执行状态，用于懒更新*/
  private _prepare_run_excutor = false;
  private _checkPrepare() {
    if (this._prepare_run_excutor) {
      this.runExcutor();
      this._prepare_run_excutor = false;
    }
  }
  refresh(msg?: string, force_abort?: boolean) {
    this.abort(msg, force_abort);
    this._prepare_run_excutor = true;
  }
  private _promise?: Promise<T>;
  get promise() {
    return this._promise;
  }
  private _is_catched_error = false;
  set promise(v) {
    if (this._promise === v) {
      return;
    }
    if ((this._promise = v)) {
      // v["ID"] = Math.random();
      v &&
        v
          .then(data => {
            // 来自缓存数据，有异常
            this._is_catched_error = (data && data["__source_err__"]) || false;
          })
          .catch(err => {
            this._is_catched_error = err;
          });
    }
    this.next(v);
  }
  subscribe(next?: any, error?: any, complete?: any) {
    if (this._is_catched_error) {
      this._is_catched_error = false;
      this.refresh();
    }
    this._checkPrepare();
    return super.subscribe(next, error, complete);
  }
  runExcutor() {
    if (!this.promise) {
      this.promise = this._executor(this._asyncer);
    }
  }
  // 中断请求
  abort(msg?: string, force_abort?: boolean) {
    const new_asyncer = new PromisePro<T>();
    const old_asyncer = this._asyncer;
    if (force_abort) {
      old_asyncer.abort(msg);
    } else if (!old_asyncer.is_done) {
      old_asyncer.follow(new_asyncer.promise);
    }
    this._asyncer = new_asyncer;
    this.promise = undefined;
  }
  // static CATCH_POOL = new Map<string, AsyncBehaviorSubject<any>>();
  // static fromObservable<T>(name: string, rxob: Observable<any>, executor: Executor<T>) {
  //     rxob.subscribe(val => {
  //         var _process = this.CATCH_POOL.get("name");
  //         if (_process) {
  //             _process.refresh();// 尝试中断当前请求
  //         } else {
  //             _process = new AsyncBehaviorSubject(executor);
  //             this.CATCH_POOL.set("name", _process);
  //         }
  //     });
  // }
}
