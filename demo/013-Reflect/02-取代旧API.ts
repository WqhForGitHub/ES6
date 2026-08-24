/**
 * 《ES6 标准入门（第三版）》第 13 章：Reflect
 * Demo 02：用 Reflect 取代旧的 Object 操作 API
 *
 * 运行：node 02-取代旧API.ts
 */

console.log('========== 1. 返回布尔值，而不是抛出错误 ==========');

const obj: Record<string, unknown> = { a: 1 };
const frozen = Object.freeze({ x: 1 });

// Object.defineProperty 无法定义属性时直接抛错，Reflect.defineProperty 返回 false
console.log(Reflect.defineProperty(frozen, 'y', { value: 2 })); // false
try {
  Object.defineProperty(frozen, 'y', { value: 2 });
} catch (e) {
  console.log('旧 API 抛出错误：', e instanceof TypeError); // true
}

// deleteProperty 对不可删除的属性返回 false（delete 操作符在严格模式下会抛错）
console.log(Reflect.deleteProperty(frozen, 'x')); // false
console.log(Reflect.deleteProperty(obj, 'a'), obj.a); // true undefined

console.log('\n========== 2. 让 Object 操作都变成函数行为 ==========');

// 旧：key in obj；新：Reflect.has(obj, key)
console.log(Reflect.has(obj, 'a'), Reflect.has(obj, 'b')); // false false（上面已删除 a）

// 旧：new F(...args)；新：Reflect.construct(F, args)（见 Demo 01）
// 旧：Function.prototype.apply.call(f, obj, args)；新：Reflect.apply(f, obj, args)

console.log('\n========== 3. Reflect.apply：更直观的函数调用 ==========');

const nums = [11, 12, 13, 14];

// 旧写法：与原型上的 apply 绑定调用，可读性差
const oldMax = Function.prototype.apply.call(Math.max, null, nums);
// 新写法：语义清晰
const newMax = Reflect.apply(Math.max, null, nums);
console.log(oldMax, newMax); // 14 14

// 再如：找出数组中最长的单词
const words = ['Apple', 'Banana', 'Cherry'];
const pickLongest = (arr: string[]): string =>
  arr.reduce((a, b) => (a.length >= b.length ? a : b));
console.log(Reflect.apply(pickLongest, null, [words])); // Banana

console.log('\n========== 4. 函数式风格：把"操作"本身当作数据 ==========');

// Reflect 把对象操作统一为函数，便于组合、传递与调度
type ObjectOperation = (target: object, key: PropertyKey) => unknown;

const operations: Array<{ name: string; run: ObjectOperation }> = [
  { name: 'get', run: (target, key) => Reflect.get(target, key) },
  { name: 'has', run: (target, key) => Reflect.has(target, key) },
  {
    name: 'getOwnPropertyDescriptor',
    run: (target, key) => Reflect.getOwnPropertyDescriptor(target, key),
  },
];

const demoObj = { host: 'localhost', port: 8080 };
for (const op of operations) {
  console.log(op.name, '->', JSON.stringify(op.run(demoObj, 'host')));
}

export {};
