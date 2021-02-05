const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名 
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //  用来获取的标签名的 match后的索引为1的
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配开始标签的 
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配闭合标签的
//           aa  =   "  xxx "  | '  xxxx '  | xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // a=b  a="b"  a='b'
const startTagClose = /^\s*(\/?)>/; //     />   <div/>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{aaaaa}}

// 在模板编译中，把html =>  词法解析（vue2中用的正则） => （开始标签 ， 结束标签，属性，文本） => ast语法树（用的栈型结构）
let root = null;
let stack = [];
function parserHTML(html) {
    function createAstElement(tagName, attrs) {
        return {
            tag: tagName,
            tagType: 1,
            parent: null,
            children: [],
            attrs
        }
    }
    function start(tagName, attributes) {
        let parent = stack[stack.length - 1];
        let element = createAstElement(tagName, attributes);
        if (!root) {
            root = element;
        }
        element.parent = parent;
        if (parent) {
            parent.children.push(element);
        }
        stack.push(element);
    }

    function end(tagName) {
        let last = stack.pop();
        if (last.tag !== tagName){
            throw new Error('标签闭合有误')
        }
    }

    function chars(text) {
        text = text.replace(/\s/g, "");
        let parent = stack[stack.length - 1];
        if (text) {
            parent.children.push({
                tagType: 3,
                text
            })
        }
    }

    function advance(len) {
        html = html.substring(len);
    }

    function parseStartTag() {
        const start = html.match(startTagOpen);
        if (start) {
            // 如果是开始标签，返回一个带有tagName和attrs的对象
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length);
            let end;
            let attr;
            // console.log(html)
            // 循环匹配属性  条件是  是属性 并且不是 结束符
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                // console.log('attr', attr);
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                });
                advance(attr[0].length)
            }
            if (end) {
                advance(end[0].length)
            }
            // console.log('match',match)
            return match
        }

        return false;
    }

    while (html) {
        let textEnd = html.indexOf('<');
        if (textEnd === 0) {
            // 匹配到< 可能是开始或结束标签
            let startTagMatch = parseStartTag(html);
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }
            let endTagMatch = html.match(endTag);
            if (endTagMatch) {
                end(endTagMatch[1]);
                advance(endTagMatch[0].length);
                continue;
            }
        }

        // 文本
        let text;
        if (textEnd > 0) {
            text = html.substring(0, textEnd);
        }
        if (text) {
            chars(text);
            advance(text.length);
        }
    }
    console.log('root', root);
    return root;
}


export function compileToFunction(template) {
    parserHTML(template)
}