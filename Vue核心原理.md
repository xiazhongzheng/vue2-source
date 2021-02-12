# Vue核心原理

## 响应式原理

1. 初始化数据

   ​	initMixin方法进行数据的初始化，包括props、methods、data、computed、watch等

2. 递归属性劫持：Observer类

   1. walk方法劫持对象上的属性，遍历对象，用Object.defineProperty方法劫持每一个属性
   2. 数组方法的劫持：遍历数组，对每个元素进行观测，并且重写数组原型方法，当增加数组的元素时，对新增的元素也要观测。
   3. 通过在数据上增加\__ob__属性，在响应式数据中获取Observer实例上的方法。_

3. 数据代理： vm._data.key  代理为 vm.key，Object.defineProperty

## 模板编译

1. 模板编译就是在原型上添加$mount方法，调用compileToFunctions将template编译成render函数的过程

2. 解析标签和内容

    用正则表达式匹配各种标签和内容，一边匹配一边删除html字符串，

3. 生成ast语法树

   用栈结构表示元素的父子层级，遇到开始标签时创建ast元素，遇到结束标签时弹出栈顶的元素。遇到文本，创建文本元素，type为3，标签的type为1

4. 生成代码

   递归ast语法树，如果是type为1，_c创建标签，第一个参数是标签名，第二个参数是attrs，第三个参数是children继续遍历children。如果是type是3， 如果没有{{}}变量，则\_v创建文本节点，文本用JSON.stringify方法转换为字符串，这样可以get对象里面的所有属性；如果有变量，则用\_s转义变量，把变量用JSON.stringify转成字符串，和文本连接起来。

5. 生成render函数

   new Function 加 with ，with绑定this，new Function把文本转成可执行的代码。

## 创建渲染watcher

1. 初次渲染：在$mount方法中，调用mountComponent方法，核心方法是vm.\_render(调用render函数，生成虚拟dom)和vm.\_update(对比虚拟dom，渲染到页面上)。
2.  生成虚拟dom就是把render函数里面的\_c、\_v、方法对应创建元素、文本的虚拟dom，包含tag, data, key, children, text属性，也可以拓展其他属性。
3. 生成真实dom，用patch方法，对比新老虚拟dom，递归虚拟dom树，将创建的真实dom放在vnode.el上，并挂载到父元素上。

