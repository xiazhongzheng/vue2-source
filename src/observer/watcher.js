import { popTarget, pushTarget } from "./dep";
import { queueWatcher } from "./scheduler";

let id = 0;
// 一个页面对应一个watcher
class Watcher{
    constructor(vm, exprOrFn, ob, options){
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        this.ob = ob;
        this.options = options;
        this.id = id++;

        // render去VM上取值，再渲染，所以取名getter
        this.getter = exprOrFn;
        this.deps = [];
        this.depsId = new Set(); // 去重dep
    }
    get() {
        // 每个属性可能在多个页面中使用，对应多个watcher，
        // 一个页面有多个属性，对应多个dep
        // 多对多的关系
        pushTarget(this); // Dep.target = watcher; 把当前的watcher放到Dep的=静态属性下面
        this.getter(); // render方法里，取属性，触发defineProperty的getter，收集watcher
        popTarget(); // Dep.target = null;
    }
    update() {
        // this.get(); // 不直接调用get，防止重复，通过调度中心去重
        queueWatcher(this);
    }
    run() {
        this.get();
    }
    addDep(dep) {
        let id = dep.id;
        if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); // dep添加watcher的方法放在这，也是去重
        }
    }
}

export default Watcher