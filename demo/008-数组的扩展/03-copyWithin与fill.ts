/**
 * 《ES6 标准入门（第三版）》第 8 章：数组的扩展
 * Demo 03：copyWithin 与 fill
 *
 * 两个方法都会修改原数组（破坏性操作），并且可以接受负数索引（从末尾倒数）。
 *
 * 运行：node 03-copyWithin与fill.ts
 */

console.log('========== 1. Array.prototype.copyWithin ==========');

// 在当前数组内部，将指定位置的成员复制到其他位置（会覆盖原有成员），然后返回当前数组
// 参数（均为数值，可省略后两个）：
//   target（必需）：从该位置开始替换数据
//   start（可选，默认 0）：从该位置开始读取数据
//   end（可选，默认数组长度）：到该位置前停止读取数据（含头不含尾）

console.log([1, 2, 3, 4, 5].copyWithin(0, 3)); // [4, 5, 3, 4, 5]（把 3~末尾复制到 0 开始的位置）
console.log([1, 2, 3, 4, 5].copyWithin(0, 3, 4)); // [4, 2, 3, 4, 5]（只复制位置 3 的成员）
console.log([1, 2, 3, 4, 5].copyWithin(0, -2, -1)); // [4, 2, 3, 4, 5]（负数从末尾倒数）
console.log([1, 2, 3, 4, 5].copyWithin(-2)); // [1, 2, 3, 1, 2]（target 也可以是负数）

// 这些方法在 TypedArray 上同样存在，用于批量搬运数据（见第 26 章 ArrayBuffer）

console.log('\n========== 2. Array.prototype.fill ==========');

// 使用给定值填充一个数组（会覆盖原有全部成员），常用于初始化数组
const mixed: Array<string | number> = ['a', 'b', 'c'];
console.log(mixed.fill(7)); // [7, 7, 7]
console.log(new Array(3).fill(0)); // [0, 0, 0]（初始化数组的惯用法）

// fill 的第二和第三个参数：填充的起始与结束位置（含头不含尾）
console.log(['a', 'b', 'c'].fill(7, 1, 3)); // ['a', 7, 7]
console.log(['a', 'b', 'c'].fill(7, 1)); // ['a', 7, 7]（省略结束位置则填到末尾）
console.log(['a', 'b', 'c'].fill(7, -2)); // ['a', 7, 7]（负数表示倒数）

// fill 填充的是"同一个值"：填充对象/数组时，所有位置共享同一个引用！
const filled: unknown[][] = new Array(2).fill([]);
filled[0].push('x');
console.log(filled); // [['x'], ['x']]（两个位置其实是同一个数组）
// 想让每个位置都是独立的新对象，用 Array.from 或 map：
console.log(Array.from({ length: 2 }, () => [] as unknown[])); // [[], []]

// fill + copyWithin 都是破坏性方法：如果需要保留原数组，先复制
const original = [1, 2, 3];
const filledCopy = [...original].fill(0);
console.log(original, filledCopy); // [1, 2, 3] [0, 0, 0]

export {};
