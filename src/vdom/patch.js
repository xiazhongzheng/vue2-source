export function patch(oldVnode, vnode) {
    if (!oldVnode) {
        return createEle(vnode); // 如果没有el元素，就直接根据虚拟节点返回真实节点
    }
    if (oldVnode.nodeType == 1) {
        // 第一次挂载时，oldVnode 是 id=app 的 dom节点
        let parentEle = oldVnode.parentNode;
        let ele = createEle(vnode);
        parentEle.insertBefore(ele, oldVnode.nextSibling);
        parentEle.removeChild(oldVnode);
        // 返回新的$el
        return ele
    }
}
function createComponent(vnode) {
    let i = vnode.data;
    // vnode.data.hook.init执行
    // init里面创建组件实例，放到VNode上，方便在创建真实节点时候取出来
    if ((i = i.hook) && (i = i.init)) {
        i(vnode);
    }
    if(vnode.componentInstance) {
        return true;
    }

}
function createEle(vnode) {
    let {
        tag,
        data,
        children,
        text,
        vm
    } = vnode;
    if (typeof tag === 'string') {
        // 组件
        if (createComponent(vnode)) {
            return vnode.componentInstance.$el;
        }
        // 元素
        vnode.el = document.createElement(tag);
        children.forEach(child => {
            vnode.el.appendChild(createEle(child))
        })
    } else {
        // 文本
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;
}