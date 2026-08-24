/**
 * 《ES6 标准入门（第三版）》第 8 章：数组的扩展
 * Demo 02：Array.from 与 Array.of
 *
 * Array.from 方法用于将两类对象转为真正的数组：
 *   1. 类似数组的对象（array-like object：有 length 属性）；
 *   2. 可遍历的对象（iterable：部署了 Symbol.iterator 接口）。
 *
 * Array.of 方法用于将一组值转换为数组，弥补 Array 构造函数的不足。
 *
 * 运行：node 02-Array.from与Array.of.ts
 */

console.log('========== 1. Array.from：转换两类对象 ==========');

// 类似数组的对象：本质特征只有 length 属性（DOM 的 NodeList、函数的 arguments 等）
const arrayLike: ArrayLike<string> = { length: 3, 0: 'a', 1: 'b', 2: 'c' };
console.log(Array.from(arrayLike)); // ['a', 'b', 'c']

// 实际常见的类似数组的对象：函数的 arguments
function argsToArray(x: string, y: string): unknown[] {
  return Array.from(arguments); // ES5 时代要用 Array.prototype.slice.call(arguments)
}
console.log(argsToArray('a', 'b')); // ['a', 'b']

// 可遍历的对象：字符串、Set、Map 等
console.log(Array.from('hello')); // ['h', 'e', 'l', 'l', 'o']
console.log(Array.from(new Set([1, 2, 2]))); // [1, 2]
console.log(Array.from(new Map<string, number>([['a', 1], ['b', 2]]))); // [['a', 1], ['b', 2]]

// 扩展运算符（...）背后调用的是遍历器接口；如果一个对象没有部署该接口，
// 就无法用 ... 转换，但 Array.from 依然可以（只要它是"类似数组的对象"）
const onlyLength: ArrayLike<number> = { length: 2 };
console.log(Array.from(onlyLength)); // [undefined, undefined]（成员都读不到，但长度对了）
// console.log([...onlyLength]); // TypeError: onlyLength is not iterable

console.log('\n========== 2. Array.from 的第二个参数：类似 map ==========');

// 第二个参数是一个回调，作用类似于数组的 map 方法，
// 用来对每个元素进行处理，将处理后的值放入返回的数组
console.log(Array.from([1, 2, 3], (x) => x * 2)); // [2, 4, 6]

// 应用：生成下标序列（面试常客）
console.log(Array.from({ length: 5 }, (_, i) => i)); // [0, 1, 2, 3, 4]

// 应用：字符串转数组并处理
console.log(Array.from('abc', (ch) => ch.toUpperCase())); // ['A', 'B', 'C']

// 应用：数组去重（结合 Set）
console.log(Array.from(new Set([1, 1, 2, 3, 3]))); // [1, 2, 3]

// 应用：初始化固定长度的数组
console.log(Array.from({ length: 3 }, () => 0)); // [0, 0, 0]
console.log(new Array(3).fill(0)); // [0, 0, 0]（另一种方式）

// 第三个参数 thisArg：绑定回调里的 this
const multiplier = {
  factor: 3,
};
console.log(
  Array.from(
    [1, 2],
    function (this: { factor: number }, x: number): number {
      return x * this.factor;
    },
    multiplier,
  ),
); // [3, 6]

console.log('\n========== 3. Array.of：统一的行为 ==========');

// Array 构造函数因为参数个数的不同，行为有歧义：
console.log(Array()); // []
console.log(Array(3)); // [ , , ]（一个数字参数：表示长度！创建了 3 个空位）
console.log(Array(3, 11, 8)); // [3, 11, 8]（多个参数：才是"成员"）

// Array.of 总是用参数作为数组成员，行为完全统一：
console.log(Array.of()); // []
console.log(Array.of(3)); // [3]（不再是"长度为 3 的空数组"）
console.log(Array.of(3, 11, 8)); // [3, 11, 8]
console.log(Array.of(undefined)); // [undefined]

// Array.of 基本上可以用来替代 Array() 或 new Array()，并且行为总是正常：
function arrayOfItems<T>(...items: T[]): T[] {
  return Array.of(...items);
}
console.log(arrayOfItems('a', 'b')); // ['a', 'b']
console.log(arrayOfItems(7)); // [7]

export {};
