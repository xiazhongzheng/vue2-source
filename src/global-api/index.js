import {
    mergeOptions
} from "../util";

export function initGlobalApi(Vue) {
    Vue.options = {}; //全局的配置，每个组件初始化的时候，都会和全局的optionis进行合并
    Vue.mixin = function (options) {
        this.options = mergeOptions(this.options, options)
        // return this后，可以链式调用
        return this;
    }

    Vue.options._base = Vue; // Vue类可能被子类继承，把Vue保存在_base里，可以方便的拿到Vue
    Vue.options.components = {};

    Vue.component = function (id, definition) {
        // 保证了隔离性，每个组件都会产生一个新的类
        // 所以全局的components的格式是一个函数
        // 在components选项中写的组件，可以是一个对象，所以在创建组件的时候，需要把对象再调用Vue.extend，以统一成一个类
        definition = this.options._base.extend(definition);
        this.options.components[id] = definition;
    }

    Vue.extend = function (opts) {
        // 传进来一个对象，返回一个类，继承了Vue，合并了对象
        const Super = this;
        const Sub = function VueComponent(options) {
            this._init(options);
        }
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;
        Sub.options = mergeOptions(Super.options, opts);
        return Sub;
    }
}