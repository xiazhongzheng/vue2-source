import { mergeOptions } from "../util";

export function initGlobalApi(Vue) {
    Vue.options = {}; //全局的配置，每个组件初始化的时候，都会和全局的optionis进行合并
    Vue.mixin = function(options) {
        this.options = mergeOptions(this.options, options)
        // return this后，可以链式调用
        return this;
    }
}