import { Injectable } from "@angular/core";
import * as CryptoJS from "crypto-js";

// 使用 @Injectable 才能让所声明的类用于依赖注入，
// 而 @Component 是 @Injectable 的派生类型，不需要重复使用 @Injectable 。
// 注意在 @Injectable 后面必须使用括号。
@Injectable()
export class CryptoService {
    constructor() {}
    public MD5(text: string) {
        return CryptoJS.MD5(text).toString();
    }
}
