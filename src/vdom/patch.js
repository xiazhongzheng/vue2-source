export function patch(oldVnode, vnode) {
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

function createEle(vnode) {
    let {
        tag,
        data,
        children,
        text,
        vm
    } = vnode;
    if (typeof tag === 'string') {
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