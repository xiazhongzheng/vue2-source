import { initGlobalApi } from "./global-api";
import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";
import { stateMixin } from "./state";

function Vue(options) {
    // 用户传入的选项
    this._init(options)
}
initMixin(Vue)
renderMixin(Vue)  // vm._render
lifecycleMixin(Vue) // vm._update
stateMixin(Vue);
initGlobalApi(Vue);

import { compileToFunction } from "./compiler";
import { createEle, patch } from "./vdom/patch";

// diff
let oldTemplate = `<div style="color: red;background: green;" a=1>{{message}}</div>`
let vm1 = new Vue({data: {message: 'hello world'}})
const render1 = compileToFunction(oldTemplate);
const oldVnode = render1.call(vm1);
document.body.appendChild(createEle(oldVnode));

let newTemplate = `<div style="color: blue" b=2>{{message}}</div>`
let vm2 = new Vue({data: {message: 'zf'}})
const render2 = compileToFunction(newTemplate);
const newVnode = render2.call(vm2);


setTimeout(() => {
    patch(oldVnode, newVnode);
}, 2000)








export default Vue;