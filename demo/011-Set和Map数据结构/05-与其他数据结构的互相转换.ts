/**
 * 《ES6 标准入门（第三版）》第 11 章：Set 和 Map 数据结构
 * Demo 05：与其他数据结构的互相转换
 *
 * 数组 / Set / Map / 对象 / JSON 之间的转换是日常开发中的高频操作，
 * 转换的核心工具是：扩展运算符、Array.from、new 构造函数、
 * Object.entries / Object.fromEntries、JSON.stringify / JSON.parse。
 *
 * 运行：node 05-与其他数据结构的互相转换.ts
 */

console.log('========== 1. 数组 <-> Set ==========');

const arr1 = [1, 2, 2, 3, 3, 3];
const setFromArr = new Set(arr1); // 数组 -> Set（顺便去重，保持插入顺序）
console.log([...setFromArr]); // [1, 2, 3]
console.log(Array.from(setFromArr)); // [1, 2, 3]（另一种方式）

console.log('\n========== 2. 数组 <-> Map ==========');

// 二维数组（键值对数组） -> Map
const pairs: Array<[string, number]> = [
  ['a', 1],
  ['b', 2],
];
const mapFromArr = new Map(pairs);
console.log(mapFromArr.get('a')); // 1

// Map -> 数组（三种方式）
console.log([...mapFromArr]); // [['a', 1], ['b', 2]]（默认遍历器是 entries）
console.log([...mapFromArr.keys()]); // ['a', 'b']
console.log([...mapFromArr.values()]); // [1, 2]

console.log('\n========== 3. 对象 <-> Map ==========');

// 对象 -> Map
const obj1: Record<string, number> = { a: 1, b: 2 };
const mapFromObj = new Map(Object.entries(obj1));
console.log(mapFromObj); // Map(2) { 'a' => 1, 'b' => 2 }

// Map -> 对象（前提：Map 的键都是字符串，否则会丢失）
const mapToConvert = new Map<string, number>([
  ['x', 10],
  ['y', 20],
]);
const objFromMap = Object.fromEntries(mapToConvert);
console.log(objFromMap.x, objFromMap.y); // 10 20

console.log('\n========== 4. Set <-> Map ==========');

// Set -> Map：Set 里存放键值对（[key, value] 数组）
const setOfPairs = new Set<[string, number]>([
  ['one', 1],
  ['two', 2],
]);
const mapFromSet = new Map(setOfPairs);
console.log(mapFromSet.get('two')); // 2

// Map -> Set：键的集合 / 值的集合 / 键值对的集合
const mapToSet = new Map<string, number>([
  ['k1', 1],
  ['k2', 2],
]);
const setOfKeys = new Set(mapToSet.keys());
const setOfValues = new Set(mapToSet.values());
const setOfEntries = new Set(mapToSet);
console.log([...setOfKeys], [...setOfValues], [...setOfEntries]);

console.log('\n========== 5. 与 JSON 的互相转换 ==========');

// Map -> JSON：键全是字符串时，先转对象再 stringify
const stringKeyed = new Map<string, boolean>([
  ['yes', true],
  ['no', false],
]);
console.log(JSON.stringify(Object.fromEntries(stringKeyed))); // {"yes":true,"no":false}

// Map -> JSON：键有非字符串时，直接转数组
const mixedKeyed = new Map<number | string, unknown>([
  [1, 'one'],
  ['2', 'two'],
]);
console.log(JSON.stringify([...mixedKeyed])); // [[1,"one"],["2","two"]]

// JSON -> Map：先 JSON.parse，再按结构转换
const jsonText = '{"a":1,"b":2}';
const parsed = JSON.parse(jsonText) as Record<string, number>;
console.log(new Map(Object.entries(parsed))); // Map(2) { 'a' => 1, 'b' => 2 }

export {};
