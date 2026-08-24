/**
 * 《ES6 标准入门（第三版）》第 8 章：数组的扩展
 * Demo 04：find / findIndex / includes 与遍历方法
 *
 * 运行：node 04-find-findIndex-includes与遍历方法.ts
 */

console.log('========== 1. find / findIndex ==========');

// find：找出第一个符合条件的数组成员；找不到返回 undefined
// findIndex：返回第一个符合条件的成员的位置；找不到返回 -1
// 回调可以接收三个参数：(当前值, 当前位置, 原数组)
const nums = [1, 5, 10, 15];
console.log(nums.find((n) => n > 8)); // 10
console.log(nums.findIndex((n) => n > 8)); // 2
console.log(nums.find((n) => n > 100)); // undefined
console.log(nums.findIndex((n) => n > 100)); // -1

// 这两个方法都可以发现 NaN，弥补了 indexOf 的不足
console.log([NaN].indexOf(NaN)); // -1（indexOf 内部使用 ===，无法识别 NaN）
console.log([NaN].findIndex((n) => Number.isNaN(n))); // 0（配合 Number.isNaN 就能找到）

// find 接收的回调依次取到 (值, 下标, 数组)
[10, 20, 30].find((value, index, arr): boolean => {
  console.log('  回调参数：', value, index, arr.length);
  return false; // 返回 false 让它遍历所有成员
});

// ES2022 补充：findLast / findLastIndex（从末尾往前找）
console.log([1, 5, 10, 15].findLast((n) => n > 8)); // 15
console.log([1, 5, 10, 15].findLastIndex((n) => n > 8)); // 3

console.log('\n========== 2. includes（ES2016） ==========');

// 返回一个布尔值，表示某个数组是否包含给定的值（采用 SameValueZero 比较，能识别 NaN）
console.log([1, 2, 3].includes(2)); // true
console.log([1, 2, 3].includes(4)); // false
console.log([1, 2, NaN].includes(NaN)); // true（与 indexOf 不同！）
console.log([NaN].indexOf(NaN)); // -1（indexOf 依然找不到 NaN）

// 第二个参数表示搜索的起始位置（默认 0；负数表示倒数）
console.log([1, 2, 3].includes(3, 3)); // false（从位置 3 开始，越界了）
console.log([1, 2, 3].includes(3, -1)); // true（从倒数第 1 位开始）
console.log([1, 2, 3, 4].includes(1, -3)); // false（从倒数第 3 位（即位置 1）开始找）

// 与 indexOf 的取舍：
// 1. indexOf 不能识别 NaN；includes 可以
// 2. 只想知道"有没有"时，includes 语义更直接（不用和 -1 比较）

console.log('\n========== 3. entries / keys / values ==========');

// 三个方法都返回一个"遍历器对象"（详见第 15 章 Iterator），
// 唯一的区别是 keys() 是对键名的遍历、values() 是对键值的遍历、entries() 是对键值对的遍历
const letters = ['a', 'b', 'c'];

for (const index of letters.keys()) {
  console.log('key:', index);
}
for (const value of letters.values()) {
  console.log('value:', value);
}
for (const [index, value] of letters.entries()) {
  console.log('entry:', index, value);
}

// 如果不用 for...of，可以手动调用遍历器的 next 方法进行遍历
const entryIterator = letters.entries();
console.log(entryIterator.next().value); // [0, 'a']
console.log(entryIterator.next().value); // [1, 'b']
console.log(entryIterator.next().done); // false
console.log(entryIterator.next().value); // [2, 'c']
console.log(entryIterator.next().done); // true（遍历结束）

console.log('\n========== 4. flat / flatMap（ES2019 补充） ==========');

// flat：拉平嵌套数组，默认只拉平一层，参数表示想拉平的层数
console.log([1, [2, [3, [4]]]].flat()); // [1, 2, [3, [4]]]（默认 1 层）
console.log([1, [2, [3, [4]]]].flat(2)); // [1, 2, 3, [4]]
console.log([1, [2, [3, [4]]]].flat(Infinity)); // [1, 2, 3, 4]（全部拉平）
console.log([1, [2], , 3].flat().length); // 3（flat 会跳过空位）

// flatMap：对原数组的每个成员执行一个函数（相当于 map），
// 然后对返回值组成的数组执行 flat(1) 方法
console.log([1, 2, 3].flatMap((n) => [n, n * 10])); // [1, 10, 2, 20, 3, 30]
// 等价于：
console.log([1, 2, 3].map((n) => [n, n * 10]).flat()); // [1, 10, 2, 20, 3, 30]

// flatMap 只能展开"一层"，返回的数组里如果还有嵌套数组就不再展开：
console.log([1, 2].flatMap((n) => [[n * 10]])); // [[10], [20]]

export {};
