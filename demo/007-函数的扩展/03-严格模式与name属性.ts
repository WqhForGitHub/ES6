/**
 * 《ES6 标准入门（第三版）》第 7 章：函数的扩展
 * Demo 03：函数内部的严格模式与 name 属性
 *
 * 一、严格模式：
 * 从 ES5 开始，函数内部可以设定为严格模式；ES2016 做了一点修改，
 * 规定只要函数参数使用了默认值、解构赋值、或者扩展运算符，
 * 那么函数内部就不能显式设定为严格模式，否则会报错。
 *
 * 二、name 属性：
 * 函数的 name 属性返回函数名。ES6 对这个属性做出了一些修改：
 * 如果将一个匿名函数赋值给一个变量，ES5 的 name 属性会返回空字符串，
 * 而 ES6 的 name 属性会返回实际的函数名。
 *
 * 运行：node 03-严格模式与name属性.ts
 */

console.log('========== 1. 函数内部的严格模式 ==========');

// 本文件是 ES 模块，模块中的代码自动就是严格模式，
// 因此"函数内部再声明严格模式"的规则只能以注释形式说明：
//
// 1. 以下写法是 ES2016 起的语法错误（参数使用了默认值 / rest / 解构）：
//    function doAnything(a = 1) {
//      'use strict'; // SyntaxError: Illegal 'use strict' directive in function with non-simple parameter list
//    }
//
// 2. 规避方法一：把整个文件/模块设为严格模式（模块天然就是）
// 3. 规避方法二：把严格模式包一层"无参数的函数"：
function outer() {
  'use strict'; // 这个函数没有复杂参数列表，允许声明严格模式
  function inner(a = 1): number {
    return a;
  }
  return inner();
}
console.log(outer()); // 1

// 严格模式下，函数还有以下限制（都会报错）：
//   - 参数名不能是 eval / arguments
//   - 参数不能有同名
//   - 不能使用 arguments.callee / caller

console.log('\n========== 2. 基本的 name 属性 ==========');

function foo(): void {}
console.log(foo.name); // 'foo'

// 具名函数表达式：name 是函数体内部的名字
const bar = function baz(): void {};
console.log(bar.name); // 'baz'

// ES6：匿名函数表达式赋值给变量，name 取变量名
const anonymous = function (): void {};
console.log(anonymous.name); // 'anonymous'

// 箭头函数赋值给变量，同样取变量名
const arrowNamed = (): void => {};
console.log(arrowNamed.name); // 'arrowNamed'

// 变量声明 + 函数体一起的简写（对象方法等）在下一节演示
console.log('\n========== 3. 各种对象的 name 属性 ==========');

const obj = {
  method1(): void {},
  method2: function (): void {},
  method3: (): void => {},
  get accessor(): number {
    return 1;
  },
  set accessor(v: number) {
    void v;
  },
};
console.log(obj.method1.name); // 'method1'
console.log(obj.method2.name); // 'method2'
console.log(obj.method3.name); // 'method3'

// 存取器描述对象里，name 属性放在 get / set 上，而且带前缀
const desc = Object.getOwnPropertyDescriptor(obj, 'accessor');
console.log(desc?.get?.name); // 'get accessor'
console.log(desc?.set?.name); // 'set accessor'

// Symbol 作为方法名，name 属性返回 Symbol 的描述（带方括号）
const symKey = Symbol('描述');
const symObj = {
  [symKey](): void {},
};
console.log(symObj[symKey].name); // '[描述]'

// bind 返回的函数，name 属性值会加上 'bound ' 前缀
console.log(foo.bind({}).name); // 'bound foo'

// new Function 创建的函数，name 属性为 'anonymous'
console.log(new Function().name); // 'anonymous'

// Function 构造函数返回的函数实例，name 属性的值为 'anonymous'
console.log((new Function('return 1')).name); // 'anonymous'

console.log('\n========== 4. 类的 name 属性 ==========');

class Speaker {
  constructor() {} // 构造函数的 name 就是类名
  speak(): void {}
  static create(): Speaker {
    return new Speaker();
  }
}
console.log(Speaker.name); // 'Speaker'（类名）
console.log(Speaker.prototype.speak.name); // 'speak'
console.log(Speaker.create.name); // 'create'（静态方法）
console.log(new Speaker().constructor.name); // 'Speaker'

// 注意：name 属性基本只是"元信息"，不要依赖它做逻辑判断
//（打包工具、绑定函数、代理函数都可能改变它）

export {};
