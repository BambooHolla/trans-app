import { FLP_NativeTransition } from './FLP_NativeTransition';
export class FLP_Form extends FLP_NativeTransition {
	private _error_checks_col: { [prop_name: string]: string[] };
	/**
   * 校验用的错误收集器
   * @param namespalce 目标字段
   * @param key 字段属性
   */
	static setErrorTo(namespace: string, key: string, error_keys: string[]) {
		return (target: any, name: string, descriptor?: PropertyDescriptor) => {
			const error_checks_col =
				target._error_checks_col || (target._error_checks_col = {});
			if (!(key in error_checks_col)) {
				error_checks_col[key] = [];
			}
			error_checks_col[key].push(name);

			const source_fun = descriptor.value;
			descriptor.value = function(...args) {
				const res = source_fun.apply(this, args);
				const bind_errors = err_map => {
					const all_errors =
						this[namespace] || (this[namespace] = {});
					const current_error = all_errors[key] || {};
					err_map || (err_map = {});

					error_keys.forEach(err_key => {
						if (err_key in err_map) {
							current_error[err_key] = err_map[err_key];
						} else {
							delete current_error[err_key];
						}
					});
					if (Object.keys(current_error).length) {
						all_errors[key] = current_error;
					} else {
						delete all_errors[key];
					}
				};
				if (res instanceof Promise) {
					return res.then(bind_errors);
				} else {
					return bind_errors(res);
				}
			};
			return descriptor;
		};
	}
	hasError(errors) {
		return !!Object.keys(errors).length;
	}
	allHaveValues(obj) {
		for (let k in obj) {
			if (!obj[k]) {
				return false;
			}
		}
		return true;
	}

	// 输入框收集器
	inputstatus = {};
	setInputstatus(formKey: string, e) {
		this.inputstatus[formKey] = e.type;
		if (e.type === 'input') {
			if (this._error_checks_col[formKey]) {
				this._error_checks_col[formKey].forEach(fun_key => {
					try {
						this[fun_key]();
					} catch (err) {
						console.warn('表单检查出错', fun_key, err);
					}
				});
			}
		}
	}
}
