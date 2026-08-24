/**
 * 《ES6 标准入门（第三版）》第 8 章：数组的扩展
 * Demo 05：数组的空位
 *
 * 数组的空位（hole）指：数组的某一个位置没有任何值。
 * 注意：空位不是 undefined！一个位置的值是 undefined，依然是有值的。
 * ES5 对空位的处理很不一致，ES6 则是明确将空位转为 undefined。
 * 实践建议：代码中一律避免使用空位。
 *
 * 运行：node 05-数组的空位.ts
 */

console.log('========== 1. 什么是空位 ==========');

// Array 构造函数 / 数组字面量中的连续逗号，都会产生空位
const holes = new Array(3); // 长度 3，但没有任何成员
console.log(holes.length, 0 in holes); // 3 false（in 运算符：位置上没有值）

// 空位不是 undefined：
const withUndefined = [undefined, undefined, undefined];
console.log(0 in withUndefined); // true（undefined 也是"有值"）
console.log(0 in holes); // false（空位是"没有位置"）

console.log('\n========== 2. ES5 方法对空位的处理（非常不一致） ==========');

// forEach / filter / every / some：跳过空位
let visited = 0;
[, 'a', 'b'].forEach((): void => {
  visited += 1;
});
console.log('forEach 访问的成员数：', visited); // 2（空位被跳过）
console.log([, 'a'].filter((): boolean => true)); // ['a']（空位被跳过）

// map：跳过空位，但会保留空位
const mapped = [, 'a'].map((x): string => x);
console.log(mapped.length, 1 in mapped, 0 in mapped); // 2 true false（空位被保留）

// join：把空位视为 undefined，再转为空字符串
console.log([, 'a'].join('-')); // '-a'

console.log('\n========== 3. ES6 明确将空位转为 undefined ==========');

// for...of / entries / keys / values / 扩展运算符 / Array.from 都把空位当作 undefined
const holed: Array<string | undefined> = [, 'a'];

for (const value of holed) {
  console.log('for...of：', value); // undefined 'a'（空位被读成 undefined）
}

console.log([...holed]); // [undefined, 'a']
console.log(Array.from(holed)); // [undefined, 'a']
console.log([...holed.entries()]); // [[0, undefined], [1, 'a']]

// copyWithin / fill 会把空位当作正常位置处理（可以把值填进去）
console.log(new Array(3).fill(7)); // [7, 7, 7]
console.log([, , ,].copyWithin(0, 1).length); // 3

console.log('\n========== 4. 建议：避免空位 ==========');

// 1. 需要占位时，显式写 undefined（语义清晰，行为一致）：
const safe: Array<string | undefined> = [undefined, 'a'];
console.log(0 in safe); // true

// 2. 需要 n 个 undefined 的数组：用 fill / Array.from，而不是 new Array(n)
console.log(new Array(2).fill(undefined)); // [undefined, undefined]
console.log(Array.from({ length: 2 })); // [undefined, undefined]

// 3. new Array(n) 常见的误用：
const trap = new Array(3);
console.log(trap.map((): number => 1)); // [ , , ]（map 跳过空位，回调根本没执行！）
console.log(Array.from({ length: 3 }, (): number => 1)); // [1, 1, 1]（正确做法）

export {};
