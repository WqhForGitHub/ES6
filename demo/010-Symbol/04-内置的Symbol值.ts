/**
 * 《ES6 标准入门（第三版）》第 10 章：Symbol
 * Demo 04：内置的 Symbol 值（Well-known Symbols）
 *
 * Symbol 除了定义自己使用的 Symbol 值以外，ES6 还提供了多个内置的 Symbol 值，
 * 指向语言内部使用的方法。改变这些方法的返回值，可以改变语言默认的行为。
 * 本 demo 演示其中最常用的几个：
 *   Symbol.hasInstance / isConcatSpreadable / species /
 *   match / replace / search / split / iterator / toPrimitive /
 *   toStringTag / unscopables
 *
 * 运行：node 04-内置的Symbol值.ts
 */

console.log('========== 1. Symbol.hasInstance ==========');

// 对象的 Symbol.hasInstance 属性指向一个内部方法：
// 当其他对象使用 instanceof 运算符判断是否为此对象的实例时，会调用这个方法
class Even {
  static [Symbol.hasInstance](num: unknown): boolean {
    return typeof num === 'number' && num % 2 === 0;
  }
}

const two: any = 2; // instanceof 的左侧按语言规范应是对象，这里用 any 绕过 TS 静态检查
const three: any = 3;
console.log(two instanceof Even, three instanceof Even); // true false

// 另一个例子：让 instanceof 只认"真正的数组"
const HonestArray = class extends Array<unknown> {
  static [Symbol.hasInstance](instance: unknown): boolean {
    return Array.isArray(instance);
  }
};
console.log([] instanceof HonestArray, {} instanceof HonestArray); // true false

console.log('\n========== 2. Symbol.isConcatSpreadable ==========');

// 该属性等于一个布尔值，表示对象用于 Array.prototype.concat() 时是否可以展开
const arr2 = [3, 4];
console.log([1, 2].concat(arr2)); // [1, 2, 3, 4]（数组默认可以展开）

// 设置为 false 后，整个数组被当作一个元素
Object.defineProperty(arr2, Symbol.isConcatSpreadable, { value: false });
console.log([1, 2].concat(arr2)); // [1, 2, [3, 4]]

// 类似数组的对象默认不展开，设置为 true 后可以展开
const arrayLike = { length: 2, 0: 'a', 1: 'b' } as unknown as ConcatArray<string>;
Object.defineProperty(arrayLike, Symbol.isConcatSpreadable, { value: true });
console.log(['x'].concat(arrayLike)); // ['x', 'a', 'b']

console.log('\n========== 3. Symbol.species ==========');

// 指向当前对象的构造函数（创建衍生对象时使用）。
// 典型场景：继承数组的子类，希望 map / filter 等方法返回原生数组而不是子类实例
class MyArray extends Array<number> {
  static get [Symbol.species](): ArrayConstructor {
    return Array; // 衍生对象改用原生 Array 构造
  }
}

const ma = new MyArray(1, 2, 3);
const mapped = ma.map((x) => x * 2);
console.log(mapped); // [2, 4, 6]
console.log('mapped 是 MyArray 实例：', mapped instanceof MyArray); // false
console.log('mapped 是原生 Array 实例：', mapped instanceof Array); // true

console.log('\n========== 4. Symbol.match / replace / search / split ==========');

// 这四个属性分别指向四个方法，供 String 的
// match / replace / search / split 四个方法调用。
// 自定义它们后，可以让普通对象具备"正则"的行为

const es6Matcher = {
  [Symbol.match](str: string): boolean {
    return str.includes('es6');
  },
  [Symbol.replace](str: string, replacement: string): string {
    return str.split('es6').join(replacement);
  },
  [Symbol.search](str: string): number {
    return str.indexOf('es6');
  },
  [Symbol.split](str: string): string[] {
    return str.split('es6');
  },
};

// TS 的类型定义要求这些方法的宿主"看起来像"RegExp，因此需要断言
const matcher = es6Matcher as unknown as RegExp;
console.log('hello es6 world'.match(matcher)); // true
console.log('hello es6 world'.replace(matcher, 'ES2015')); // hello ES2015 world
console.log('hello es6 world'.search(matcher)); // 6
console.log('hello es6 world'.split(matcher)); // ['hello ', ' world']

