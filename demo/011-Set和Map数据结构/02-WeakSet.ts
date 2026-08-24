/**
 * 《ES6 标准入门（第三版）》第 11 章：Set 和 Map 数据结构
 * Demo 02：WeakSet
 *
 * WeakSet 结构与 Set 类似，也是不重复的值的集合。但是，它与 Set 有两个区别：
 *   1. WeakSet 的成员只能是对象，而不能是其他类型的值；
 *   2. WeakSet 中的对象都是弱引用，即垃圾回收机制不考虑 WeakSet 对该对象的引用。
 *
 * 运行：node 02-WeakSet.ts
 */

console.log('========== 1. 基本用法 ==========');

const ws = new WeakSet<object>();
const obj1 = { name: 'obj1' };
const obj2 = { name: 'obj2' };

ws.add(obj1);
ws.add(obj2);
console.log(ws.has(obj1)); // true
console.log(ws.delete(obj1)); // true
console.log(ws.has(obj1)); // false

// add 的参数必须是对象，否则会报错（运行时演示）
try {
  ws.add(123 as unknown as object); // TypeError: Invalid value used in weak set
} catch (e) {
  console.log('非对象被拒绝：', e instanceof TypeError); // true
}

console.log('\n========== 2. 没有遍历操作 ==========');

// WeakSet 没有 size 属性，没有办法遍历它的成员：
// 弱引用的成员随时可能被垃圾回收，根本无法保证成员的存在，也就无法遍历
console.log('ws.size 的值：', (ws as unknown as Record<string, unknown>).size); // undefined
// ws.forEach; // undefined（不存在该方法）
// for (const x of ws) {} // TypeError: ws is not iterable

console.log('\n========== 3. 用途：给对象打标记（不产生内存泄漏） ==========');

// WeakSet 的一个好处是适合临时存放一组对象，以及存放跟对象绑定的信息。
// 经典场景：给一批对象打"已处理"标记 -- 用 Set 会阻止对象被回收，
// 用 WeakSet 则不影响垃圾回收：对象一旦销毁，WeakSet 中的记录自动消失
const processed = new WeakSet<object>();

function processOnce(node: object): void {
  if (processed.has(node)) {
    console.log('该对象已经处理过，跳过');
    return;
  }
  processed.add(node);
  console.log('正在处理对象……');
}

const task1 = {};
const task2 = {};
processOnce(task1); // 正在处理对象……
processOnce(task1); // 该对象已经处理过，跳过
processOnce(task2); // 正在处理对象……

// 注意：这种场合的 WeakSet 里存储的对象仍然需要在外部持有强引用，
// 否则对象连同 WeakSet 里的标记都会一起被回收

export {};
