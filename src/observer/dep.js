let id = 0;
// 每个属性有一个dep, 存放引用了该属性的视图watcher的
class Dep {
    constructor() {
        this.id = id++;
        this.subs = []; // 保存 watcher
    }
    depend() {
        if (Dep.target) {
            Dep.target.addDep(this);
        }
    }
    addSub(watcher) { // 保存 watcher放在Watcher类中调用，因为watcher的addDep中有去重
        this.subs.push(watcher)
    }
    nodify() {
        this.subs.forEach(watcher => {
            watcher.update();
        })
    }
}

export function pushTarget(watcher) {
    Dep.target = watcher;
}
export function popTarget() {
    Dep.target = null;
}
export default Dep;