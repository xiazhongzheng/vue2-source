import {
    popTarget,
    pushTarget
} from "./dep";
import {
    queueWatcher
} from "./scheduler";

let id = 0;
// 一个页面对应一个watcher
class Watcher {
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        this.cb = cb;
        this.options = options;
        this.id = id++;
        this.lazy = !!options.lazy; // computed默认不取值
        this.dirty = !!options.lazy; // computed，用户watcher，默认lazy为true，dirty也为true

        // render去VM上取值，再渲染，所以取名getter
        // this.getter = exprOrFn;
        this.user = !!options.user;
        if (typeof exprOrFn === 'string') {
            this.getter = function () {
                // 'name.a.aa' => vm.name.a.a
                let path = exprOrFn.split('.');
                let obj = vm;
                let result = path.reduce(function (parent, current) {
                    return parent[current];
                }, obj);
                return result;
                // 在用户watch中，没有在视图中使用这个属性，所以通过return 这个属性的方式，触发属性的get，从而让属性搜集当前这个用户watcher
                // 同时这里返回当前最新的属性值，在watch回调中当做newValue和oldValue传递过去
            }
        } else {
            this.getter = exprOrFn; // 渲染视图中，updateComponent
        }
        this.deps = [];
        this.depsId = new Set(); // 去重dep
        this.value = this.lazy ? true : this.get(); // 默认第一次取当前值，当属性变化时，run方法里面再取最新值和这里的值作为老值，作为用户watcher的回调函数的值
    }
    get() {
        // 每个属性可能在多个页面中使用，对应多个watcher，
        // 一个页面有多个属性，对应多个dep
        // 多对多的关系
        pushTarget(this); // Dep.target = watcher; 把当前的watcher放到Dep的=静态属性下面
        const value = this.getter.call(this.vm); // render方法里，取属性，触发defineProperty的getter，收集watcher
        // 用户watcher中，用户写的get里面会有this，指的是vm上的属性，所以这里getter函数里面的this指向应该是vm，哟所以用call绑定this指向
        popTarget(); // Dep.target = null;
        return value; // this.getter不一定有返回值，这是给用户watcher取值
    }
    update() {
        // this.get(); // 不直接调用get，防止重复，通过调度中心去重
        if (this.lazy) { // 数据更新时，如果是computed，让dirty为true，重新计算
            this.dirty = true;
        } else {
            // 如果不是computed，更新视图
            queueWatcher(this);
        }
    }
    run() {
        let newValue = this.get();
        let oldValue = this.value;
        this.value = newValue;
        if (this.user) {
            // 只有用户watcher才需要
            this.cb.call(this.vm, newValue, oldValue);
        }
    }
    addDep(dep) {
        let id = dep.id;
        if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); // dep添加watcher的方法放在这，也是去重
        }
    }
    evaluate() {
        this.dirty = false;
        this.value = this.get();
    }
    depend() {
        let i = this.deps.length;
        while(i--){
            this.deps[i].depend();
        }
    }
}

export default Watcher