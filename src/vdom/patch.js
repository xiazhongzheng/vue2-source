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
            // 采用双指针的方式进行比较
            patchChildren(el, oldChildren, newChildren);
        } else if (oldChildren.length) {
            // 新没有， 老有
            el.innerHTML = ``;
        } else {
            // 老没有，新有
            for (let i = 0; i < newChildren.length; i++) {
                el.appendChild(createEle(newChildren[i]));
            }
        }
        return el;
    }
}

function isSameVnode(oldVnode, newVnode) {
    return (oldVnode.tag == newVnode.tag) && (oldVnode.key == newVnode.key)
}

function patchChildren(el, oldChildren, newChildren) {
    let oldStartIndex = 0;
    let oldStartVnode = oldChildren[oldStartIndex];
    let oldEndIndex = oldChildren.length - 1;
    let oldEndVnode = oldChildren[oldEndIndex];

    let newStartIndex = 0;
    let newStartVnode = newChildren[newStartIndex];
    let newEndIndex = newChildren.length - 1;
    let newEndVnode = newChildren[newEndIndex];

    const makeIndexByKey = (children) => {
        return children.reduce((memo, current, index) => {
            if (current.key) {
                memo[current.key] = index;
            }
            return memo;
        }, {});
    }
    const keysMap = makeIndexByKey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (!oldStartVnode) {
            // 乱序比较时，移动位置后为null的地方，要跳过
            oldStartVnode = oldChildren[++oldStartIndex];
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex];
        }
        if (isSameVnode(oldStartVnode, newStartVnode)) {
            // 头头比较
            patch(oldStartVnode, newStartVnode);
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            // 尾尾比较
            patch(oldEndVnode, newEndVnode);
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            // 头尾比较
            patch(oldStartVnode, newEndVnode);
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
            oldStartVnode = oldChildren[++oldStartIndex];
            newEndVnode = newChildren[--newEndIndex];
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            // 尾头比较
            patch(oldEndVnode, newStartVnode);
            el.insertBefore(oldEndVnode.el, oldStartVnode.el);
            oldEndVnode = oldChildren[--oldEndIndex];
            newStartVnode = newChildren[++newStartIndex];
        } else {
            // 乱序比对  diff核心
            // 根据key和对应的索引做一个映射表，这样可以直接找到需要移动的元素
            // 不需要每次再遍历
            let moveIndex = keysMap[newStartVnode.key];
            if (moveIndex == undefined) {
                // 没找到，没得移动，直接创建
                el.insertBefore(createEle(newStartVnode), oldStartVnode.el);
            } else {
                let moveVnode = oldChildren[moveIndex];
                oldChildren[moveIndex] = null; // 节点被移动走了，要用null占位，否则key 和 index的映射表就会失效了。
                el.insertBefore(moveVnode.el, oldStartVnode.el);
                patch(moveVnode, oldStartVnode);
            }
            newStartVnode = newChildren[++newStartIndex];
        }
    }

    // 添加的  没有对比完的
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            // el.appendChild(createEle(newChildren[i]));
            // 不一定是往后插入
            let anchor = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
            el.insertBefore(createEle(newChildren[i]), anchor)
        }
    }
    // 删除的
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            el.removeChild(oldChildren[i]);
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