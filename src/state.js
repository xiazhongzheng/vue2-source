import {
    observe
} from "./observer";
import Dep from "./observer/dep";
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
    const watchers = vm._computedWatchers = {};
    // vm上的_computedWatchers属性，保存watcher和computed的映射关系
    for (const key in computed) {
        if (Object.hasOwnProperty.call(computed, key)) {
            const userDef = computed[key];
            // 用户定义的可能是函数，也可能是对象（包含get和set）
            let getter = typeof userDef === 'function' ? userDef : userDef.get;
            watchers[key] = new Watcher(vm, getter, () => {}, {
                lazy: true
            }); // computed默认不取值
            defineComputed(vm, key, userDef);
        }
    }
}

function createComputedGetter(key) {
    return function computedGetter() {
        // vm.key 调用属性的get，所以this指向vm
        let watcher = this._computedWatchers[key];
        if (watcher.dirty) {
            watcher.evaluate();
        }
        // 如果Dep.target还有值 说明需要继续向上收集
        if (Dep.target) { // 当前Dep.target是渲染watcher
            // 计算属性watcher 内部 有两个dep  firstName,lastName
            // 两个dep都需要再收集渲染watcher
            watcher.depend(); // watcher 里 对应了 多个dep
        }
        return watcher.value;
    }
}

function defineComputed(vm, key, userDef) {
    // 把computed的新属性代理到vm上
    let sharedProperty = {};
    if (typeof userDef === 'function') {
        sharedProperty.get = userDef;
    } else {
        sharedProperty.get = createComputedGetter(key);
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