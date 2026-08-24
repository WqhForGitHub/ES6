/**
 * 《ES6 标准入门（第三版）》第 5 章：正则的扩展
 * Demo 02：u 修饰符与 y 修饰符
 *
 * u 修饰符含义为"Unicode 模式"，用来正确处理大于 \uFFFF 的 Unicode 字符。
 * y 修饰符叫做"粘连"（sticky）修饰符，作用与 g 修饰符类似，也是全局匹配，
 * 但 y 修饰符确保匹配必须从剩余的第一个位置开始（即"粘连"在 lastIndex 位置）。
 *
 * 运行：node 02-u修饰符与y修饰符.ts
 */

console.log('========== 1. u 修饰符：Unicode 模式 ==========');

// 不加 u：'\uD83D\uDC2A'（🐨）被当作两个字符（两个 UTF-16 码元）
console.log(/^\uD83D/.test('\uD83D\uDC2A')); // true（匹配到了前半个字符）
// 加 u：四个字节的 Unicode 字符会被识别为单个字符
console.log(/^\uD83D/u.test('\uD83D\uDC2A')); // false（\uD83D 只是一个码元的一半，无法匹配）

// 一旦加上 u 修饰符，就会按照 UTF-16 的码点来解析正则表达式
// （TS 不允许在"无 u 修饰符"的正则字面量里写 \u{...}，因此用 RegExp 构造 ES5 写法）
const es5Style: RegExp = new RegExp('\\u{61}');
console.log(es5Style.test('a')); // false（ES5 中 \u{61} 被理解为 61 个连续的 u）
console.log(/\u{61}/u.test('a')); // true（u 模式下 \u{...} 表示码点，{61} 即字母 a）
console.log(/\u{20BB7}/u.test('𠮷')); // true

// u 模式下，量词可以正确作用于大于 0xFFFF 的 Unicode 字符
console.log(/𠮷{2}/u.test('𠮷𠮷')); // true（整体重复两次）
// 不加 u 时，会被理解为"𠮷 的后半个码元 + {2}"
console.log(/𠮷{2}/.test('𠮷𠮷')); // false

// u 模式下，"." 能正确匹配码点大于 0xFFFF 的字符
console.log(/^.$/.test('𠮷')); // false（. 匹配一个码元，𠮷 占两个码元）
console.log(/^.$/u.test('𠮷')); // true（. 匹配一个字符）

// u 模式 + i 修饰符：进行 Unicode 规范化的大小写转换（识别非规范字符）
console.log(/[a-z]/i.test('\u212A')); // false（\u212A 是 Kelvin 符号 K 的另一种码点）
console.log(/[a-z]/iu.test('\u212A')); // true（u 模式下被规范化为 K）

console.log('\n========== 2. y 修饰符：粘连 ==========');

const s: string = 'aaa_aa_a';

// g 修饰符：剩余字符串中匹配成功的起始位置可以是任意位置
const g1: RegExp = /a+/g;
g1.lastIndex = 0;
console.log(g1.exec(s)?.[0], g1.lastIndex); // 'aaa' 3
console.log(g1.exec(s)?.[0], g1.lastIndex); // 'aa' 6（跳过了 _，从第 4 位开始匹配成功）
console.log(g1.exec(s)?.[0], g1.lastIndex); // 'a' 8

// y 修饰符：必须从 lastIndex 位置开始匹配成功（"粘连"在 lastIndex）
const y1: RegExp = /a+/y;
y1.lastIndex = 0;
console.log(y1.exec(s)?.[0], y1.lastIndex); // 'aaa' 3
const next: RegExpExecArray | null = y1.exec(s);
console.log(next, y1.lastIndex); // null 0（第 3 位是 _，粘连匹配失败，lastIndex 重置为 0）

console.log('\n========== 3. y 修饰符与 g 修饰符的对比 ==========');

