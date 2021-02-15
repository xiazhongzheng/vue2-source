import {
    observe
} from "./observer";
import Watcher from "./observer/watcher";
import {
    isFunction
} from "./util";

export function stateMixin(Vue) {
    Vue.prototype.$watch = function (key, handler, options = {}) {
        options.user = true; // 这是一个用户user
        let watcher = new Watcher(this, key, handler, options); // 把Watcher类改造一下，exprOrFn适合函数和表达式的情况
        if (options.immediate) {
            handler(watcher.value);
        }
    }
}

export function initState(vm) {
    const opts = vm.$options;
    // if (opts.props) {
    //     initProps()
    // }
    if (opts.data) {
        initData(vm)
    }
    if (opts.computed) {
        initComputed(vm, opts.computed)
    }
    if (opts.watch) {
        initWatch(vm, opts.watch)
    }
}

function initComputed(vm, computed) {
    for (const key in computed) {
        if (Object.hasOwnProperty.call(computed, key)) {
            const userDef = computed[key];
            // 用户定义的可能是函数，也可能是对象（包含get和set）
            let getter = typeof userDef === 'function' ? userDef : userDef.get;
            // new Watcher(vm, getter, () => {}, {
            //     lazy: true
            // }); // computed默认不取值
            defineComputed(vm, key, userDef);
        }
    }
}

function defineComputed(vm, key, userDef) {
    // 把computed的新属性代理到vm上
    let sharedProperty = {};
    if (typeof userDef === 'function') {
        sharedProperty.get = userDef;
    } else {
        sharedProperty.get = userDef.get;
        sharedProperty.set = userDef.set;
    }
    // computed属性就是用defineProperty把新属性代理到vm上
    Object.defineProperty(vm, key, sharedProperty);
}

function initWatch(vm, watch) { // watch是一个对象，用forin遍历
    for (const key in watch) {
        if (Object.hasOwnProperty.call(watch, key)) {
            const element = watch[key];
            // 每个watch可能是数组（包含多个watch函数），也可能是函数
            // 同时vm上有一个$watch方法，和options上的watch一样，所以统一写一个$watch方法
            if (Array.isArray(element)) {
                element.forEach(handler => {
                    createWatch(vm, key, handler)
                });
            } else {
                createWatch(vm, key, element)
            }
        }
    }

}

function createWatch(vm, key, handler) {
    return vm.$watch(key, handler);
}

function initData(vm) {
    let data = vm.$options.data;
    // 数据劫持
    data = isFunction(data) ? data.call(vm) : data;
    vm._data = data;


    for (const key in data) {
        proxy(vm, '_data', key)
    }

    observe(data)
}

// 代理  vm._data.name => vm.name   
function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[source][key]
        },
        set(newV) {
            vm[source][key] = newV
        }
    })
}