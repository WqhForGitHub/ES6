/**
 * 《ES6 标准入门（第三版）》第 10 章：Symbol
 * Demo 03：Symbol.for() 与 Symbol.keyFor()
 *
 * 有时希望重新使用同一个 Symbol 值，Symbol.for 方法可以做到这一点。
 * 它接受一个字符串作为参数，然后搜索有没有以该参数作为名称的 Symbol 值：
 * 如果有，就返回这个 Symbol 值；否则就新建并返回一个以该字符串为名称的 Symbol 值。
 *
 * 运行：node 03-Symbol.for与keyFor.ts
 */

console.log('========== 1. Symbol.for()：登记在全局环境中的 Symbol ==========');

// Symbol() 写法没有登记机制：每次调用都会返回一个新的 Symbol 值
console.log(Symbol('bar') === Symbol('bar')); // false

// Symbol.for() 会被登记在全局环境中供搜索，同样的 key 返回同一个值
// （显式标注为 symbol：const 声明会推断出 unique symbol，=== 比较会被 TS 拦截）
const s1: symbol = Symbol.for('foo');
const s2: symbol = Symbol.for('foo');
console.log(s1 === s2); // true

console.log('\n========== 2. Symbol.keyFor()：返回已登记的 key ==========');

// Symbol.keyFor 方法返回一个已登记的 Symbol 类型值的 key
console.log(Symbol.keyFor(s1)); // foo
console.log(Symbol.keyFor(Symbol('bar'))); // undefined（Symbol() 写法没有登记机制）

// 内置的知名 Symbol（well-known symbol）也不在登记表中
console.log(Symbol.keyFor(Symbol.iterator)); // undefined

console.log('\n========== 3. 全局的 Symbol 登记表 ==========');

// Symbol.for() 的登记机制是"跨 iframe / 跨 realm"共享的基础：
// 每个 iframe 有自己的 JavaScript 运行环境（不同的 Array、不同的 Symbol），
// 但全局 Symbol 登记表是共享的，Symbol.for('foo') 在所有环境里得到同一个值。

// 借助 Symbol.for 定义一组跨模块共享的键：任何模块执行同样的 key 都能取到同一个 Symbol
const SHARED_KEY = Symbol.for('app.shared');
const container: Record<PropertyKey, unknown> = {};
container[SHARED_KEY] = '跨模块共享的值';
// "另一个模块"里执行 Symbol.for('app.shared') 会得到同一个 Symbol，从而读到这个值
console.log(container[Symbol.for('app.shared')]); // 跨模块共享的值
console.log(SHARED_KEY === Symbol.for('app.shared')); // true

// 类似"登记 / 复用"的思想也可以用于对象：实现全局唯一的单例
interface Config {
  apiUrl: string;
  createdAt: string;
}
const registry = globalThis as typeof globalThis & { __configInstance?: Config };

function getConfig(): Config {
  // 多次调用只创建一份配置（如果没有才创建）
  registry.__configInstance ??= {
    apiUrl: 'https://api.example.com',
    createdAt: new Date().toISOString(),
  };
  return registry.__configInstance;
}

const configA = getConfig();
const configB = getConfig();
console.log('两个引用是同一个对象：', configA === configB); // true
console.log('apiUrl：', configA.apiUrl); // https://api.example.com

export {};
