import {
    isObject
} from "../util";
import { arrayMethods } from "./array";

class Observer {
    constructor(data) {
        // data.__ob__ = this; // 把Observer的实例放到data下面，可以在数据的方法里调用Observer的方法
        Object.defineProperty(data, '__ob__', { // 不可枚举，避免循环。。。。爆栈
            value:this,
            enumerable: false
        })
        // 数组也可以通过defineProperty对下标进行劫持，但是性能消耗严重，也没有必要
        if (Array.isArray(data)) {
            // 1. 数组不对下标劫持，重写了7个方法，并且对数组内的对象继续递归劫持
            data.__proto__ = arrayMethods;
            this.observeArray(data);
        } else {
            // 2. 对象递归劫持
            this.walk(data)
        }
    }
    observeArray(data){
        data.forEach(item => {
            observe(item);
        })
    }
    walk(data) {
        Object.keys(data).forEach(key => {
            defineReactive(data, key, data[key])
        })
    }
}

function defineReactive(data, key, value) {
    observe(value) // value是对象，递归劫持
    Object.defineProperty(data, key, {
        get() {
            // console.log('get --' + value)
            return value
        },
        set(newV) {
            observe(newV) // 赋值的新对象，也需要劫持
            value = newV
        }
    })
}
export function observe(data) {
    if (!isObject(data)) {
        return;
    }
    if (data.__ob__) { // 已经劫持过的不再劫持
        return;
    }
    return new Observer(data)
}