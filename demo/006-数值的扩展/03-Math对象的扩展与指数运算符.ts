/**
 * 《ES6 标准入门（第三版）》第 6 章：数值的扩展
 * Demo 03：Math 对象的扩展与指数运算符
 *
 * ES6 在 Math 对象上新增了 17 个与数学相关的方法，
 * 以及 ES2016 的指数运算符（**）。
 *
 * 运行：node 03-Math对象的扩展与指数运算符.ts
 */

console.log('========== 1. Math.trunc：去除小数部分 ==========');

// 返回整数部分（不是四舍五入，而是直接砍掉小数部分）
console.log(Math.trunc(4.1)); // 4
console.log(Math.trunc(4.9)); // 4
console.log(Math.trunc(-4.1)); // -4
console.log(Math.trunc(-4.9)); // -4
console.log(Math.trunc(-0.123)); // -0（保留负零）
// 非数值会先内部调用 Number 转为数值；空值返回 NaN
// （TS 要求参数为 number，这里用断言演示运行时的自动转换行为）
console.log(Math.trunc('123.45' as unknown as number)); // 123（字符串先转数值）
console.log(Math.trunc(true as unknown as number)); // 1
console.log(Math.trunc(false as unknown as number)); // 0
console.log(Math.trunc(NaN)); // NaN

console.log('\n========== 2. Math.sign：判断正数、负数、零 ==========');

// 返回五种值：+1（正数）、-1（负数）、0（正零）、-0（负零）、NaN（无法转数值）
console.log(Math.sign(-5)); // -1
console.log(Math.sign(5)); // +1
console.log(Math.sign(0)); // 0
console.log(Math.sign(-0)); // -0
console.log(Math.sign(NaN)); // NaN
console.log(Math.sign('9' as unknown as number)); // 1（字符串先转数值）
console.log(Math.sign('foo' as unknown as number)); // NaN

console.log('\n========== 3. Math.cbrt：立方根 ==========');

console.log(Math.cbrt(-1)); // -1
console.log(Math.cbrt(0)); // 0
console.log(Math.cbrt(8)); // 2
console.log(Math.cbrt('8' as unknown as number)); // 2（字符串先转数值）
console.log(Math.cbrt('foo' as unknown as number)); // NaN

console.log('\n========== 4. 其他新增的数学方法（快速一览） ==========');

// Math.hypot：返回所有参数的平方和的平方根（勾股定理）
console.log(Math.hypot(3, 4)); // 5
console.log(Math.hypot(3, 4, 5)); // 7.0710678118654755
// Math.clz32：返回 32 位无符号整数形式的前导 0 的个数
console.log(Math.clz32(0)); // 32
console.log(Math.clz32(1)); // 31（1 的二进制是 1，前面有 31 个 0）
// Math.imul：返回两个数以 32 位带符号整数形式相乘的结果（处理溢出）
console.log(Math.imul(2, 4)); // 8
console.log(0x7fffffff * 0x7fffffff); // 超大数（1.6e+18，超出 32 位）
console.log(Math.imul(0x7fffffff, 0x7fffffff)); // 1（32 位溢出截断后的结果）
// Math.fround：返回数值最接近的单精度（32 位）浮点数形式
console.log(Math.fround(1.337)); // 1.3370000123977661（双精度转单精度的误差）
// 对数相关
console.log(Math.expm1(1)); // e^1 - 1，即 1.718281828459045
console.log(Math.log1p(1)); // ln(1 + 1)，即 0.6931471805599453
console.log(Math.log2(8)); // 3
console.log(Math.log10(1000)); // 3
// 双曲函数（sinh / cosh / tanh / asinh / acosh / atanh）同样新增
console.log(Math.tanh(0)); // 0
console.log(Math.sinh(0)); // 0

console.log('\n========== 5. 指数运算符（ES2016） ==========');

// ** 是 ES2016 新增的指数运算符（相当于 Math.pow）
console.log(2 ** 3); // 8
console.log(2 ** (3 ** 2)); // 512（右结合：先算 3**2 = 9，再 2**9）
console.log(Math.pow(2, 3)); // 8（Math.pow 的等价写法）

// 与 Math.pow 的区别：** 是运算符，可以与等号结合，形成新的赋值运算符 **=
let base: number = 2;
base **= 3; // 等同于 base = base ** 3
console.log(base); // 8

// 注意：负数底数必须加括号（语法歧义）
// console.log(-2 ** 2); // 语法错误：Unary operator used immediately before exponentiation expression
console.log((-2) ** 2); // 4

console.log('\n========== 6. 业务场景：促销价格与库存变化 ==========');

// 需求一：促销活动的价格计算。"满减后抹零"（trunc 舍去分位零头）、
// "每满 300 减 40"这类规则用 Math.trunc 表达最直接：

function promoPrice(original: number): number {
  // 每满 300 元减 40 元（金额单位是分：300 元 = 30000 分，40 元 = 4000 分）
  const groups: number = Math.trunc(original / 30000);
  const discounted: number = original - groups * 4000;
  // 抹零：不足 1 元的零头直接抹掉（trunc 向零取整，正数即向下取整）
  return Math.trunc(discounted / 100) * 100;
}
console.log(promoPrice(59900)); // 599 元：满 1 组减 40 元 = 559 元，抹零后 55900 分
console.log(promoPrice(25000)); // 250 元：不满 300 元，原价，抹零后 25000 分

// 需求二：库存变动流水里的"方向标签"。库存变化有进有出，
// Math.sign 返回 -1/0/+1，正好映射"出库/无变化/入库"：

function stockChangeLabel(delta: number): string {
  const direction: number = Math.sign(delta);
  if (direction > 0) {
    return `入库 +${delta}`;
  }
  if (direction < 0) {
    return `出库 ${delta}`;
  }
  return '无变化';
}
console.log(stockChangeLabel(120)); // 入库 +120
console.log(stockChangeLabel(-35)); // 出库 -35
console.log(stockChangeLabel(0)); // 无变化

// 需求三：运营投放预算按"天数复利"效果预估（指数运算符），
// 并用 hypot 计算多渠道投放的"综合偏差"（勾股定理推广到 n 维）：

function projectBudget(dailyBudget: number, days: number, dailyGrowth: number): number {
  // 预算按日复合增长：base * (1 + r) ** days（第 days 天的预算）
  return Math.round(dailyBudget * (1 + dailyGrowth) ** days);
}
console.log('第 7 天的预算（分）：', projectBudget(10000, 7, 0.1)); // 10000 * 1.1^7 ≈ 19487 分（194.87 元）

const channelBias: number = Math.hypot(0.05, 0.12, 0.08); // 三个渠道的偏差率综合
console.log('多渠道综合偏差率：', channelBias.toFixed(4)); // 0.1570（比简单相加更符合"距离"语义）

export {};
