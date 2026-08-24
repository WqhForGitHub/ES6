/**
 * 《ES6 标准入门（第三版）》第 4 章：字符串的扩展
 * Demo 02：字符串的新增方法
 *
 * includes()、startsWith()、endsWith()、repeat()、padStart()、padEnd()
 * 以及 normalize() 等。这些方法都支持第二个参数（起始/结束位置）。
 *
 * 运行：node 02-字符串的新增方法.ts
 */

console.log('========== 1. includes / startsWith / endsWith ==========');

const s: string = 'Hello world!';

// ES5 只有 indexOf 方法可以用来确定一个字符串是否包含在另一个字符串中
console.log(s.indexOf('world') !== -1); // true
// ES6 提供了三种新方法，返回布尔值：
console.log(s.includes('o w')); // true（是否找到了参数字符串，任意位置）
console.log(s.startsWith('Hello')); // true（参数字符串是否在原字符串的头部）
console.log(s.endsWith('!')); // true（参数字符串是否在原字符串的尾部）

// 都支持第二个参数，表示开始搜索/结束搜索的位置：
console.log(s.startsWith('world', 6)); // true（从第 6 个位置开始检查）
console.log(s.endsWith('Hello', 5)); // true（针对前 5 个字符检查）
console.log(s.includes('Hello', 1)); // false（从第 1 个位置开始找不到 Hello）

console.log('\n========== 2. repeat ==========');

// repeat 方法返回一个新字符串，表示将原字符串重复 n 次
console.log('x'.repeat(3)); // 'xxx'
console.log('hello'.repeat(2)); // 'hellohello'
console.log('na'.repeat(0)); // ''（0 次）
// console.log('na'.repeat(2.9)); // 'nana'（小数会被取整，2.9 -> 2）
// console.log('na'.repeat(-1)); // RangeError（-1 到 0 之间会报错；-0.5 会被视为 0）
// console.log('na'.repeat(Infinity)); // RangeError
// console.log('na'.repeat('3')); // 'nanana'（字符串会先转为数字）

console.log('\n========== 3. padStart / padEnd（ES2017，扩展知识） ==========');

// padStart 用于头部补全，padEnd 用于尾部补全，一共接受两个参数：
// 第一个是补全后字符串的最大长度，第二个是用来补全的字符串
console.log('x'.padStart(5, 'ab')); // 'ababx'
console.log('x'.padEnd(5, 'ab')); // 'xabab'
console.log('xxx'.padStart(2, 'ab')); // 'xxx'（超过最大长度不会截断原字符串）
console.log('x'.padStart(4)); // '   x'（省略第二个参数时用空格补全）
// 如果原字符串长度等于或大于最大长度，返回原字符串

// 常见用途：补全日期、数值格式化、URL 重定向
console.log('09-12'.padStart(10, 'YYYY-MM-DD')); // 'YYYY-09-12'
console.log('1'.padStart(4, '0')); // '0001'（数值补足位数）
console.log('6'.padStart(3, '0').padEnd(6, '#')); // '006###'

console.log('\n========== 4. trimStart / trimEnd（ES2019，扩展知识） ==========');

// 它们的行为与 trim() 一致，但只消除字符串头部/尾部的空白（含空格、制表符、换行符）
const padded: string = '  es6  ';
console.log(`[${padded.trimStart()}]`); // '[es6  ]'
console.log(`[${padded.trimEnd()}]`); // '[  es6]'
console.log(`[${padded.trim()}]`); // '[es6]'
// 浏览器还部署了额外的 trimLeft / trimRight，是 trimStart / trimEnd 的别名

console.log('\n========== 5. normalize（Unicode 正规化） ==========');

// 许多欧洲语言有重音符号与变音符，Unicode 提供了多种表示方式（合成/分解），
// 视觉相同的字符在比较时可能不相等，normalize 用来统一成同一种方式：
const composed: string = 'Ǒ'; // U+01D2（合成形式：一个码点）
const decomposed: string = '\u004F\u030C'; // 分解形式：O + 组合重音符
console.log(composed === decomposed); // false（视觉相同，码点不同）
console.log(composed === decomposed.normalize('NFC')); // true（正规化为合成形式）
console.log(composed.normalize('NFD') === decomposed); // true（正规化为分解形式）
// NFC：合成等价分解；NFD：规范分解；NFKC/NFKD：兼容等价分解

console.log('\n========== 6. 业务场景：表单校验与单号补零 ==========');

// 需求一：注册 / 登录表单的手机号与短信验证码校验。
// includes / startsWith 配合正则，可以写出很直白的校验规则：

function isPhone(input: string): boolean {
  const trimmed: string = input.trim(); // 顺手处理用户复制粘贴带进的空格
  return trimmed.length === 11 && trimmed.startsWith('1') && !trimmed.includes('.');
}

function isSmsCode(input: string): boolean {
  return /^\d{6}$/.test(input); // 6 位纯数字
}

console.log(isPhone(' 13800138000 ')); // true（trimStart/trimEnd 生效）
console.log(isPhone('23800138000')); // false（不以 1 开头）
console.log(isSmsCode('123456')); // true
console.log(isSmsCode('12345')); // false

// 需求二：订单号、日期等业务编号要求固定位数，不足补零（padStart 的主场）：

function formatOrderNo(seq: number, date: Date): string {
  const y: number = date.getFullYear();
  const m: string = String(date.getMonth() + 1).padStart(2, '0'); // 月份补零：9 -> 09
  const d: string = String(date.getDate()).padStart(2, '0');
  return `SO${y}${m}${d}-${String(seq).padStart(6, '0')}`; // 序号补足 6 位
}
console.log(formatOrderNo(42, new Date('2026-08-24'))); // SO20260824-000042

// 需求三：控制台输出对账单时左右对齐（padEnd + padStart 组合）：
const billRows: Array<[string, number]> = [
  ['商品销售额', 128600],
  ['运费收入', 1200],
  ['优惠券核销', -3500],
];
for (const [label, amount] of billRows) {
  const labelPadded: string = label.padEnd(8, '　'); // 全角空格补齐，中文对齐更整齐
  const amountText: string = (amount / 100).toFixed(2).padStart(10); // 金额右对齐
  console.log(`${labelPadded}${amountText}`);
}
// 商品销售额　　　　1286.00
// 运费收入　　　　　  12.00
// 优惠券核销　　　　-35.00

// 需求四：进度条（repeat 生成填充字符）：
function progressBar(done: number, total: number, width: number = 20): string {
  const filled: number = Math.round((done / total) * width);
  return `${'█'.repeat(filled)}${'░'.repeat(width - filled)} ${Math.trunc((done / total) * 100)}%`;
}
console.log('上传进度：', progressBar(3, 4)); // ███████████████░░░░░ 75%

export {};
