import Watcher from "./observer/watcher";
import { nextTick } from "./util";
import { patch } from "./vdom/patch";

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function(vnode) {
        let vm = this;
        const prevVnode = vm._vnode;
        if (!prevVnode) {
            vm.$el = patch(vm.$el, vnode); // 保存新的$el
        } else {
            vm.$el = patch(prevVnode, vnode);
        }
        vm._vnode = vnode;
    }
    Vue.prototype.$nextTick = nextTick;
}

export function mountComponent(vm, el) {
    // 更新函数 初始化时调用  数据变化后 也会再次调用此函数
    let updateComponent = () => {
        // 调用render函数，生成虚拟dom
        vm._update(vm._render()); // 后续更新可以调用updateComponent方法
        // 用虚拟dom 生成真实dom
    }
    callHooks(vm, 'beforeMount');
    new Watcher(vm, updateComponent, () => {
        console.log('视图更新了')
    }, true);
    callHooks(vm, 'mounted');
}

export function callHooks(vm, hook) {
    let handles = vm.$options[hook];
    if (handles) {
        handles.forEach(handle => {
            handle.call(vm);
        });
    }
}