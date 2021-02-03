let oldArrayPrototype = Array.prototype;
// Object.create继承
export let arrayMethods = Object.create(oldArrayPrototype);

let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]

methods.forEach(method => {
    arrayMethods[method] = function (...args) {
        // call绑定新的方法的this指向
        oldArrayPrototype[method].call(this, ...args);
        let inserted;
        let ob = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.splice(2)
                break;
            default:
                break;
        }
        if (inserted) ob.observeArray(inserted);
    }
})