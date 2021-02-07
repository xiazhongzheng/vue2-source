import {
    createElement,
    createTextElement
} from "./vdom"

export function renderMixin(Vue) {
    Vue.prototype._c = function () {
        return createElement(this, ...arguments)
    }

    Vue.prototype._v = function (text) {
        return createTextElement(this, text)
    }
    Vue.prototype._s = function (val) {
        // 模板里可能直接显示一个对象，这时用JSON.stringify转成字符串
        if (typeof val === 'object') {
            return JSON.stringify(val)
        }
        return val
    }
    Vue.prototype._render = function () {
        let render = this.$options.render;
        let vnode = render.call(this);
        return vnode;
    }
}