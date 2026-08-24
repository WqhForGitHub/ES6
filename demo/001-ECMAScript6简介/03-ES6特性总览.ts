/**
 * 《ES6 标准入门（第三版）》第 1 章：ECMAScript 6 简介
 * Demo 03：ES6 特性总览
 *
 * ES6 带来的新特性非常多，本书将逐一讲解。本 demo 用最短的代码
 * 对各章核心特性做一次"预览"，每一条都可以在对应章节找到详细说明。
 *
 * 运行：node 03-ES6特性总览.ts
 */

console.log('========== 第 2 章：let / const（块级作用域） ==========');
{
  const constant: string = '常量不可重新赋值';
  let mutable: number = 1;
  mutable += 1;
  console.log(constant, mutable);
}

console.log('\n========== 第 3 章：变量的解构赋值 ==========');
const [x1, , x3] = [1, 2, 3]; // 跳位解构
const { length } = 'hello'; // 对象解构（字符串的 length 属性）
console.log(x1, x3, length); // 1 3 5

console.log('\n========== 第 4 章：字符串的扩展 ==========');
console.log('\u{1F600}你好'.padStart(6, '.')); // Unicode 大括号表示法 + 补全长度
console.log('abc'.includes('b'), 'abc'.repeat(2)); // true abcabc

console.log('\n========== 第 5 章：正则的扩展 ==========');
console.log(/\d{4}/u.test('2026')); // u 修饰符（Unicode 模式）
console.log('2026-08-24'.match(/(?<y>\d{4})-(?<m>\d{2})/)?.groups?.y); // 命名捕获组 2026

console.log('\n========== 第 6 章：数值的扩展 ==========');
console.log(0b101, 0o17); // 二进制 / 八进制字面量：5 15
console.log(Number.isInteger(25), Math.trunc(-4.9), 2 ** 10); // true -4 1024

console.log('\n========== 第 7 章：函数的扩展 ==========');
const add = (a: number, b: number = 10): number => a + b; // 默认值 + 箭头函数
function restParams(...nums: number[]): number {
  return nums.reduce((acc: number, n: number): number => acc + n, 0); // rest 参数取代 arguments
}
console.log(add(5), restParams(1, 2, 3)); // 15 6

console.log('\n========== 第 8 章：数组的扩展 ==========');
console.log(Array.from({ length: 3 }, (_v, k) => k * 2)); // [ 0, 2, 4 ]
console.log([1, 2, 3].includes(2), [...new Set([1, 1, 2])]); // true [ 1, 2 ]

console.log('\n========== 第 9 章：对象的扩展 ==========');
const key: string = 'dynamic';
const shorthand = { key, [`${key}Name`]: '属性名表达式' }; // 简写 + 表达式属性名
console.log(shorthand, Object.is(NaN, NaN)); // true（=== 做不到）

console.log('\n========== 第 10 章：Symbol ==========');
const sym: symbol = Symbol('唯一');
console.log(typeof sym, Symbol('a') === Symbol('a')); // symbol false

console.log('\n========== 第 11 章：Set 与 Map ==========');
const scores = new Map<string, number>();
scores.set('语文', 90).set('数学', 100); // 可链式调用
console.log(scores.get('数学')); // 100

console.log('\n========== 第 12 章：Proxy ==========');
const validatorTarget: Record<string, unknown> = {};
const validator = new Proxy(validatorTarget, {
  set: (t: Record<string, unknown>, p: string | symbol, v: unknown): boolean => {
    if (p === 'age' && typeof v === 'number' && v > 150) {
      throw new RangeError('年龄不合法'); // 拦截非法写入
    }
    t[p as string] = v;
    return true;
  },
});
validator.age = 18; // 正常写入
console.log(validator.age); // 18

console.log('\n========== 第 13 章：Reflect ==========');
const reflectTarget = { a: 1 };
console.log(Reflect.has(reflectTarget, 'a'), Reflect.ownKeys(reflectTarget)); // true [ 'a' ]

console.log('\n========== 第 14 章及以后：Promise / 生成器 / async / class / 模块 ==========');
// Promise（第 14 章）、Iterator 与 for...of（第 15 章）、Generator（第 16、17 章）、
// async 函数（第 18 章）、Class（第 19、20 章）、修饰器（第 21 章）、
// Module（第 22、23 章）、ArrayBuffer（第 26 章）。
// 以上内容在后续章节的 demo 中详细展开。
Promise.resolve('异步结果的同步写法（详见第 14 章）').then(console.log);

console.log('\n========== 业务场景：一条 ES6 特性"全家桶"--订单摘要生成器 ==========');

// 需求：结算页需要把一笔订单汇总成一段发给客服的话术。
// 解构（含嵌套与默认值）、Map、模板字符串、reduce、Math、?? 全都用上了。

interface Order {
  id: string;
  user: { nickname: string; level: number };
  items: Array<{ name: string; price: number; qty: number }>; // price 单位：分
  coupon?: number; // 优惠券抵扣（分）
}

const order: Order = {
  id: 'SO-20260824-0001',
  user: { nickname: '小明', level: 3 },
  items: [
    { name: '《ES6 标准入门》', price: 9900, qty: 1 },
    { name: '机械键盘', price: 35900, qty: 2 },
  ],
};

function orderSummary({ id, user, items, coupon = 0 }: Order): string {
  // 解构商品单价和数量，计算小计
  const subtotal: number = items.reduce((acc: number, { price, qty }) => acc + price * qty, 0);
  const payable: number = Math.max(0, subtotal - coupon);
  const memberDiscount: number = user.level >= 3 ? 0.95 : 1; // 金卡会员 95 折
  const final: number = Math.trunc(payable * memberDiscount); // 折后抹去分以下的尾数
  const itemList: string = items.map(({ name, qty }) => `${name}×${qty}`).join('、');
  const levelName: string =
    new Map<number, string>([
      [1, '普通'],
      [2, '银卡'],
      [3, '金卡'],
    ]).get(user.level) ?? '普通';
  const saved: number = subtotal - final;
  return [
    `【${levelName}会员】${user.nickname} 的订单 ${id}`,
    `包含：${itemList}`,
    `应付：¥${(final / 100).toFixed(2)}（共优惠 ¥${(saved / 100).toFixed(2)}）`,
  ].join('\n');
}

console.log(orderSummary(order));
// 【金卡会员】小明 的订单 SO-20260824-0001
// 包含：《ES6 标准入门》×1、机械键盘×2
// 应付：¥76.81（共优惠 ¥4.03）

export {};