// 书中经典例子：同一个正则，g 与 y 的区别
const gy: RegExp = /a+/gy; // 同时带 g 和 y
gy.lastIndex = 2;
// 从第 2 位（'a'）开始粘连匹配
console.log(gy.exec('aa_a')?.[0], gy.lastIndex); // 'a' 3
console.log(gy.exec('aa_a')); // null（第 3 位是 _，粘连失败）

// y 修饰符的设计本意：让匹配"必须"从指定位置开始（例如分词场景）
// 'aa_a'.split(/a/y)? 注意：split 内部会把 y 修饰符忽略掉（书中提到的兼容怪癖）

console.log('\n========== 4. 实战：用 y 修饰符做词法分析（tokenize） ==========');

const tokenRegexes: Array<{ type: string; re: RegExp }> = [
  { type: '空格', re: /\s+/y },
  { type: '数字', re: /\d+/y },
  { type: '标识符', re: /[a-zA-Z_]\w*/y },
  { type: '运算符', re: /[+\-*/]/y },
];

function tokenize(code: string): Array<{ type: string; value: string }> {
  const tokens: Array<{ type: string; value: string }> = [];
  let pos: number = 0;
  while (pos < code.length) {
    let matched: boolean = false;
    for (const { type, re } of tokenRegexes) {
      re.lastIndex = pos; // 每次都从 pos 开始"粘连"匹配
      const m: RegExpExecArray | null = re.exec(code);
      if (m) {
        if (type !== '空格') {
          tokens.push({ type, value: m[0] });
        }
        pos = re.lastIndex;
        matched = true;
        break;
      }
    }
    if (!matched) {
      throw new Error(`无法识别的字符：${code[pos]}（位置 ${pos}）`);
    }
  }
  return tokens;
}
console.log(tokenize('12 + foo * 3'));
// [ { type: '数字', value: '12' }, { type: '运算符', value: '+' },
//   { type: '标识符', value: 'foo' }, { type: '运算符', value: '*' },
//   { type: '数字', value: '3' } ]

console.log('\n========== 5. 业务场景：国际化用户名校验（u 修饰符） ==========');

// 需求：产品要出海，用户名允许"中文 / 英文 / 数字 / Emoji"，
// 长度限制按"真实字符数"（码点数）计算。
// 不加 u 修饰符，四字节字符（Emoji、部分生僻字）会被拆成两个码元，
// 校验结果与用户看到的完全对不上。

const USERNAME_MAX: number = 12;

// 用 u 修饰符 + \u{...} 码点写法：
//   [\p{Script=Han}\p{L}\p{N}\p{Emoji_Presentation}] 的含义（配合 Demo 04 详解）：
//   汉字 / 任意语言的字母 / 数字 / 彩色 Emoji
const usernamePattern: RegExp = /^[\p{Script=Han}\p{L}\p{N}\p{Emoji_Presentation}]+$/u;

function countCodePoints(input: string): number {
  let count: number = 0;
  for (const _ch of input) {
    count++; // for...of 按码点遍历
  }
  return count;
}

function validateUsername(name: string): { ok: boolean; reason?: string } {
  if (!usernamePattern.test(name)) {
    return { ok: false, reason: '只能包含中文、英文、数字或 Emoji' };
  }
  const length: number = countCodePoints(name);
  if (length > USERNAME_MAX) {
    return { ok: false, reason: `最多 ${USERNAME_MAX} 个字符（当前 ${length} 个）` };
  }
  return { ok: true };
}

console.log(validateUsername('小明_Ming😀')); // { ok: true }
console.log(validateUsername('小明<Ming>')); // { ok: false, reason: '只能包含中文、英文、数字或 Emoji' }
console.log(validateUsername('😀😀😀😀😀😀😀😀😀😀😀😀😀')); // 13 个 Emoji，超长
// 对比：不加 u 时 /[\u{L}]/ 这样的模式根本无法按码点解析，量词也会算错码元，
// 国际化场景的字符校验必须始终带上 u 修饰符

export {};
