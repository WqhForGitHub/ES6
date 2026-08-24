/**
 * 《ES6 标准入门（第三版）》第 2 章：let 和 const 命令
 * Demo 03：块级作用域与函数声明
 *
 * let 实际上为 JavaScript 新增了块级作用域。ES5 只有全局作用域和函数作用域，
 * 这带来很多不合理的场景（内层变量覆盖外层、循环变量泄漏为全局变量）。
 * ES6 允许块级作用域的任意嵌套，内层作用域可以定义外层作用域的同名变量。
 *
 * 运行：node 03-块级作用域与函数声明.ts
 */

console.log('========== 1. ES5 的不合理场景一：内层变量覆盖外层 ==========');

// var 声明的变量提升，导致内层的 tmp 覆盖了外层的 tmp
var tmp: string | Date = new Date();
function es5Bug(): void {
  // TS 会拦截"直接在 var 声明前使用"的写法，这里借助闭包还原运行时的真实行为
  const read = (): string => innerTmp; // innerTmp 是下面 var 声明的变量（提升到函数顶部）
  console.log('es5Bug 中 tmp =', read()); // undefined（var 声明提升，赋值未执行）
  if (false) {
    var innerTmp = 'hello world'; // 声明提升污染整个函数作用域，遮蔽了外层 tmp
  }
}
es5Bug();
console.log('外层 tmp =', tmp); // Date 对象（未被内层污染，因为 if 为 false）

console.log('\n========== 2. ES5 的不合理场景二：循环变量泄漏为全局变量 ==========');

var leaked: string[] = ['a', 'b'];
for (var i = 0; i < leaked.length; i++) {
  console.log(`处理 ${leaked[i]}`);
}
console.log('循环结束后 i 仍然可访问（泄漏为全局变量）：', i); // 2

// let 修复了这个问题：j 只存在于循环的块级作用域内
for (let j = 0; j < leaked.length; j++) {
  console.log(`let 处理 ${leaked[j]}`);
}
// console.log(j); // 报错：j is not defined（不允许泄漏）

console.log('\n========== 3. ES6 的块级作用域：取代匿名立即执行函数（IIFE） ==========');

// ES5：用 IIFE（立即执行函数表达式）创建私有作用域
(function (): void {
  var privateVar: string = 'IIFE 中的私有变量';
  console.log(privateVar);
})();
// console.log(privateVar); // 报错：IIFE 外不可见

// ES6：块级作用域直接达到同样效果，写法更简洁
{
  let privateVar: string = '块级作用域中的私有变量';
  const alsoPrivate: string = 'const 同样受块级作用域约束';
  console.log(privateVar, alsoPrivate);
}
// console.log(privateVar); // 报错：块外不可见

console.log('\n========== 4. 块级作用域的任意嵌套 ==========');

// 外层作用域无法读取内层作用域的变量；内层可以定义外层的同名变量
{
  {
    {
      let deepest: string = '最内层';
      console.log('嵌套块中读取：', deepest);
    }
    // console.log(deepest); // 报错：外层不能读取内层的变量
  }
  let sameName: string = '内层的同名变量覆盖外层';
  console.log(sameName);
}

console.log('\n========== 5. 块级作用域与函数声明 ==========');

// ES5 规定函数只能在顶层作用域和函数作用域之中声明，不能在块级作用域声明，
// 但浏览器为了兼容旧代码都支持了"块内函数声明"，且行为不一，是历史遗留问题。
//
// ES6 引入了块级作用域，明确允许在块级作用域之中声明函数：
// - 相当于 let，在块级作用域之外不可引用
// - 不存在函数声明提升到全局/函数顶部的行为
if (true) {
  function inBlock(): string {
    return '块级作用域中的函数声明';
  }
  inBlock(); // 块内调用没有问题
  console.log('块内调用函数：', inBlock());
}
// inBlock(); // 报错：inBlock is not defined（块外不可见）
// TS 提示：块内声明的函数，TS 同样按块级作用域处理，块外访问会直接报编译错误

// 考虑到环境导致的行为差异太大，应避免在块级作用域内声明函数；
// 确实需要时，使用函数表达式：
if (true) {
  const fn = function (): string {
    return '函数表达式写在块内';
  };
  console.log(fn());
}

// do 表达式（提案）：让块级作用域变成表达式，可以返回值（目前是提案，仅供了解）
// const result = do { let t = 2 * 3; t + 1 }; // 7（提案语法，当前环境不可用）

console.log('\n========== 6. 业务场景：结算页的"用完即弃"中间变量 ==========');

// 需求：结算时需要"小计、折后价、运费"等中间结果参与计算，
// 但算完之后这些中间量不该再被后面的代码读到（防止误用、防篡改）。
// 用块级作用域把中间变量圈起来，用完即弃。

const cartItems: Array<{ price: number; qty: number }> = [
  { price: 9900, qty: 2 },
  { price: 35900, qty: 1 },
];

let payableTotal: number; // 结算页真正需要的最终金额（分）
{
  // 这些中间量只在本块内存在：
  let subtotal: number = 0;
  for (const { price, qty } of cartItems) {
    subtotal += price * qty;
  }
  const memberDiscount: number = Math.trunc(subtotal * 0.95); // 金卡 95 折（分以下抹零）
  const shippingFee: number = subtotal >= 19900 ? 0 : 800; // 满 199 元免运费
  payableTotal = memberDiscount + shippingFee;
  console.log('（块内中间结果）小计 / 折后 / 运费：', subtotal, memberDiscount, shippingFee);
}
console.log('应付总额（分）：', payableTotal);
// console.log(subtotal); // 报错：中间变量已随块结束而消失，外部引用不到

// 对比：ES5 时代为了"用完即弃"必须包一层 IIFE（见本文件第 3 节），代码噪音大得多

export {};
