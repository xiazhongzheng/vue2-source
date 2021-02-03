import { observe } from "./observer";
import { isFunction } from "./util";

export function initState(vm) {
    const opts = vm.$options;
    // if (opts.props) {
    //     initProps()
    // }
    if (opts.data) {
        initData(vm)
    }
    // if (opts.computed) {
    //     initComputed()
    // }
    // if (opts.watch) {
    //     initWatch()
    // }
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
function proxy(vm, source, key){
    Object.defineProperty(vm, key, {
        get() {
            return vm[source][key]
        },
        set(newV) {
            vm[source][key] = newV
        }
    })
}