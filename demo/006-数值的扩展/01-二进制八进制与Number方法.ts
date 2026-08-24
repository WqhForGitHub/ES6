/**
 * 《ES6 标准入门（第三版）》第 6 章：数值的扩展
 * Demo 01：二进制 / 八进制表示法与 Number 新增方法
 *
 * ES6 提供了二进制和八进制数值的新的写法，分别用前缀 0b（或 0B）
 * 和 0o（或 0O）表示。并将全局方法 parseInt() 和 parseFloat()
 * 移植到了 Number 对象上，行为完全保持不变。
 *
 * 运行：node 01-二进制八进制与Number方法.ts
 */

console.log('========== 1. 二进制与八进制字面量 ==========');

const binary: number = 0b1010; // 二进制（ES5 中不允许）
const octal: number = 0o755; // 八进制（ES5 中不允许）
console.log(binary, octal); // 10 493
// 从 ES5 开始，严格模式中八进制不再允许使用前缀 0 表示（如 010），必须用 0o

// Number 也可以将 0b / 0o 前缀的字符串转为十进制
console.log(Number('0b101'), Number('0o755')); // 10 493

console.log('\n========== 2. Number.isFinite / Number.isNaN ==========');

// Number.isFinite：检查一个数值是否为有限的（finite），非数值一律返回 false
console.log(Number.isFinite(15)); // true
console.log(Number.isFinite(0.8)); // true
console.log(Number.isFinite(NaN)); // false
console.log(Number.isFinite(Infinity)); // false
console.log(Number.isFinite(-Infinity)); // false
console.log(Number.isFinite('15')); // false（字符串，传统全局 isFinite 会先转为数值）
console.log(Number.isFinite(true)); // false（布尔值）

// Number.isNaN：检查一个值是否为 NaN，非数值一律返回 false
console.log(Number.isNaN(NaN)); // true
console.log(Number.isNaN(15)); // false
console.log(Number.isNaN('15')); // false（传统全局 isNaN 会先转数值，'15' -> 15 -> false）
console.log(Number.isNaN(true)); // false
console.log(isNaN('hello' as unknown as number)); // true（传统全局 isNaN：'hello' -> NaN -> true）
console.log(Number.isNaN('hello' as unknown as number)); // false（类型断言仅演示）

// 它们与传统的全局方法区别在于：传统方法先调用 Number() 将非数值转为数值，
// 而新方法只对数值类型有效，非数值一律返回 false（更安全，符合预期）。

console.log('\n========== 3. Number.parseInt / Number.parseFloat ==========');

// ES6 将全局方法 parseInt / parseFloat 移植到 Number 对象上，行为完全一致
console.log(Number.parseInt('42.7px')); // 42（逐字符解析，遇到非数字停止）
console.log(Number.parseFloat('3.14rem')); // 3.14
console.log(Number.parseInt('0x1f', 16)); // 31（支持进制参数）
console.log(Number.parseInt === parseInt); // true（完全相同的函数）

// 目的：逐步减少全局性方法，使得语言逐步模块化（数值相关的方法都挂在 Number 上）

console.log('\n========== 4. Number.isInteger 与安全整数 ==========');

// Number.isInteger：判断一个数值是否为整数（注意：JavaScript 内部整数和浮点数
// 采用同样的储存方法，所以 3 和 3.0 被视为同一个值）
console.log(Number.isInteger(25)); // true
console.log(Number.isInteger(25.0)); // true（25.0 就是 25）
console.log(Number.isInteger(25.1)); // false
console.log(Number.isInteger('25')); // false（非数值一律 false）
console.log(Number.isInteger(true)); // false

// 精度限制：超过这个范围，会出现"伪整数"（小数点后丢失精度）
console.log(Number.isInteger(3.0000000000000002)); // false（有效精度 15~17 位以内）
console.log(Number.isInteger(5E-324)); // true（小于 5E-324 的值会被自动转为 0）
console.log(Number.isInteger(1e100)); // true（科学计数法表示的整数）

console.log('\n========== 5. 业务场景：商品表单的数据清洗 ==========');

// 需求：商品录入表单提交的数据是"字符串"（input 的 value 都是字符串），
// 入库前要清洗：价格必须是有限数字、库存必须是整数、
// 上架时间戳来自"0x"开头的十六进制字符串（内部系统约定）。

interface GoodsFormInput {
  priceText: string; // 价格（元）
  stockText: string; // 库存
  createdAtText: string; // 创建时间戳（十六进制字符串）
}

interface GoodsRecord {
  price: number; // 分
  stock: number;
  createdAt: number;
}

function cleanGoodsForm(form: GoodsFormInput): { ok: true; data: GoodsRecord } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  // 1. 价格：转数字后必须是有限值（NaN / Infinity / 空串都要拦下）
  const priceYuan: number = Number.parseFloat(form.priceText);
  if (!Number.isFinite(priceYuan) || priceYuan < 0) {
    errors.push('价格必须是大于等于 0 的数字');
  }

  // 2. 库存：必须是整数（"12.5 件商品"没有意义）
  const stock: number = Number.parseInt(form.stockText, 10);
  if (!Number.isInteger(stock) || stock < 0) {
    errors.push('库存必须是非负整数');
  }

  // 3. 时间戳：内部系统传十六进制字符串（如 '0x6A8B1900'），按 16 进制解析
  const createdAt: number = Number.parseInt(form.createdAtText, 16);
  if (!Number.isFinite(createdAt) || createdAt <= 0) {
    errors.push('创建时间戳格式错误');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    data: {
      price: Math.round(priceYuan * 100), // 元转分，规避小数误差
      stock,
      createdAt,
    },
  };
}

console.log(cleanGoodsForm({ priceText: '199.50', stockText: '120', createdAtText: '0x6A8B1900' }));
// { ok: true, data: { price: 19950, stock: 120, createdAt: 1787500800 } }
// （0x6A8B1900 即 1787500800，2026-08-24 00:00:00 的秒级时间戳）
console.log(cleanGoodsForm({ priceText: 'abc', stockText: '12.5', createdAtText: '' }));
// { ok: false, errors: [ '价格必须是大于等于 0 的数字', '库存必须是非负整数', '创建时间戳格式错误' ] }

// 要点：Number.isFinite / Number.isNaN / Number.isInteger 对非数值一律返回 false，
// 比 parseFloat 后手工 typeof 判断干净得多，正好覆盖表单清洗的各类脏数据。

export {};
