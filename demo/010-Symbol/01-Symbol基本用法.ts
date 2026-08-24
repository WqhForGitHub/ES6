/**
 * 《ES6 标准入门（第三版）》第 10 章：Symbol
 * Demo 01：Symbol 基本用法
 *
 * ES5 的对象属性名都是字符串，这容易造成属性名的冲突。
 * ES6 引入了一种新的原始数据类型 Symbol，表示独一无二的值。
 * 它是 JavaScript 语言的第七种数据类型
 * （前六种是：undefined、null、布尔值、字符串、数值、对象）。
 *
 * 运行：node 01-Symbol基本用法.ts
 */

console.log('========== 1. 基本用法 ==========');

let s1 = Symbol();
let s2 = Symbol();
console.log(s1 === s2); // false（每个 Symbol 值都是独一无二的）

// Symbol 函数可以接受一个字符串作为参数，表示对 Symbol 实例的描述，
// 主要是为了在控制台显示或转为字符串时，比较容易区分
// （显式标注为 symbol：const 声明会推断出 unique symbol，=== 比较会被 TS 拦截）
const s3: symbol = Symbol('foo');
const s4: symbol = Symbol('foo');
console.log(s3 === s4); // false（描述相同，值依然不同）
console.log(s3.description); // foo（ES2019 新增，直接读取描述）
console.log(s3.toString()); // Symbol(foo)

// typeof 运算符可以帮助识别 Symbol 值
console.log(typeof s3); // symbol

// 注意：Symbol 函数前不能使用 new 命令（它是原始类型的值，不是对象）
// new Symbol(); // TypeError: Symbol is not a constructor

// Symbol 的参数如果是对象，会先调用其 toString 方法转为字符串
const objWithToString = {
  toString(): string {
    return 'es6';
  },
};
const symFromObj = Symbol(objWithToString as unknown as string); // 运行时调用其 toString
console.log(symFromObj.description); // es6

console.log('\n========== 2. 不能与其他类型的值进行运算 ==========');

// Symbol 值不能与其他类型的值进行运算，会报错：
// console.log('My symbol is ' + s3); // TypeError: Cannot convert a Symbol value to a string
// console.log(s3 + 1); // TypeError
// console.log(s3 + s3); // TypeError

// 但可以显式地转为字符串或布尔值
console.log(String(s3)); // Symbol(foo)
console.log(Boolean(s3)); // true
// console.log(Number(s3)); // TypeError: Cannot convert a Symbol value to a number

console.log('\n========== 3. 作为属性名的 Symbol ==========');

const mySymbol = Symbol('my symbol');

// 第一种写法：属性赋值
const obj1: Record<PropertyKey, unknown> = {};
obj1[mySymbol] = 'Hello!';
console.log(obj1[mySymbol]); // Hello!

// 第二种写法：对象字面量的计算属性名
const obj2 = {
  [mySymbol]: 'World!',
};
console.log(obj2[mySymbol]); // World!

// 第三种写法：Object.defineProperty
const obj3: Record<PropertyKey, unknown> = {};
Object.defineProperty(obj3, mySymbol, { value: '_defineProperty' });
console.log(obj3[mySymbol]); // _defineProperty

// 注意：Symbol 值作为对象属性名时，不能用点运算符（点运算符后面总是字符串）
// obj3.mySymbol = 'x'; // 这里的 mySymbol 是字符串属性名，与上面的 Symbol 无关

console.log('\n========== 4. Symbol 属性的"隐藏"特性 ==========');

// Symbol 值作为属性名时，不会出现在 for...in、for...of 循环中，
// 也不会被 Object.keys()、Object.getOwnPropertyNames()、JSON.stringify() 返回
const mixed: Record<PropertyKey, unknown> = {
  visible: '可见',
  [mySymbol]: '不可见',
};
console.log(Object.keys(mixed)); // ['visible']（不含 Symbol 键）
console.log(JSON.stringify(mixed)); // {"visible":"可见"}
for (const key in mixed) {
  console.log('for...in:', key); // 只输出 visible
}

// 但它并不是私有属性：Object.getOwnPropertySymbols 方法
// 可以获取指定对象的所有 Symbol 属性名
console.log(Object.getOwnPropertySymbols(mixed)); // [Symbol(my symbol)]

// Reflect.ownKeys 可以返回所有类型的键名（字符串键 + Symbol 键）
console.log(Reflect.ownKeys(mixed)); // ['visible', Symbol(my symbol)]

// Symbol 常用于为对象定义一些"非私有的、但又希望只用于内部"的方法或属性

export {};
