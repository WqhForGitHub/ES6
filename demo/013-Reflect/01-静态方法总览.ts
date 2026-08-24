/**
 * 《ES6 标准入门（第三版）》第 13 章：Reflect
 * Demo 01：静态方法总览
 *
 * Reflect 对象与 Proxy 对象一样，也是 ES6 为了操作对象而提供的新 API。
 * Reflect 对象的设计目的：
 *   1. 将 Object 对象的一些明显属于语言内部的方法放到 Reflect 对象上；
 *   2. 修改某些 Object 方法的返回结果，让其变得更合理（报错改为返回 false 等）；
 *   3. 让 Object 操作都变成函数行为（如 in -> Reflect.has）；
 *   4. Reflect 对象的方法与 Proxy 对象的方法一一对应（13 个）。
 *
 * 运行：node 01-静态方法总览.ts
 */

// Record<PropertyKey, unknown> 同时允许字符串与 Symbol 作为键
const obj: Record<PropertyKey, unknown> = { name: 'ES6', year: 2015 };
obj[Symbol('id')] = 1;

console.log('========== 1. Reflect.get / Reflect.set ==========');

console.log(Reflect.get(obj, 'name')); // ES6
Reflect.set(obj, 'year', 2015);
console.log(Reflect.get(obj, 'year')); // 2015

// get/set 的第三个参数 receiver：如果属性有 getter/setter，receiver 会绑定 getter 里的 this
const getterTarget = {
  prefix: '值是：',
  get value(): string {
    return this.prefix + 'ES6';
  },
};
console.log(Reflect.get(getterTarget, 'value')); // 值是：ES6
console.log(Reflect.get(getterTarget, 'value', { prefix: '替换后：' })); // 替换后：ES6

console.log('\n========== 2. Reflect.has / Reflect.deleteProperty ==========');

console.log(Reflect.has(obj, 'name')); // true（函数形式的 name in obj）
console.log(Reflect.deleteProperty(obj, 'year')); // true（函数形式的 delete obj.year）
console.log(Reflect.has(obj, 'year')); // false

console.log('\n========== 3. Reflect.ownKeys ==========');

// 相当于 Object.getOwnPropertyNames 与 Object.getOwnPropertySymbols 之和
console.log(Reflect.ownKeys(obj)); // [ 'name', Symbol(id) ]

console.log('\n========== 4. Reflect.getOwnPropertyDescriptor / defineProperty ==========');

const desc = Reflect.getOwnPropertyDescriptor(obj, 'name');
console.log(desc?.value, desc?.writable, desc?.enumerable); // ES6 true true

// defineProperty 返回布尔值，而不是像 Object.defineProperty 那样抛错
console.log(Reflect.defineProperty(obj, 'locked', { value: 1, writable: false })); // true
console.log(obj.locked); // 1

console.log('\n========== 5. Reflect.getPrototypeOf / setPrototypeOf ==========');

const proto = { greet: 'hello' };
const child: Record<string, unknown> = {};
console.log(Reflect.setPrototypeOf(child, proto)); // true
console.log(Reflect.getPrototypeOf(child) === proto); // true

console.log('\n========== 6. Reflect.isExtensible / preventExtensions ==========');

console.log(Reflect.isExtensible(obj)); // true
console.log(Reflect.preventExtensions(obj)); // true
console.log(Reflect.isExtensible(obj)); // false（已禁止扩展）

console.log('\n========== 7. Reflect.apply ==========');

// 函数式风格的 apply，等价于 Function.prototype.apply.call(...)
console.log(Reflect.apply(Math.max, null, [1, 5, 3])); // 5
console.log(Reflect.apply(''.charAt, 'ES6', [1])); // 'S'

console.log('\n========== 8. Reflect.construct ==========');

// 等价于 new target(...args)，第三个参数 newTarget 可以改变新实例的原型
class Original {
  title = '原始构造函数的实例字段';
}
class Other {}
const instance = Reflect.construct(Original, [], Other) as Original & Other;
console.log(instance.title); // 原始构造函数的实例字段（构造逻辑来自 Original）
console.log(instance instanceof Original); // false
console.log(instance instanceof Other); // true（原型来自第三个参数 newTarget）

export {};
