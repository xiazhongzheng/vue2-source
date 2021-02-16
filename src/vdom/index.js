import {
    isObject,
    isReservedTag
} from "../util";

export function createElement(vm, tag, data = {}, ...children) {
    if (isReservedTag(tag)) {
        return vnode(vm, tag, data, data.key, children, undefined);
    } else {
        const Ctor = vm.$options.components[tag];
        return createComponent(vm, tag, data, data.key, children, Ctor)
    }
}

function createComponent(vm, tag, data, key, children, Ctor) {
    if (isObject(Ctor)) {
        // 用户写的options里面的组件，可能是对象写法，也可以是Vue.extend转换过的
        // 如果是对象，则extend转成构造函数
        Ctor = vm.$options._base.extend(Ctor);
    }
    data.hook = { // 渲染组件时，需要调动此方法
        init(vnode) {
            // init里面创建组件实例，放到VNode上，方便在创建真实节点时候取出来
            let vm = vnode.componentInstance = new Ctor({_isComponent: true});
            vm.$mount();
        }
    }
    return vnode(vm, `vue-component-${tag}`, data, key, children, undefined, {Ctor, children})
}

export function createTextElement(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
}

function vnode(vm, tag, data, key, children, text, componentOptions) {
    return {
        vm,
        tag,
        data,
        key,
        children,
        text,
        componentOptions
        // ...  虚拟dom可以拓展属性。。
    }
}