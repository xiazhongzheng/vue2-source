import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";

function Vue(options) {
    // 用户传入的选项
    this._init(options)
}
initMixin(Vue)
renderMixin(Vue)  // vm._render
lifecycleMixin(Vue) // vm._update
export default Vue;