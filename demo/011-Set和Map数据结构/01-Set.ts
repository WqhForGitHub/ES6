/**
 * 《ES6 标准入门（第三版）》第 11 章：Set 和 Map 数据结构
 * Demo 01：Set
 *
 * Set 类似于数组，但是成员的值都是唯一的，没有重复的值。
 * Set 本身是一个构造函数，用来生成 Set 数据结构。
 *
 * 运行：node 01-Set.ts
 */

console.log('========== 1. 基本用法 ==========');

const s = new Set<number>();
[2, 3, 5, 4, 5, 2, 2].forEach((x) => s.add(x));
for (const i of s) {
  console.log(i); // 2 3 5 4（重复的值被忽略）
}
console.log('size：', s.size); // 4

// Set 构造函数可以接受数组（或任何具有 iterable 接口的其他数据结构）作为参数
const s2 = new Set([1, 2, 3, 4, 4]);
console.log([...s2]); // [1, 2, 3, 4]（数组去重的简便方法）
console.log(Array.from(new Set([1, 1, 2, 3, 3]))); // [1, 2, 3]（另一种方式）

// 删除 / 判断存在 / 清空
console.log(s2.delete(1), s2.has(2)); // true true
s2.clear();
console.log(s2.size); // 0

console.log('\n========== 2. 判重的规则 ==========');

// Set 内部判断两个值是否相同使用的算法叫做 "SameValueZero equality"，
// 类似于精确相等运算符（===），主要区别是 NaN 等于自身
const nan1 = NaN;
const nan2 = NaN;
console.log(nan1 === nan2); // false
console.log(new Set([NaN, NaN]).size); // 1（NaN 被视为同一个值）

// 两个对象总是不相等的（比较的是引用）
const objA = { x: 1 };
const objB = { x: 1 };
console.log(new Set([objA, objB, objA]).size); // 2

// 特例：+0 与 -0 在 Set 中被视为同一个值
console.log(new Set([+0, -0]).size); // 1

console.log('\n========== 3. 用 Set 实现数组的并集 / 交集 / 差集 ==========');

const a = new Set([1, 2, 3]);
const b = new Set([4, 3, 2]);

// 并集
const union = new Set([...a, ...b]);
console.log([...union]); // [1, 2, 3, 4]

// 交集
const intersect = new Set([...a].filter((x) => b.has(x)));
console.log([...intersect]); // [2, 3]

// 差集（a 相对于 b）
const difference = new Set([...a].filter((x) => !b.has(x)));
console.log([...difference]); // [1]

console.log('\n========== 4. 遍历操作 ==========');

const s3 = new Set(['red', 'green', 'blue']);

// keys() 与 values() 的行为完全一致（Set 只有键值，没有键名）
for (const key of s3.keys()) {
  console.log('key:', key);
}
for (const value of s3.values()) {
  console.log('value:', value);
}
// entries() 返回的每个成员都是 [value, value] 形式的数组
for (const entry of s3.entries()) {
  console.log('entry:', entry);
}

// Set 结构的默认遍历器生成函数就是它的 values 方法
console.log('默认遍历器就是 values 方法：', Set.prototype[Symbol.iterator] === Set.prototype.values); // true

// forEach 的回调参数依次是：值、值（再次）、Set 本身（注意与 Map 相反）
s3.forEach((value, valueAgain, set) => {
  console.log('forEach:', value, valueAgain === value, set.size);
});

// Set 的遍历顺序就是插入顺序（因此去重不会打乱数组原有顺序）
console.log([...new Set(['b', 'a', 'b', 'c'])]); // ['b', 'a', 'c']

export {};
