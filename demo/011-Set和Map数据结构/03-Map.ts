/**
 * 《ES6 标准入门（第三版）》第 11 章：Set 和 Map 数据结构
 * Demo 03：Map
 *
 * Map 类似于对象，也是键值对的集合，但是"键"的范围不限于字符串，
 * 各种类型的值（包括对象）都可以当作键。
 *
 * 运行：node 03-Map.ts
 */

console.log('========== 1. 基本用法 ==========');

// 传统上，对象只能用字符串当作键，这带来了很大的限制
const o = { p: 'Hello World' };
const m2 = new Map<object, string>([[o, 'content']]);
console.log(m2.get(o)); // content
console.log(m2.get({ p: 'Hello World' })); // undefined（键比较的是引用，不是内容）

// Map 的键可以是各种类型的值
const m = new Map<string | number | undefined, string | number>();
m.set('edition', 6); // 键是字符串
m.set(262, 'standard'); // 键是数值
m.set(undefined, 'nah'); // 键是 undefined
console.log(m.get('edition'), m.get(262), m.get(undefined)); // 6 'standard' 'nah'

console.log(m.has('edition'), m.delete('edition'), m.has('edition')); // true true false
console.log('size：', m.size); // 2
m.clear();
console.log(m.size); // 0

console.log('\n========== 2. 构造函数与链式写法 ==========');

// Map 可以接受一个数组作为参数，数组成员是一个个表示"键值对"的数组
const m3 = new Map<string, string>([
  ['name', '张三'],
  ['title', 'Author'],
]);
console.log(m3.size); // 2

// set 方法返回当前的 Map 对象，因此可以写成链式
const m4 = new Map<number, string>()
  .set(1, 'a')
  .set(2, 'b')
  .set(2, 'c');
console.log(m4.get(2), m4.size); // c 2（对同一个键反复赋值会覆盖旧值）

// 如果键是简单类型的值（数字、字符串、布尔值），则只要两个值严格相等，
// Map 就将其视为一个键（包括 NaN，这一点与 === 不同）
const m5 = new Map<number, string>();
m5.set(NaN, '不是数值');
console.log(m5.get(NaN)); // 不是数值（NaN 被视为同一个键）

console.log('\n========== 3. 遍历方法 ==========');

const m6 = new Map<string, string>([
  ['F', 'no'],
  ['T', 'yes'],
]);

// keys() / values() / entries() 返回的都是遍历器（Iterator）
for (const key of m6.keys()) {
  console.log('key:', key);
}
for (const value of m6.values()) {
  console.log('value:', value);
}
for (const [key, value] of m6.entries()) {
  console.log('entry:', key, value);
}

// Map 的默认遍历器接口就是 entries 方法
console.log('默认遍历器就是 entries 方法：', Map.prototype[Symbol.iterator] === Map.prototype.entries); // true

// 因此 for...of 直接遍历 Map，等同于使用 entries()
for (const [key, value] of m6) {
  console.log('for...of:', key, value);
}

// forEach 的回调参数依次是：值、键、Map 本身（与 Set 相反，与数组一致）
m6.forEach((value, key, map) => {
  console.log('forEach:', key, value, map.size);
});

// Map 的遍历顺序就是插入顺序
console.log([...new Map<string, number>([['c', 3], ['a', 1], ['b', 2]])]); // [['c',3],['a',1],['b',2]]

console.log('\n========== 4. 与数组 / 对象的转换 ==========');

// Map 转为数组：扩展运算符
const m7 = new Map<number, string>([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);
console.log([...m7.keys()]); // [1, 2, 3]
console.log([...m7.values()]); // ['one', 'two', 'three']
console.log([...m7.entries()]); // [[1,'one'],[2,'two'],[3,'three']]
console.log([...m7]); // [[1,'one'],[2,'two'],[3,'three']]

// Map 转为对象：如果所有 Map 的键都是字符串，可以无损转换
function strMapToObj(strMap: Map<string, unknown>): Record<string, unknown> {
  const obj: Record<string, unknown> = Object.create(null);
  for (const [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
}
function objToStrMap(obj: Record<string, unknown>): Map<string, unknown> {
  const strMap = new Map<string, unknown>();
  for (const k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}

const m8 = new Map<string, unknown>().set('yes', true).set('no', false);
console.log(strMapToObj(m8)); // [Object: nullPrototype] { yes: true, no: false }
console.log(objToStrMap({ yes: true, no: false })); // Map(2) { 'yes' => true, 'no' => false }

// 现代 API 一行完成：Object.fromEntries / Object.entries（ES2019 / ES2017）
console.log(Object.fromEntries(m8)); // { yes: true, no: false }
console.log(new Map(Object.entries({ a: 1, b: 2 }))); // Map(2) { 'a' => 1, 'b' => 2 }

// Map 转为 JSON：键全是字符串时先转对象；键有非字符串时直接转数组
console.log(JSON.stringify(strMapToObj(m8))); // {"yes":true,"no":false}
console.log(JSON.stringify([...m7])); // [[1,"one"],[2,"two"],[3,"three"]]

console.log('\n========== 5. Map 与 Object 的对比 ==========');

// Object 的键本质上是字符串（或 Symbol），Map 的键可以是任意类型的值
const objKey = { id: 1 };
const m9 = new Map<object | string, unknown>();
m9.set(objKey, '按对象引用存取');
m9.set('id', '按字符串存取');
console.log(m9.get(objKey), m9.get('id')); // 按对象引用存取 按字符串存取

// Object 需要借助 Object.keys 计算键数量，Map 直接提供 size
const obj10 = { a: 1, b: 2, c: 3 };
console.log('Object 键数量：', Object.keys(obj10).length, '/ Map size：', m9.size); // 3 / 2

export {};
