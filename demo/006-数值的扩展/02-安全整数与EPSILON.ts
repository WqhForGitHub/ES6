/**
 * 《ES6 标准入门（第三版）》第 6 章：数值的扩展
 * Demo 02：安全整数与 Number.EPSILON
 *
 * ES6 在 Number 对象上新增了极小的常量 Number.EPSILON（2 的 -52 次方），
 * 以及安全整数的上下限（Number.MAX_SAFE_INTEGER / MIN_SAFE_INTEGER）。
 *
 * 运行：node 02-安全整数与EPSILON.ts
 */

console.log('========== 1. Number.EPSILON：浮点数误差的容差 ==========');

// EPSILON 表示 1 与大于 1 的最小浮点数之间的差值
console.log(Number.EPSILON); // 2.220446049250313e-16
console.log(Number.EPSILON === Math.pow(2, -52)); // true

// 经典的浮点数精度问题：
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false！（浮点数二进制表示导致的误差）

// EPSILON 的用途：为浮点数计算设置一个误差范围，只要差值小于它就认为相等
function withinErrorMargin(left: number, right: number): boolean {
  return Math.abs(left - right) < Number.EPSILON * Number.EPSILON;
}
console.log(withinErrorMargin(0.1 + 0.2, 0.3)); // true
console.log(withinErrorMargin(0.5 + 0.1, 0.7)); // true

console.log('\n========== 2. 安全整数 ==========');

// JavaScript 能够准确表示的整数范围在 -2^53 与 2^53 之间（不含两个端点），
// 超过这个范围，无法精确表示这个值：
console.log(Math.pow(2, 53)); // 9007199254740992
console.log(Math.pow(2, 53) === Math.pow(2, 53) + 1); // true！（超出精度，两者相等）

// ES6 引入了 MAX_SAFE_INTEGER / MIN_SAFE_INTEGER 常量与 isSafeInteger 方法
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991（2^53 - 1）
console.log(Number.MIN_SAFE_INTEGER); // -9007199254740991
console.log(Number.isSafeInteger(9007199254740991)); // true（在安全范围内）
console.log(Number.isSafeInteger(9007199254740992)); // false（超出安全范围）
console.log(Number.isSafeInteger(-9007199254740991)); // true

// 注意：isSafeInteger 的入参必须是"数值"，且必须是"安全整数"，才返回 true
console.log(Number.isSafeInteger('9007199254740991')); // false（字符串）

// 实战：一个简单的安全运算检查（在计算前先校验，避免静默的精度错误）
function safeAdd(a: number, b: number): number {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) {
    throw new RangeError('操作数超出安全整数范围，请使用 BigInt（见 Demo 04）');
  }
  const result: number = a + b;
  if (!Number.isSafeInteger(result)) {
    throw new RangeError('计算结果超出安全整数范围，请使用 BigInt（见 Demo 04）');
  }
  return result;
}
console.log(safeAdd(1, 2)); // 3
try {
  safeAdd(Number.MAX_SAFE_INTEGER, 1); // 抛错：结果不安全
} catch (e) {
  console.log('捕获错误：', e instanceof RangeError ? e.message : String(e));
}

console.log('\n========== 5. 业务场景：订单金额的容差计算 ==========');

// 需求一：支付回调里核对"实付金额"与"应收金额"。
// 金额经手多方（支付网关、银行、清算）可能带小数，直接 === 比较会误判，
// 业界通行做法是"小于一个容差（如 1 分钱的百分之一）即视为相等"：

const EPSILON_CENTS: number = 0.01; // 容差：0.01 分

function isAmountEqual(paid: number, expect: number): boolean {
  return Math.abs(paid - expect) < EPSILON_CENTS;
}

console.log(isAmountEqual(9900.000000000002, 9900)); // true（浮点误差在容差内）
console.log(isAmountEqual(9900.5, 9900)); // false（差 0.5 分，真的不相等）

// 需求二：购物车金额合计前先校验"安全整数"。
// 促销平台极端情况下单量金额可能超过 2^53（分），一旦越过安全整数边界，
// 后续所有加减都会静默出错 -- 宁可提前报错，也不要带病入账：

interface CartItem {
  name: string;
  amount: number; // 分
}

function calcCartTotal(items: CartItem[]): number {
  // 先校验每一行金额本身是否安全
  for (const item of items) {
    if (!Number.isSafeInteger(item.amount)) {
      throw new RangeError(`商品「${item.name}」金额 ${item.amount} 不是安全整数`);
    }
  }
  const total: number = items.reduce((sum, { amount }) => sum + amount, 0);
  // 再校验合计是否安全（溢出常见于合计而非单行）
  if (!Number.isSafeInteger(total)) {
    throw new RangeError(`合计金额 ${total} 超出安全整数范围，请改用 BigInt 入账`);
  }
  return total;
}

const cart: CartItem[] = [
  { name: '机械键盘', amount: 49900 },
  { name: '显示器', amount: 189900 },
  { name: '鼠标垫', amount: 2900 },
];
console.log('购物车合计（分）：', calcCartTotal(cart)); // 242700

try {
  calcCartTotal([{ name: '大宗采购', amount: Number.MAX_SAFE_INTEGER }, { name: '运费', amount: 800 }]);
} catch (e) {
  console.log('捕获错误：', e instanceof RangeError ? e.message : String(e));
  // 合计金额 9007199254741991 超出安全整数范围，请改用 BigInt 入账
}

export {};
