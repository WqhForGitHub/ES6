/**
 * 《ES6 标准入门（第三版）》第 1 章：ECMAScript 6 简介
 * Demo 01：ES5 与 ES6 写法对比
 *
 * ECMAScript 6（简称 ES6，正式名称 ECMAScript 2015）于 2015 年 6 月正式发布，
 * 是 JavaScript 语言的下一代标准。ES6 的目标，是使得 JavaScript 语言可以
 * 用来编写复杂的大型应用程序，成为企业级开发语言。
 *
 * 运行：node 01-ES5与ES6对比.ts（Node 22.18+ / 24 原生支持直接运行 TypeScript）
 */

console.log('========== 1. 变量声明：var -> let / const ==========');

// ES5：只有 var，存在变量提升、无块级作用域等问题
if (true) {
  var es5Var = 'var 声明的变量';
}
console.log(es5Var); // var 没有块级作用域，块外依然能访问（容易污染全局）

// ES6：let / const 具有块级作用域
if (true) {
  let es6Let: string = 'let 声明的变量';
  const es6Const: string = 'const 声明的常量';
  console.log(es6Let, es6Const);
}
// console.log(es6Let); // 报错：es6Let is not defined（块级作用域外不可见）

console.log('\n========== 2. 字符串：拼接 -> 模板字符串 ==========');

const name: string = '张三';
const age: number = 20;

// ES5：用 + 拼接
const es5Greeting: string = '大家好，我叫' + name + '，今年' + age + '岁。';
console.log(es5Greeting);

// ES6：模板字符串，支持变量嵌入与运算
const es6Greeting: string = `大家好，我叫 ${name}，今年 ${age} 岁，明年 ${age + 1} 岁。`;
console.log(es6Greeting);

console.log('\n========== 3. 函数：function -> 箭头函数 ==========');

// ES5
const es5Square = function (x: number): number {
  return x * x;
};

// ES6：箭头函数（表达式作为返回值时可省略 return）
const es6Square = (x: number): number => x * x;

console.log(es5Square(5), es6Square(5)); // 25 25

// ES6：函数参数默认值
function greet(who: string = '世界'): string {
  return `你好，${who}`;
}
console.log(greet()); // 不传参时使用默认值
console.log(greet('ES6')); // 传参时覆盖默认值

console.log('\n========== 4. 对象与类 ==========');

// ES5：用构造函数 + 原型模拟类
// TS 提示：ES5 构造函数的 this 形状需要显式描述，这正是 TS 展示"类型"价值的地方
interface PersonEs5Instance {
  name: string;
  sayHi(): string;
}
function PersonEs5(this: PersonEs5Instance, name: string): void {
  this.name = name;
}
PersonEs5.prototype.sayHi = function (this: PersonEs5Instance): string {
  return 'Hi, I am ' + this.name;
};
// TS 提示：带 this 参数的函数不能直接 new，断言为可构造类型
const PersonEs5Ctor = PersonEs5 as unknown as new (name: string) => PersonEs5Instance;

// ES6：class 语法（本质仍是基于原型的语法糖）
class PersonEs6 {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  sayHi(): string {
    return `Hi, I am ${this.name}`;
  }
}

const p1 = new PersonEs5Ctor('ES5');
const p2 = new PersonEs6('ES6');
console.log(p1.sayHi()); // Hi, I am ES5
console.log(p2.sayHi()); // Hi, I am ES6
console.log(typeof PersonEs6); // function：class 本质是函数

console.log('\n========== 5. 新的数据结构与异步方案 ==========');

// ES6 新增数据结构：Set（成员唯一）、Map（键值对集合）
const set = new Set([1, 2, 2, 3, 3, 3]);
const map = new Map<string, number>([
  ['a', 1],
  ['b', 2],
]);
console.log('Set 自动去重：', [...set]); // [ 1, 2, 3 ]
console.log('Map 取值：', map.get('a'), map.get('b')); // 1 2

// ES5：异步回调
setTimeout((): void => {
  console.log('ES5: 回调方式执行完毕');
}, 0);

// ES6：Promise（本 demo 结束后按事件循环顺序输出）
Promise.resolve('ES6: Promise 方式执行完毕').then((msg: string): void => console.log(msg));

console.log('\n========== 6. 经典循环问题：var vs let（详见第 2 章） ==========');

// ES5 经典陷阱：var 声明的 i 是全局的，循环结束后变成 3，所有回调共享同一个 i
const callbacks: Array<() => number> = [];
for (var i = 0; i < 3; i++) {
  callbacks.push((): number => i);
}
console.log('var 循环：', callbacks.map((f) => f())); // [ 3, 3, 3 ]

// ES6：let 为每一轮循环创建独立的块级作用域，绑定不同的 i
const callbacks2: Array<() => number> = [];
for (let j = 0; j < 3; j++) {
  callbacks2.push((): number => j);
}
console.log('let 循环：', callbacks2.map((f) => f())); // [ 0, 1, 2 ]

console.log('\n========== 7. 解构赋值与扩展运算符 ==========');

// ES5
const arr: number[] = [1, 2, 3];
const firstEs5: number = arr[0];
const restEs5: number[] = arr.slice(1);

// ES6
const [first, ...rest] = arr;
console.log(first, rest); // 1 [ 2, 3 ]
console.log('ES5 取值：', firstEs5, restEs5);

const person = { name: '李四', age: 30 };
// ES5: const n = person.name;
const { name: n, age: a } = person;
console.log(n, a); // 李四 30

console.log('\n========== 8. 业务场景：商品库存毛利报表（ES6 综合运用） ==========');

// 电商后台需求：根据商品的进价、售价、库存，计算毛利与毛利率，并生成可读报表。
// 一个小小的需求里，综合用到了 class、getter、解构、模板字符串、箭头函数、reduce。

interface Product {
  id: string;
  name: string;
  costPrice: number; // 进价（单位：分）
  price: number; // 售价（单位：分）
  stock: number; // 库存
}

const products: Product[] = [
  { id: 'P001', name: '机械键盘', costPrice: 19900, price: 35900, stock: 120 },
  { id: 'P002', name: '无线鼠标', costPrice: 5900, price: 12900, stock: 350 },
];

class ProductReport {
  product: Product;
  constructor(product: Product) {
    this.product = product;
  }
  // 毛利（分）：售价 - 进价。写成 getter，售价调整后报表自动更新
  get grossProfit(): number {
    return this.product.price - this.product.costPrice;
  }
  // 毛利率：毛利 / 售价
  get grossMargin(): string {
    return `${((this.grossProfit / this.product.price) * 100).toFixed(1)}%`;
  }
  get summary(): string {
    const { name, stock } = this.product; // 解构：只取需要的字段
    return `${name}：库存 ${stock} 件，毛利 ¥${(this.grossProfit / 100).toFixed(2)}（毛利率 ${this.grossMargin}）`;
  }
}

const reports: ProductReport[] = products.map((p) => new ProductReport(p));
reports.forEach((r) => console.log(r.summary));
// 机械键盘：库存 120 件，毛利 ¥160.00（毛利率 44.6%）
// 无线鼠标：库存 350 件，毛利 ¥70.00（毛利率 54.3%）

// 若全部售罄的总毛利（单位：分）
const totalProfit: number = products.reduce(
  (acc: number, p: Product): number => acc + (p.price - p.costPrice) * p.stock,
  0
);
console.log(`若全部售罄，总毛利：¥${(totalProfit / 100).toLocaleString('zh-CN')}`); // ¥44,900.00

export {};
