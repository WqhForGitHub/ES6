/**
 * 《ES6 标准入门（第三版）》第 4 章：字符串的扩展
 * Demo 01：字符的 Unicode 表示法与 codePointAt
 *
 * ES6 对字符串做一些修补，使得 JavaScript 可以正确处理
 * 大于 \uFFFF 的 Unicode 字符（四个字节的 UTF-16 字符）。
 *
 * 运行：node 01-Unicode表示法与codePointAt.ts
 */

console.log('========== 1. Unicode 表示法：\\u{XXXXX} ==========');

// ES5 只能表示 \u0000-\uFFFF 之间的字符，超出范围的必须用两个双字节的形式表达
const es5Char: string = '\uD842\uDFB7'; // 𠮷（ surrogate pair 形式）
// ES6 只要将码点放在大括号内，就能正确解读
const es6Char: string = '\u{20BB7}'; // 𠮷
console.log(es5Char === es6Char); // true
console.log('\u{1F600}'); // 😀（码点大于 0xFFFF 的字符终于可以直观表示了）

console.log('\n========== 2. codePointAt：正确的码点 ==========');

const s: string = '𠮷';
console.log(s.length); // 2（length 按 UTF-16 码元计算，四字节字符占 2 个位置）
console.log(s.charCodeAt(0)); // 55362（第一个字节的值，是代理对的一部分，码点被拆开了）
console.log(s.charCodeAt(1)); // 57271
// codePointAt 会正确返回完整的十进制码点（TS 中返回值可能为 undefined，需处理）
console.log(s.codePointAt(0)?.toString(16)); // '20bb7'（正确：完整的码点）
console.log(s.codePointAt(0) === 0x20bb7); // true
console.log('a'.codePointAt(0) === 0x61); // true（两字节以内字符行为与 charCodeAt 一致）

// codePointAt 是测试一个字符由两个字节还是由四个字节组成的最简单方法：
function is32Bit(c: string): boolean {
  return c.codePointAt(0) !== undefined && c.codePointAt(0)! > 0xffff;
}
console.log(is32Bit('𠮷')); // true（四字节）
console.log(is32Bit('a')); // false（两字节）

console.log('\n========== 3. String.fromCodePoint ==========');

// ES5 的 String.fromCharCode 无法识别码点大于 0xFFFF 的字符
console.log(String.fromCharCode(0x20bb7)); // 出现乱码（高位字节被丢弃）
// ES6 的 String.fromCodePoint 可以正确返回对应字符（支持多个参数）
console.log(String.fromCodePoint(0x20bb7)); // 𠮷
console.log(String.fromCodePoint(0x78, 0x1f680, 0x79)); // x🚀y
// 与 codePointAt 互为逆操作（在正确处理码点的意义上）
console.log(String.fromCodePoint('𠮷'.codePointAt(0)!) === '𠮷'); // true

console.log('\n========== 4. 字符串的遍历器接口 ==========');

// ES6 为字符串添加了遍历器接口（详见第 15 章），使得字符串可以被 for...of 循环遍历。
// 最大的优点：可以识别大于 0xFFFF 的码点（传统的 for 循环不能正确处理）：
const text: string = '𠮷a';
for (const ch of text) {
  console.log(ch); // 𠮷、a（逐"字符"遍历，而不是逐"码元"）
}
// 对比传统 for 循环（按 UTF-16 码元遍历，四字节字符被拆成两半）：
for (let i = 0; i < text.length; i++) {
  console.log(text.charCodeAt(i)); // 55362、57271、97（'𠮷' 被拆成两个码元）
}

console.log('\n========== 5. at（ES2022，扩展知识） ==========');

// at() 返回指定位置的字符，且能正确识别四字节字符（charAt 的补全方案）
console.log('𠮷a'.at(0)); // 𠮷（charAt(0) 只能返回半个字符）
console.log('abc'.at(-1)); // 'c'（支持负索引）

console.log('\n========== 6. 业务场景：Emoji 昵称的长度校验 ==========');

// 需求：用户昵称限制"最多 8 个字符"，但用户喜欢用 Emoji（大多占 4 字节）。
// 直接用 length 判断会误伤：一个 😀 按 length 算 2，用户明明只输入了 1 个"字"。
// 正确做法：用 for...of / [...str] 按码点统计真实字符数：

function countChars(input: string): number {
  let count: number = 0;
  for (const _ch of input) {
    count++; // for...of 逐"码点"遍历，四字节字符算 1 个
  }
  return count;
}

function validateNickname(nickname: string): { ok: boolean; length: number; reason?: string } {
  const realLength: number = countChars(nickname);
  if (realLength === 0) {
    return { ok: false, length: 0, reason: '昵称不能为空' };
  }
  if (realLength > 8) {
    return { ok: false, length: realLength, reason: `昵称最多 8 个字符（当前 ${realLength} 个）` };
  }
  return { ok: true, length: realLength };
}

console.log(`'😀😀😀😀'.length =`, '😀😀😀😀'.length); // 8（按码元算，吓人）
console.log(`真实字符数 =`, countChars('😀😀😀😀')); // 4（按码点算，正确）
console.log(validateNickname('小明😀')); // { ok: true, length: 3 }
console.log(validateNickname('张三丰的😀😀😀😀😀😀')); // { ok: false, length: 11, reason: '昵称最多 8 个字符（当前 11 个）' }

// 顺带：生成"猜字谜"提示时截取首个字符，也必须用码点（at / [...str]）而不是 charAt：
const nickname: string = '𠮷祥如意';
console.log('charAt(0) 截出半个字：', nickname.charAt(0)); // �（乱码）
console.log('at(0) / 展开取第一个：', nickname.at(0), [...nickname][0]); // 𠮷 𠮷（完整字符）

export {};
