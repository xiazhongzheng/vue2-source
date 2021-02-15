# Vue核心原理

## 响应式原理

1. 初始化数据

   ​	`initMixin`方法进行数据的初始化，包括`props`、`methods`、`data`、`computed`、`watch`等

2. 递归属性劫持：`Observer`类

   1. `walk`方法劫持对象上的属性，遍历对象，用`Object.defineProperty`方法劫持每一个属性
   2. 数组方法的劫持：遍历数组，对每个元素进行观测，并且重写数组原型方法，当增加数组的元素时，对新增的元素也要观测。
   3. 通过在数据上增加`__ob__`属性，在响应式数据中获取`Observer`实例上的方法。

3. 数据代理： `vm._data.key`  代理为 `vm.key`，`Object.defineProperty`

## 模板编译

1. 模板编译就是在原型上添加`$mount`方法，调用`compileToFunctions`将template编译成render函数的过程

2. 解析标签和内容

    用正则表达式匹配各种标签和内容，一边匹配一边删除html字符串，

3. 生成ast语法树

   用栈结构表示元素的父子层级，遇到开始标签时创建ast元素，遇到结束标签时弹出栈顶的元素。遇到文本，创建文本元素，type为3，标签的type为1

4. 生成代码

   递归ast语法树，如果是type为1，_c创建标签，第一个参数是标签名，第二个参数是attrs，第三个参数是children继续遍历children。如果是type是3， 如果没有{{}}变量，则\_v创建文本节点，文本用`JSON.stringify`方法转换为字符串，这样可以get对象里面的所有属性；如果有变量，则用\_s转义变量，把变量用`JSON.stringify`转成字符串，和文本连接起来。

5. 生成render函数

   `new Function` 加 `with` ，with绑定this，new Function把文本转成可执行的代码。

## 创建渲染watcher

1. 初次渲染：在`$mount`方法中，调用`mountComponent`方法，核心方法是`vm._render`(调用render函数，生成虚拟dom)和`vm._update`(对比虚拟dom，渲染到页面上)。
2.  生成虚拟dom就是把render函数里面的\_c、\_v、方法对应创建元素、文本的虚拟dom，包含tag, data, key, children, text属性，也可以拓展其他属性。
3. 生成真实dom，用patch方法，对比新老虚拟dom，递归虚拟dom树，将创建的真实dom放在vnode.el上，并挂载到父元素上。

## 依赖收集

1. 每个页面对应一个渲染`watcher`，包含了引用的多个属性，存放每个属性的`dep`

2. 每个属性都要有一个`dep`,每个`dep`中存放着`watcher`,同一个`watcher`会被多个`dep`所记录。

3. Dep类的静态属性target上放着目前渲染的页面的watcher，当引用属性，触发属性的get时，让该属性的dep存放watcher，并且让watcher保存dep，互相引用。观察者模式。

4. 当属性变化时，触发属性的set方法，通知引用该属性的watcher进行更新。

5. 数组的依赖收集：数组没有对每个索引进行劫持，是通过重写数组方法实现劫持的。所以在对最外层的data进行劫持的时候，也给子元素加上dep属性，让子元素添加watcher。如果内部还是数组，不停的进行依赖收集

   

## Watch & Computed

- Watch
  1. watch的三种写法,1.值是对象、2.值是数组、3.值是字符串 （如果是对象可以传入一些watch参数），最终会调用vm.$watch来实现
  2. 所以在原型上统一用$watch方法实现，在对watch初始化的时候，只对watch的不同写法做判断，统一到$watch既可
  3. $watch中调用Watcher类，把Watcher类改造一下，exprOrFn适合函数和表达式的情况，同时标记为options.user = true;
  4. 在Watcher类初始化的时候，this.getter在exprOrFn是字符串的时候，赋值为一个函数，返回vm中该字符对应的属性值，这样既可以触发属性的get，让属性的dep搜集当前用户watcher，也可以当做新值提供给用户的回调。

- Computed
  1. 每个计算属性也都是一个`watcher`,计算属性需要表示lazy:true,这样在初始化watcher时不会立即调用计算属性方法
  2. 默认计算属性需要保存一个dirty属性，用来实现缓存功能
  3. 当依赖的属性变化时，会通知watcher调用update方法，此时我们将dirty置换为true。这样再取值时会重新进行计算。
  4. 如果计算属性在模板中使用，就让计算属性中依赖的数据也记录渲染watcher,这样依赖的属性发生变化也可以让视图进行刷新（所以dep和watcher是多对多的关系，一个dep中也是用栈型结构保存watcher，当取完计算属性，还有Dep.target的时候，就是渲染watcher，需要再调用watcher的一个方法，将计算watcher依赖的属性的dep，依次都收集渲染watcher）

# 生命周期的合并

1. Mixin原理：在`init`时，调用`initGlobalApi`方法，在Vue类上添加`mixin`静态方法，调用`mergeOptions`方法合并Vue上原有的options和当前添加的options
2. 合并生命周期：`mergeOptions`方法分别遍历parent和child的options，并用策略模式合并不用的属性。对于生命周期是用数组合并到一起，其他的data、methods等，是直接用拓展运算符把对象合并，所以有重复的会覆盖。
3. 调用生命周期：`callHook`方法，遍历当前生命周期的数组，依次执行
4. 初始化流程中调用生命周期：初始化`initState`之前调用`beforeCreate`，初始化之后调用`created`。