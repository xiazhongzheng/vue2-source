import { initMixin } from "./init";

function Vue(options) {
    // 用户传入的选项
    this._init(options)
}
initMixin(Vue)
export default Vue;