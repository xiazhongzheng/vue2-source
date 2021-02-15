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
const liftCycleHooks = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDistroy',
    'distroyed',
]

const strats = {};

function mergeHook(parentVal, childVal) {
    if (childVal) {
        if (parentVal) {
            // concat可以连接数组也可以添加一个元素
            return parentVal.concat(childVal);
        } else {
            // childVal的写法可以是一个函数，也可以是一个数组
            return Array.isArray(childVal) ? childVal : [childVal];
        }
    } else {
        return parentVal; // parentVal已经转成数组
    }
}

liftCycleHooks.forEach(hook => {
    strats[hook] = mergeHook;
});

export function mergeOptions(parent, child) {
    const options = {};
    for (const key in parent) {
        if (Object.hasOwnProperty.call(parent, key)) {
            mergeField(key)
        }
    }
    for (const key in child) {
        if (Object.hasOwnProperty.call(child, key)) {
            if (parent.hasOwnProperty(key)) {
                continue;
            }
            mergeField(key);
        }
    }

    function mergeField(key) {
        let parentVal = parent[key];
        let childVal = child[key];
        if (strats[key]) {
            // 策略模式
            options[key] = strats[key](parentVal, childVal);
        } else {
            if (isObject(parentVal) && isObject(childVal)) {
                // 如果合并的内容是对象，则进行对象的合并
                options[key] = {
                    ...parentVal,
                    ...childVal
                }
            } else {
                // 如果是普通值，则直接替换
                options[key] = childVal;
            }
        }
    }
    return options;
}
