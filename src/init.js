import {
    initState
} from "./state";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        let vm = this;
        vm.$options = options;

        // 数据初始化  data watch computed props
        initState(vm)
    }
}