/**
 * 《ES6 标准入门（第三版）》第 7 章：函数的扩展
 * Demo 01：函数参数的默认值
 *
 * ES6 允许为函数的参数设置默认值，即直接写在参数定义的后面。
 *
 * 运行：node 01-函数参数的默认值.ts
 */

console.log('========== 1. 基本用法 ==========');

function greet(x: string, y: string = 'World'): string {
  return `${x} ${y}`;
}
console.log(greet('Hello')); // Hello World
console.log(greet('Hello', 'ES6')); // Hello ES6
console.log(greet('Hello', '')); // Hello（空字符串不是 undefined，默认值不生效）

// 参数变量默认是声明的，所以不能用 let / const 再次声明：
// function greet2(x, y = 'World') { let y = 1; } // SyntaxError

// 使用参数默认值时，函数不能有同名参数：
// function greet3(x, x, y = 1) {} // SyntaxError

console.log('\n========== 2. 与解构赋值结合 ==========');

// 参数默认值可以与解构赋值的默认值结合起来使用
function foo1({ x, y = 5 }: { x?: number; y?: number } = { x: 1 }): void {
  console.log(x, y);
}
foo1({}); // undefined 5（属性 y 是 undefined，触发属性默认值）
foo1({ x: 1 }); // 1 5
foo1({ x: 1, y: 2 }); // 1 2
foo1(); // 1 5（整个参数是 undefined，触发参数默认值 { x: 1 }）

// 双重默认值是常见的"可选配置"写法：
//   - 外层 = {}：调用时不传第二个参数
//   - 内层 method = 'GET' 等：只传部分配置项
function request(
  url: string,
  {
    body = '',
    method = 'GET',
    headers = {},
  }: { body?: string; method?: string; headers?: Record<string, string> } = {},
): string {
  return `${method} ${url}（body：${JSON.stringify(body)}，headers：${JSON.stringify(headers)}）`;
}
console.log(request('https://api.example.com')); // GET ...
console.log(request('https://api.example.com', { method: 'POST', body: 'a=1' })); // POST ...

console.log('\n========== 3. 参数默认值的位置 ==========');

// 通常情况下，定义了默认值的参数应该是函数的尾参数。
// 如果非尾的参数设置了默认值，实际上这个参数是没法省略的
function f1(x: number = 1, y: number): string {
  return `[${x}, ${y}]`;
}
console.log(f1(undefined, 2)); // [1, 2]（只能显式传入 undefined 来触发默认值）
// f1(, 2); // 语法错误
// f1(2);   // 运行时报错：y 未收到值（TS 也会直接标红）

// 如果传入 undefined，将触发该参数的默认值；null 则没有这个效果
function f2(x: number = 1): number {
  return x;
}
console.log(f2(undefined), f2(null as unknown as number)); // 1 null

console.log('\n========== 4. 函数的 length 属性 ==========');

// 指定了默认值以后，函数的 length 属性将返回"没有指定默认值"的参数个数
function length1(a: number): void { void a; }
function length2(a: number, b: number): void { void a; void b; }
function length3(a = 1, b: number, c: number): void { void a; void b; void c; }
function length4(a: number, b = 1): void { void a; void b; }
console.log(length1.length, length2.length); // 1 2
console.log(length3.length); // 0（默认值之后的参数都不计入 length）
console.log(length4.length); // 1

// rest 参数也不计入 length 属性（见下一个 demo）
function length5(...args: number[]): void { void args; }
console.log(length5.length); // 0

console.log('\n========== 5. 作用域 ==========');

// 一旦设置了参数的默认值，函数进行声明初始化时，参数会形成一个单独的作用域；
// 等到初始化结束，这个作用域就会消失（不设置参数默认值时不会出现这个现象）
let scopedX = 1;
function readsOuterX(y: number = scopedX): number {
  // 参数默认值里的 scopedX 指向"参数作用域的外层"（模块顶层）的 scopedX
  return y;
}
console.log(readsOuterX()); // 1

// 书中经典的对比（TS 的静态检查会直接标红，故以注释说明）：
//   let x = 1;
//   function f(y = x) {
//     let x = 2;  // 函数体内的 x 与参数默认值里的 x 不是同一个
//     console.log(y);
//   }
//   f(); // 1（y 取的是外层的 x）
//
//   function f(y = x) {  // 参数作用域里没有 x，外层也没有定义 x，
//     let x = 2;         // 求值时 x 处于"不存在/死区"状态
//     console.log(y);
//   }
//   f(); // ReferenceError: x is not defined

// 参数默认值是"惰性求值"的：每次调用时都会重新计算默认值表达式的值
let callCount = 0;
function lazyDefault(x: number = (callCount += 1)): number {
  return x;
}
lazyDefault();
lazyDefault();
console.log('默认值表达式求值次数：', callCount); // 2（每次调用都求值）

console.log('\n========== 6. 应用：实现"必填参数" ==========');

// 利用参数默认值，可以指定某一个参数不得省略，省略就抛出错误
function throwIfMissing(): never {
  throw new Error('缺少参数');
}
function mustHave(mandatory: number = throwIfMissing()): number {
  return mandatory;
}
console.log(mustHave(42)); // 42
try {
  mustHave(); // 未传参数 -> 执行默认值表达式 -> 抛出错误
} catch (e) {
  console.log('缺少参数被拦截：', e instanceof Error); // true
}

// 另外可以把参数默认值设为 undefined，表示这个参数可以省略：
function optional(x: number, y: number | undefined = undefined): string {
  return `x=${x} y=${y}`;
}
console.log(optional(1)); // x=1 y=undefined

export {};
