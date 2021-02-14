import {
    isObject
} from "../util";
import {
    arrayMethods
} from "./array";
import Dep from "./dep";

class Observer {
    constructor(data) {
        this.dep = new Dep(); // 给数组监听子元素用的
        // data.__ob__ = this; // 把Observer的实例放到data下面，可以在数据的方法里调用Observer的方法
        Object.defineProperty(data, '__ob__', { // 不可枚举，避免循环。。。。爆栈
            value: this,
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
    observeArray(data) {
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

function depandArray(value) {
    for(var i = 0;i<value.length;i++){
        let current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if(Array.isArray(current)) {
            depandArray(current);
        }
    }
}

function defineReactive(data, key, value) {
    let childOb = observe(value) // value是对象，递归劫持
    let dep = new Dep(); // 每个属性有一个dep
    Object.defineProperty(data, key, {
        get() {
            // console.log('get --' + value)
            if (Dep.target) { // 模板中取值
                dep.depend(); // 让dep记住watcher
                if(childOb) { // 对象和数组都监听子的，$set
                    childOb.dep.depend();
                    if(Array.isArray(value)) { // 针对arr: [[1], [2]]多维数组
                        depandArray(value);
                    }
                }
            }
            return value
        },
        set(newV) {
            if (value !== newV) {
                observe(newV); // 赋值的新对象，也需要劫持
                value = newV;
                dep.nodify();
            }
        }
    })
}
export function observe(data) {
    if (!isObject(data)) {
        return;
    }
    if (data.__ob__) { // 已经劫持过的不再劫持
        return data.__ob__;
    }
    return new Observer(data)
}