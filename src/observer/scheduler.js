// 调度中心
// 做watcher的缓存的，只执行一次watcher的更新

let queue = [];
let has = new Set();
let pending = false; // 只调用一次watcher的更新


function flushSchedulerQueue() {
    for (let i = 0; i < queue.length; i++) {
        queue[i].run();
    }
    queue = [];
    has = new Set();
    pending = false;
}

export function queueWatcher(watcher) {
    let id = watcher.id;
    if (!has.has(id)) {
        queue.push(watcher);
        has.add(id);
        if (!pending) {
            // 只在第一次属性的赋值时调用，但因为是异步，所以在更新时，获取的属性数据仍然是最后一个
            setTimeout(flushSchedulerQueue, 0);
            pending = true;
        }
    }
}