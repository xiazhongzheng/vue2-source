export function isFunction(val) {
    return typeof val === 'function'
}
export function isObject(val) {
    return typeof val === 'object' && val !== null
}


let callbacks = []; // nextTick可能调用多次，也要做去重
let waiting = false;


function flushCallbacks() {
    callbacks.forEach(cb => cb());
    waiting = false;
}
function timer(flushCallbacks) {
    let timerFn = () => {};
    if(Promise) {
        // 微任务
        timerFn = ()=> {
            Promise.resolve().then(flushCallbacks);
        }
    } else if (MutationObserver){
        // 微任务
        let textNode = document.createTextNode(1);
        let observe = new MutationObserver(flushCallbacks);
        observe.observe(textNode, {
            characterData: true
        });
        timerFn = () => {
            textNode.textContent = 3;
        }
    } else if (setImmediate) {
        // 宏任务
        timerFn = () => {
            setImmediate(flushCallbacks);
        }
    } else {
        // 宏任务
        timerFn = () => {
            setTimeout(flushCallbacks);
        }
    }
    timerFn();
    waiting = false;
}

export function nextTick(cb) { 
    // nextTick 统一了vue内部的异步更新和用户调用的的异步
    // 多次调用nextTick，也执行一次 - 节流
    callbacks.push(cb);
    if (!waiting) {
        // setTimeout(flushCallbacks, 0);
        timer(flushCallbacks)
        waiting = true;
    }
}