import {
    generate
} from "./generate";
import parserHTML from "./parser";


// html => ast(只能描述语法 语法不存在的属性无法描述) => render 函数 => 虚拟dom(增加额外的属性) => 生成真实dom
export function compileToFunction(template) {
    // 在模板编译中，把html =>  词法解析（vue2中用的正则） => （开始标签 ， 结束标签，属性，文本） => ast语法树（用的栈型结构）
    let root = parserHTML(template)
    // codegen  转成字符串  让字符串执行  new Function + with
    let code = generate(root)
    // let render = new Function(code);
    let render = new Function(`with(this){return ${code}}`);
    return render;
}