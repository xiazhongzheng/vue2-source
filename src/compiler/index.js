const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名 
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //  用来获取的标签名的 match后的索引为1的
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配开始标签的 
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配闭合标签的
//           aa  =   "  xxx "  | '  xxxx '  | xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // a=b  a="b"  a='b'
const startTagClose = /^\s*(\/?)>/; //     />   <div/>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{aaaaa}}

function parserHTML(html) {
    function start(tagName, attributes) {
        console.log('start-', tagName, attributes)
    }

    function end(tagName) {
        console.log('end-', tagName)
    }

    function chars(text) {
        console.log('text', text)
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
}


export function compileToFunction(template) {
    parserHTML(template)
}