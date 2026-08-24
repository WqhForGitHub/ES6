/**
 * 《ES6 标准入门（第三版）》第 7 章：函数的扩展
 * Demo 05：尾调用优化
 *
 * 尾调用（Tail Call）是函数式编程的一个重要概念，指某个函数的最后一步
 * 是调用另一个函数。ES6 明确规定，所有 ECMAScript 的实现都必须部署
 * "尾调用优化"（严格模式下生效）。
 *
 * 注意：V8 / Node.js 实际上并未实现尾调用优化（Safari / JavaScriptCore 实现了），
 * 本 demo 演示的是：什么调用才算"尾调用"、如何把递归改写成尾递归形式，
 * 以及在不支持优化的引擎里如何用"蹦床函数"避免栈溢出。
 *
 * 运行：node 05-尾调用优化.ts
 */

console.log('========== 1. 什么才是尾调用 ==========');

// 尾调用：函数的最后一步是调用另一个函数（调用之后不再有任何操作）
function tailCall(x: number): number {
  return identity(x); // 是尾调用
}
function identity(x: number): number {
  return x;
}
console.log(tailCall(1)); // 1

// 以下都不是尾调用（调用之后还有操作 / 不在最后一步）：
function notTail1(x: number): number {
  return identity(x) + 1; // 调用之后还有加法
}
function notTail2(x: number): number {
  const y = identity(x); // 调用结果赋值后再返回（最后一步是 return 变量）
  return y;
}
function notTail3(x: number): number | undefined {
  return void identity(x); // 最后一步是 void 运算（返回 undefined）
}
console.log(notTail1(1), notTail2(1), notTail3(1)); // 2 1 undefined

// 尾调用不一定出现在函数尾部，只要是最后一步操作即可：
function tailCallMiddle(x: number): string {
  if (x > 0) {
    return positive(x); // 这也是尾调用（这个分支的最后一步）
  }
  return '非正数';
}
function positive(x: number): string {
  return `正数 ${x}`;
}
console.log(tailCallMiddle(5), tailCallMiddle(-1)); // 正数 5 非正数

console.log('\n========== 2. 尾递归 ==========');

// 递归非常耗费内存，因为需要同时保存成千上百个调用帧，
// 很容易发生"栈溢出"（stack overflow）。
// 对于尾递归来说，由于只存在一个调用帧，永远不会发生栈溢出。

// 普通递归（不是尾递归）：调用之后还有乘法运算
function badFactorial(n: number): number {
  if (n === 1) {
    return 1;
  }
  return n * badFactorial(n - 1); // 乘法发生在递归调用之后，保留了外层调用帧
}
console.log(badFactorial(5)); // 120

// 改写成尾递归：把"累积结果"作为参数传递（acc 是 accumulator 的缩写）
function factorial(n: number, acc: number = 1): number {
  if (n === 1) {
    return acc;
  }
  return factorial(n - 1, n * acc); // 尾调用：最后一步且不再使用外层变量
}
console.log(factorial(5)); // 120（结果与上面一致）
console.log(factorial(170)); // 7.257415615307999e+306（再大就超出 Number 范围）

// 复杂一点的例子：斐波那契数列的尾递归改写
function fibonacci(n: number, acc1: number = 1, acc2: number = 1): number {
  if (n <= 2) {
    return acc2;
  }
  return fibonacci(n - 1, acc2, acc1 + acc2);
}
console.log(fibonacci(10)); // 55（F(10)）
console.log(fibonacci(100)); // 3.542248481792619e+38（F(100)，超出安全整数范围，仅演示规模）

console.log('\n========== 3. 蹦床函数：不支持 TCO 的引擎里的替代方案 ==========');

// V8 / Node 未实现尾调用优化，深度尾递归依然会栈溢出。
// 解决办法：把"递归调用"改为"返回一个函数"，用循环逐步执行（蹦床函数）。
type Thunk<T> = T | (() => Thunk<T>);

function trampoline<A extends unknown[], R>(fn: (...args: A) => Thunk<R>): (...args: A) => R {
  return function trampolined(...args: A): R {
    let result: Thunk<R> = fn(...args);
    while (typeof result === 'function') {
      result = (result as () => Thunk<R>)();
    }
    return result as R;
  };
}

// 每一步返回"下一步要做的事"，而不是直接调用自身
function sumTo(n: number, total: number = 0): Thunk<number> {
  if (n === 0) {
    return total;
  }
  return () => sumTo(n - 1, total + n);
}

const safeSum = trampoline(sumTo);
console.log(safeSum(10)); // 55
console.log(safeSum(100000)); // 5000050000（10 万层也不会栈溢出）

console.log('\n========== 4. 补充说明 ==========');

// 1. 尾调用优化只在严格模式下开启：
//    正常模式下，函数内部有两个变量可以跟踪函数的调用栈（func.arguments / func.caller），
//    尾调用优化发生时（调用帧被复用），这两个变量会失真，因此严格模式把它们禁用了。
//    （本文件是模块，自动处于严格模式）
//
// 2. 现实建议：由于主流引擎（V8 / SpiderMonkey）未实现 TCO，
//    深度递归请改用循环或蹦床函数，不要指望"尾递归"本身解决问题。

export {};
