/**
 * 《ES6 标准入门（第三版）》第 6 章：数值的扩展
 * Demo 04：BigInt 数据类型（ES2020）
 *
 * BigInt 只用来表示整数，没有位数限制，任何位数的整数都可以精确表示。
 * 它是 JS 的第 8 种数据类型（前 7 种：undefined/null/布尔值/字符串/数值/
 * 对象/Symbol）。为 Number 增补了"任意精度整数"的能力。
 *
 * 运行：node 04-BigInt.ts
 */

console.log('========== 1. 精度丢失的问题 ==========');

// JavaScript 的 Number 以 64 位浮点数存储，安全整数范围是 -2^53 ~ 2^53。
// 超过这个范围，整数会"静默地"丢失精度（不报错！），这是很多资损事故的根源：
console.log(9007199254740993 === 9007199254740992); // true（两个不同的数竟然相等！）
console.log(9007199254740993); // 9007199254740992（末位被吞掉，变成了前一个数）

// BigInt 用一个后缀 n 声明，整数不再有精度限制：
console.log(9007199254740993n); // 9007199254740993n（原样保留）
console.log(9007199254740993n === 9007199254740992n); // false（BigInt 精确比较）

console.log('\n========== 2. BigInt 的基本用法 ==========');

// 写法一：整数字面量后加 n
const big1: bigint = 123n;
// 写法二：BigInt() 函数（接收整数或整数字符串；不能是小数！）
const big2: bigint = BigInt(123);
const bigFromString: bigint = BigInt('9007199254740993'); // 字符串大数也不丢精度
console.log(big1, big2, bigFromString); // 123n 123n 9007199254740993n
console.log(typeof big1); // 'bigint'（新的数据类型，不是 number）

// BigInt 与 Number 的类型严格区分：
console.log(123n === 123); // false（类型不同，严格相等失败）
console.log(123n == 123); // true（宽松相等会做类型转换，但不建议依赖）
// console.log(123n + 1); // TypeError: Cannot mix BigInt and other types（不能混算！）

// typeof 的第 8 种返回值
console.log(typeof 1n, typeof 1); // 'bigint' 'number'

console.log('\n========== 3. BigInt 的运算 ==========');

// 四则运算与自增都支持（除法会舍去小数部分 -- 向零取整）：
console.log(7n + 3n, 7n - 3n, 7n * 3n); // 10n 4n 21n
console.log(7n / 2n); // 3n（不是 3.5n！BigInt 只有整数）
console.log(7n % 2n); // 1n
console.log(2n ** 10n); // 1024n（指数运算符两边必须都是 BigInt）

// 一元负号可用，但一元加号不行（会破坏 asm.js 兼容，被有意禁止）：
console.log(-3n); // -3n
// console.log(+3n); // TypeError: Cannot convert a BigInt value to a number

// 位运算、移位可用（以无限精度进行）：
console.log(1n << 64n); // 18446744073709551616n（2 的 64 次方，远超 Number 安全范围）

// 与 Number 的比较运算是允许的（会按数学值比较，而不是类型）：
console.log(2n > 1); // true
console.log(2n < 3); // true

// 与 Number 互转（大转小要警惕精度）：
console.log(Number(2n ** 52n)); // 4503599627370496（安全范围内，精确）
console.log(Number(2n ** 63n + 1n)); // 9223372036854775808（超范围，+1 被舍掉！）
console.log(BigInt(Number.MAX_SAFE_INTEGER)); // 9007199254740991n
// console.log(BigInt(1.5)); // RangeError: The number 1.5 cannot be converted to a BigInt

console.log('\n========== 4. 转换规则与 JSON 的坑 ==========');

// BigInt 转 Number 时可能丢失精度，TS 下需要显式转换：
const huge: bigint = BigInt('123456789012345678901234567890');
console.log(Number(huge)); // 1.2345678901234568e+29（精度已丢失，仅用于展示量级）

// JSON 不支持 BigInt（会直接抛错，序列化前必须先转字符串）：
try {
  JSON.stringify({ amount: 1n });
} catch (e) {
  const err: unknown = e;
  console.log('JSON.stringify 报错：', err instanceof Error ? err.message : String(err));
  // Do not know how to serialize a BigInt
}
// 正确做法：传输时用字符串承载
console.log(JSON.stringify({ amount: '123456789012345678901234567890' }));

console.log('\n========== 5. 业务场景：大额转账（分为单位） ==========');

// 需求：对公转账有"单日限额 1 亿元"的风控规则，金额全部以"分"为单位处理。
// 单笔金额很少触到 2^53 的边界，但支付系统普遍使用 64 位雪花 ID（数值约 10^18，
// 远超 2^53 ≈ 9×10^15），用 number 接收会静默丢精度、对不上账；
// 极端大促的累计流水同样有越界风险。
// 结论：金额与大型 ID 用 BigInt（或字符串）承载，展示时再转 number（只看量级）。

const DAILY_LIMIT_CENTS: bigint = 10_000_000_000n; // 单日限额 1 亿元（分）

interface TransferInput {
  from: string;
  to: string;
  amountText: string; // 前端传来的金额（分，字符串 -- 避免 number 精度问题）
}

function transferInCents(transfer: TransferInput): { ok: boolean; message: string } {
  // 1. 字符串直接转 BigInt：任意长度都不丢精度
  let amount: bigint;
  try {
    amount = BigInt(transfer.amountText);
  } catch {
    return { ok: false, message: '金额格式错误（必须是整数字符串）' };
  }
  if (amount <= 0n) {
    return { ok: false, message: '转账金额必须大于 0' };
  }
  // 2. BigInt 之间的比较精确无误
  if (amount > DAILY_LIMIT_CENTS) {
    return { ok: false, message: `超过单日限额 ${DAILY_LIMIT_CENTS / 100n} 元` };
  }
  // 3. 结果继续用字符串 / bigint 承载（JSON 不支持 BigInt，见上一节）
  return { ok: true, message: `${transfer.from} -> ${transfer.to} 转账 ${amount / 100n} 元成功` };
}

console.log(transferInCents({ from: 'A公司', to: 'B公司', amountText: '250000000' }));
// { ok: true, message: 'A公司 -> B公司 转账 2500000 元成功' }（250 万元）
console.log(transferInCents({ from: 'A公司', to: 'B公司', amountText: '12000000000' }));
// { ok: false, message: '超过单日限额 100000000 元' }（12 亿元 > 1 亿元限额）
console.log(transferInCents({ from: 'A公司', to: 'B公司', amountText: '12.5' }));
// { ok: false, message: '金额格式错误（必须是整数字符串）' }

// 流水累加对比：BigInt 累加永远精确
const dailyFlows: string[] = [
  '4503599627370496', // 恰好 2^52
  '4503599627370496',
  '9007199254740993', // 比 2^53 大 1
];
const bigSum: bigint = dailyFlows.reduce((sum, s) => sum + BigInt(s), 0n);
console.log('BigInt 累加结果：', bigSum); // 18014398509481985n（精确）
console.log('转 number 展示：', Number(bigSum)); // 18014398509481984（已丢 1 分！只能看量级）

export {};
