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
    } else {
        console.log(oldVnode, vnode);
        // diff 
        if (oldVnode.tag !== vnode.tag) {
            // 标签不一样直接替换
            return oldVnode.el.parentNode.replaceChild(createEle(vnode), oldVnode.el, );
        }
        // 标签一样
        let el = vnode.el = oldVnode.el; // 复用el
        if (vnode.tag === undefined) {
            // 都是文本
            if (vnode.text !== oldVnode.text) {
                el.textContent = vnode.text;
            }
            return;
        }
        // 标签一样， 复用标签，更新属性
        patchProps(vnode, oldVnode.data);

        // 比较儿子
        let newChildren = vnode.children || [];
        let oldChildren = oldVnode.children || [];
        // 新老都有
        if (newChildren.length && oldChildren.length) {

        } else if (oldChildren.length) {
            // 新没有， 老有
            el.innerHTML = ``;
        } else {
            // 老没有，新有
            for (let i = 0; i < newChildren.length; i++) {
                el.appendChild(createEle(newChildren[i]));
            }
        }
    }
}

// 初始渲染属性，或者更新比较属性
function patchProps(vnode, oldProps = {}) {
    let newProps = vnode.data || {};
    let el = vnode.el;
    let newStyle = newProps.style || {};
    let oldStyle = oldProps.style || {};

    // 把新属性中没有的老的属性，删除
    for (const key in oldProps) {
        if (!newProps[key]) {
            el.removeAttribute(key)
        }
    }
    for (const key in oldStyle) {
        if (!newStyle[key]) {
            el.style[key] = ''
        }
    }

    // 新的属性放到el上
    for (const key in newProps) {
        if (key == 'style') {
            for (const styleName in newProps[key]) {
                el.style[styleName] = newProps[key][styleName];
            }
        } else {
            el.setAttribute(key, newProps[key]);
        }
    }
}

function createComponent(vnode) {
    let i = vnode.data;
    // vnode.data.hook.init执行
    // init里面创建组件实例，放到VNode上，方便在创建真实节点时候取出来
    if ((i = i.hook) && (i = i.init)) {
        i(vnode);
    }
    if (vnode.componentInstance) {
        return true;
    }

}
export function createEle(vnode) {
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
        patchProps(vnode);
        children.forEach(child => {
            vnode.el.appendChild(createEle(child))
        })
    } else {
        // 文本
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;
}