// 反向操作：把正则对象的 Symbol.match 设为 false，它就"不再被当作正则"，
// String.prototype.match 会把它转成字符串后做字面量匹配
const re = /a.c/;
console.log('/a.c/'.match(re)); // ['a.c']（按正则匹配：. 匹配任意字符，从索引 1 开始）
Object.defineProperty(re, Symbol.match, { value: false });
console.log('/a.c/'.match(re)); // ['/a.c/']（按字面量字符串 '/a.c/' 匹配，从索引 0 开始）

console.log('\n========== 5. Symbol.iterator ==========');

// 指向对象的默认遍历器方法：对象进行 for...of 遍历、扩展运算符解构时都会调用它
class Range implements Iterable<number> {
  private readonly start: number;
  private readonly end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  [Symbol.iterator](): Iterator<number> {
    let cursor = this.start;
    const end = this.end;
    return {
      next(): IteratorResult<number> {
        if (cursor <= end) {
          const value = cursor;
          cursor += 1;
          return { value, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

console.log([...new Range(1, 5)]); // [1, 2, 3, 4, 5]
for (const n of new Range(3, 5)) {
  console.log('  遍历：', n); // 3 4 5
}

console.log('\n========== 6. Symbol.toPrimitive ==========');

// 指向一个方法：对象被转为原始类型的值时会调用该方法，
// 返回该对象对应的原始类型值。参数 hint 指明当前倾向于的转换类型：
// 'number' / 'string' / 'default'
const temperature = {
  celsius: 25,
  [Symbol.toPrimitive](hint: string): string | number {
    if (hint === 'number') {
      return this.celsius;
    }
    if (hint === 'string') {
      return `${this.celsius}°C`;
    }
    return `温度对象（${this.celsius}°C）`; // hint === 'default'
  },
};

console.log(Number(temperature)); // 25（hint: 'number'）
console.log(String(temperature)); // 25°C（hint: 'string'）
console.log(`${temperature}`); // 25°C（hint: 'string'）
// 二元 + 运算符触发 hint='default'（TS 层面需要断言为可运算的类型）
console.log((temperature as unknown as string) + ' ~ '); // 温度对象（25°C） ~

console.log('\n========== 7. Symbol.toStringTag ==========');

// 指向一个方法：在对象上调用 Object.prototype.toString 方法时，
// 如果这个属性存在，其返回值会出现在 toString 的结果字符串中，表示对象的类型

class Vector2D {
  get [Symbol.toStringTag](): string {
    return 'Vector2D';
  }
}
console.log(Object.prototype.toString.call(new Vector2D())); // [object Vector2D]

const tagged = {
  [Symbol.toStringTag]: 'TaggedObject',
};
console.log(Object.prototype.toString.call(tagged)); // [object TaggedObject]

// 很多内置对象都通过它显示特定类型
console.log(Object.prototype.toString.call(Math)); // [object Math]
console.log(Object.prototype.toString.call(JSON)); // [object JSON]
console.log(Object.prototype.toString.call(new Map())); // [object Map]

console.log('\n========== 8. Symbol.unscopables ==========');

// 指向一个对象，指定了使用 with 关键字时，哪些属性会被 with 环境排除。
// 数组原型上定义了这个属性，使得 ES6 新增的数组方法不会进入 with 环境
//（避免污染 ES5 旧代码 with(arr) 中 arr.entries 之类的变量名）
const unscopables = Array.prototype[Symbol.unscopables];
console.log(unscopables);
// { copyWithin: true, entries: true, fill: true, find: true,
//   findIndex: true, keys: true, includes: true }

console.log('copyWithin 被排除：', Array.prototype[Symbol.unscopables].copyWithin === true); // true

// 说明：with 语句在模块 / 严格模式下不可用（本文件是模块），
// 因此这里只读取该属性验证其内容，不再演示 with 语法

export {};
