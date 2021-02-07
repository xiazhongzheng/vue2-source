const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{aaaaa}}

function genProps(attrs) {
    let str = '';
    attrs.forEach(attr => {
        if (attr.name === 'style') {
            let styleObj = {};
            attr.value.replace(/([^:;]+)\:([^:;]+)/g, function () {
                styleObj[arguments[1]] = arguments[2]
            })
            attr.value = styleObj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    });
    // JSON.stringify  把value拼成字符串
    return `{${str.slice(0,-1)}}`
}

function gen(el) {
    if (el.tagType === 1) {
        // 元素是标签
        return generate(el)
    } else {
        // 元素是文本
        let text = el.text;
        if (!defaultTagRE.test(text)) {
            // 纯文本
            return `_v(${JSON.stringify(text)})`
        } else {
            // 有变量
            let tokens = [];
            let match;
            let lastIndex = defaultTagRE.lastIndex = 0; // 重置正则的lastIndex
            // console.log(defaultTagRE.exec(text))
            while(match = defaultTagRE.exec(text)) {
                let index = match.index;
                if (index > lastIndex) {
                    // 变量不是目前匹配的开头，开头是文本
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`) // 变量可能换行, _s JSON.stringify
                lastIndex = index + match[0].length;
            }
            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`
        }
    }
}

function genChildren(el) {
    let children = el.children;
    if (children) {
        return children.map(e => gen(e)).join(',')
    } else {
        return false
    }
}

export function generate(el) { // _c('div', {id:"app"}, children)
    let children = genChildren(el);
    let code = `_c('${el.tag}', ${
        el.attrs.length ? genProps(el.attrs) : 'undefined'
    }${ children? ',' + children: '' })`
    return code
}