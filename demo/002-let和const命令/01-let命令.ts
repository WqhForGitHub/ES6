/**
 * 《ES6 标准入门（第三版）》第 2 章：let 和 const 命令
 * Demo 01：let 命令
 *
 * let 命令的用法类似于 var，但所声明的变量只在 let 命令所在的代码块内有效，
 * 不存在变量提升，且存在"暂时性死区"。
 *
 * 运行：node 01-let命令.ts
 */

console.log('========== 1. 基本用法：块级作用域 ==========');

{
  let a: number = 10;
  var b: number = 1;
}
// console.log(a); // 报错：a is not defined（let 只在块内有效）
console.log('var b 在块外可访问：', b); // 1（var 不受块限制）

console.log('\n========== 2. 典型场景：for 循环 ==========');

// var 声明的计数器是全局的，所有循环中创建的函数共享同一个 i
const a1: Array<() => void> = [];
for (var i = 0; i < 10; i++) {
  a1[i] = function (): void {
    console.log(i);
  };
}
a1[6](); // 10（循环结束后 i 为 10）

// let 声明的计数器只在本轮循环的块级作用域内有效
const a2: Array<() => void> = [];
for (let j = 0; j < 10; j++) {
  a2[j] = function (): void {
    console.log(j);
  };
}
a2[6](); // 6（每轮循环的 j 都是新的变量）

// 另外：for 循环的"设置循环变量"是一个父作用域，循环体内部是一个单独的子作用域
for (let k = 0; k < 1; k++) {
  let k = 'inside'; // 不报错：内部的 k 与循环变量 k 不在同一个作用域
  console.log('循环体内部的 k：', k);
}

console.log('\n========== 3. 不存在变量提升 ==========');

// var 命令会发生"变量提升"，即声明被提升到作用域顶部，声明语句之前就能访问，值为 undefined
// 注意：赋值不会提升，仍留在原位置执行
var hoistedVar: number | undefined; // 运行时等价于"先执行 var hoistedVar; 提升到顶部"
console.log('var 提升：', hoistedVar); // undefined（声明已提升，赋值尚未执行）
hoistedVar = 1; // 赋值在原位置执行
console.log('var 赋值后：', hoistedVar); // 1

// let 声明的变量一定要在声明之后使用，否则报错（见下一节的暂时性死区）
// console.log(letVar); // 报错：Cannot access 'letVar' before initialization
// let letVar = 1;

console.log('\n========== 4. 暂时性死区（TDZ） ==========');

// 只要块级作用域内存在 let 命令，它所声明的变量就"绑定"（binding）这个区域，
// 不再受外部同名变量的影响。在声明之前访问，一律报 ReferenceError。

let value: string = 'outer';
function tdzDemo(): void {
  // 说明：TS 的静态检查会拦截"声明前直接使用 let 变量"的写法，
  // 因此这里借助闭包在运行时证明暂时性死区的存在
  try {
    const read = (): string => value; // 闭包引用下面才声明的局部 value（绑定本作用域）
    console.log(read()); // ReferenceError: Cannot access 'value' before initialization
    let value = 'inner';
  } catch (e) {
    const err = e instanceof ReferenceError ? e : new Error(String(e));
    console.log('捕获错误：', err.constructor.name); // ReferenceError
    console.log('错误信息：', err.message);
  }
}
tdzDemo();
console.log('外层 value 不受影响：', value);

// 再看一个隐蔽的死区：typeof 对未声明的 let 变量不再"安全"
function unsafeTypeof(): void {
  try {
    const typeOfVar = (): string => typeof undeclaredLet; // typeof 在闭包内对死区变量求值
    console.log(typeOfVar()); // ReferenceError（let 变量声明前 typeof 也会报错）
    let undeclaredLet = 1;
  } catch (e) {
    const err = e instanceof ReferenceError ? e : new Error(String(e));
    console.log('typeof 死区变量同样报错：', err.constructor.name);
  }
}
unsafeTypeof();

// 隐蔽的死区还有：函数参数默认值引用同名变量
// function bar(x = y, y = 2) {} // 报错：参数 y 处于死区
// function bar2(x = 2, y = x) {} // 正确

console.log('\n========== 5. 不允许重复声明 ==========');

// let 不允许在相同作用域内重复声明同一个变量，包括与 var 混合声明：
//   function f() { let a; var a; }     // SyntaxError
//   function f() { let a; let a; }     // SyntaxError
//   function f(a) { let a; }           // SyntaxError（不能声明与参数同名的变量）
// 以下写法是允许的：不同作用域
{
  let shadow: string = '外层';
  {
    let shadow: string = '内层'; // 不报错，属于不同作用域
    console.log('内层 shadow：', shadow);
  }
  console.log('外层 shadow：', shadow);
}

console.log('\n========== 6. 业务场景：商品卡片点击（var 的经典线上事故） ==========');

// 事故复盘：商城首页用 var 循环给每个商品卡片绑定"查看详情"事件，
// 结果无论点击哪个卡片，打开的都是"最后一个商品"。
// 原因：所有事件处理函数共享同一个循环变量，点击时才读取下标，此时早已变成总数。

interface Goods {
  id: number;
  title: string;
}
const goodsList: Goods[] = [
  { id: 101, title: '手机' },
  { id: 102, title: '耳机' },
  { id: 103, title: '充电器' },
];

// 用 var 模拟事件处理函数（点击时才读取下标）
const handlersByVar: Array<() => number> = [];
for (var badIndex = 0; badIndex < goodsList.length; badIndex++) {
  handlersByVar.push((): number => badIndex); // 闭包捕获的是"同一个 badIndex"
}
console.log('var 版本点击拿到的下标：', handlersByVar.map((h) => h())); // [ 3, 3, 3 ]（越界！）

// 用 let 修复：每轮循环都会创建一个独立的块级作用域，各卡片拿到正确下标
const handlersByLet: Array<() => string> = [];
for (let goodIndex = 0; goodIndex < goodsList.length; goodIndex++) {
  handlersByLet.push((): string => goodsList[goodIndex].title); // 每轮的 goodIndex 都是新变量
}
console.log('let 修复后点击的商品：', handlersByLet.map((h) => h())); // [ '手机', '耳机', '充电器' ]

export {};
