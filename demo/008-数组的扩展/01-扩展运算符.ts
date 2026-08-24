/**
 * 《ES6 标准入门（第三版）》第 8 章：数组的扩展
 * Demo 01：扩展运算符
 *
 * 扩展运算符（spread）是三个点（...）。它好比 rest 参数的逆运算，
 * 将一个数组转为用逗号分隔的参数序列。
 *
 * 运行：node 01-扩展运算符.ts
 */

console.log('========== 1. 函数调用中的扩展运算符 ==========');

// ES5 写法：Math.max.apply(null, arr)
const nums = [14, 3, 77];
console.log(Math.max(...nums)); // 77
console.log(Math.min(...nums)); // 3
console.log(Math.max.apply(null, nums)); // 77（ES5 的等价写法）

// 与普通参数混合使用（TS 需要元组类型才能静态校验展开的个数）
function mixed(x: number, y: number, z: number, ...rest: number[]): string {
  return `${x}-${y}-${z} + [${rest.join(',')}]`;
}
const firstTwo: [number, number] = [1, 2];
const lastTwo: [number, number] = [4, 5];
console.log(mixed(...firstTwo, 3, ...lastTwo)); // 1-2-3 + [4,5]

// 经典应用：简化 push
const arr1: number[] = [1, 2];
arr1.push(...[3, 4]);
console.log(arr1); // [1, 2, 3, 4]

console.log('\n========== 2. 数组字面量中的扩展运算符 ==========');

const base = [1, 2];
const copy = [...base]; // 复制数组（生成新数组）
const appended = [...base, 3, 4]; // 可以放在任意位置
const merged = [...base, ...[9, 10]]; // 替代 concat
copy.push(99);
console.log(base, copy); // [1, 2] [1, 2, 99]（修改副本不影响原数组）
console.log(appended, merged); // [1, 2, 3, 4] [1, 2, 9, 10]

// ES5 的合并写法：base.concat(other)；扩展运算符提供了更通用的形式
const es5Merged = [1, 2].concat([3, 4]);
console.log(es5Merged); // [1, 2, 3, 4]

// 扩展运算符可以展开任何"可遍历"的结构（iterable）：
console.log([...new Set([1, 1, 2])]); // [1, 2]（Set）
console.log([...new Map<string, number>([['a', 1], ['b', 2]]).keys()]); // ['a', 'b']（Map 的键）
console.log([...'hello']); // ['h', 'e', 'l', 'l', 'o']（字符串）

function* gen(): Generator<number> {
  yield 1;
  yield 2;
}
console.log([...gen()]); // [1, 2]（Generator 函数）

// 注意：扩展运算符是"浅拷贝"，嵌套的对象/数组仍然是同一个引用
const objs = [{ a: 1 }, { a: 2 }];
const objsCopy = [...objs];
objsCopy[0].a = 99;
console.log(objs[0].a); // 99（原数组的嵌套对象被改了）

console.log('\n========== 3. 扩展运算符与解构赋值结合 ==========');

// 扩展运算符用于数组赋值时，只能放在参数的最后一位（rest 模式，见第 3 章）
const [first, ...others] = [1, 2, 3, 4];
console.log(first, others); // 1 [2, 3, 4]
// const [bad, ...badRest, last] = [1, 2, 3]; // SyntaxError：rest 元素必须是最后一个

// 若将扩展运算符用于数组解构且展开 undefined / null，会报错：
// const [...bad2] = undefined; // TypeError: undefined is not iterable

console.log('\n========== 4. 扩展运算符与 Array.from 的差别 ==========');

// 扩展运算符背后调用的是遍历器接口（Symbol.iterator）。
// 如果一个对象没有部署这个接口，就无法转换：
const arrayLike = { length: 2, 0: 'a', 1: 'b' };
// console.log([...arrayLike]); // TypeError: arrayLike is not iterable

// Array.from 则能接受所有"类似数组的对象"（有 length 属性即可）
console.log(Array.from(arrayLike)); // ['a', 'b']

// Map 和 Set 结构部署了 Iterator 接口，所以两者都能转换：
console.log([...new Set([1, 2])], Array.from(new Set([1, 2]))); // [1, 2] [1, 2]

export {};
