import {
    compileToFunction
} from "./compiler";
import {
    mountComponent
} from "./lifecycle";
import {
    initState
} from "./state";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        let vm = this;
        vm.$options = options;

        // 数据初始化  data watch computed props
        initState(vm)

        if (vm.$options.el) {
            this.$mount(vm.$options.el);
        }
    }
    Vue.prototype.$mount = function (el) {

        // 把版本转换成  对应的渲染函数 =》 虚拟dom  VNode  =》 diff算法更新虚拟dom =》 产生真实节点  更新
        const vm = this;
        const options = vm.$options;
        el = vm.el = document.querySelector(el);
        if (!options.render) {
            let template = options.template;
            if (!template && el) {
                template = el.outerHTML;
                let render = compileToFunction(template);
                options.render = render;
            }
        }

        mountComponent(vm, el);
    }
}