/**
 * 《ES6 标准入门（第三版）》第 5 章：正则的扩展
 * Demo 01：RegExp 构造函数与 flags 属性
 *
 * ES5 中 RegExp 构造函数的参数有两种情况，且不允许使用第二个参数添加修饰符；
 * ES6 明确：如果 RegExp 构造函数第一个参数是一个正则对象，
 * 那么可以使用第二个参数指定修饰符，返回的正则表达式会忽略原有的修饰符。
 * ES6 还为正则表达式新增了 flags 属性，返回正则表达式的修饰符。
 *
 * 运行：node 01-RegExp构造函数与flags属性.ts
 */

console.log('========== 1. RegExp 构造函数 ==========');

// ES5 写法一：参数是字符串
const r1: RegExp = new RegExp('abc', 'i');
// ES5 写法二：参数是正则表达式（不允许再加第二个参数，否则报错）
const r2: RegExp = new RegExp(/abc/i);
console.log(r1.test('ABC'), r2.test('ABC')); // true true

// ES6 写法：第一个参数是正则对象时，第二个参数会覆盖原有的修饰符
const r3: RegExp = new RegExp(/abc/ig, 'i');
console.log(r3.flags); // 'i'（原有的 'ig' 被第二个参数 'i' 覆盖）
console.log(r3.test('ABC')); // true

console.log('\n========== 2. 与正则相关的实例属性 ==========');
const r4: RegExp = /abc/gim;
console.log(r4.ignoreCase); // true（是否有 i 修饰符）
console.log(r4.global); // true（是否有 g 修饰符）
console.log(r4.multiline); // true（是否有 m 修饰符）
console.log(r4.source); // 'abc'（正则表达式的正文）

// ES6 新增 flags 属性：返回全部修饰符，按字母序排列
console.log(r4.flags); // 'gim'

// ES6 新增 sticky 属性（ES5 的 sticky 属性在 ES6 才写入标准）
const r5: RegExp = /abc/y;
console.log(r5.sticky); // true（是否有 y 修饰符）
console.log(/abc/.sticky); // false

// ES2018 新增 dotAll 属性（详见本目录 Demo 03）
console.log(/abc/s.dotAll); // true（是否有 s 修饰符）
console.log(/abc/.dotAll); // false

// 注意：hasIndices 属性（/d 修饰符）是 ES2022 的扩展知识，配合 exec 的 indices 使用
console.log(/(\d)(\d)/d.exec('42')?.indices); // [ [0,2], [0,1], [1,2] ]

console.log('\n========== 6. 业务场景：动态敏感词过滤 ==========');

// 需求：运营后台可以配置"敏感词库"（存在数据库里，运行时才拿到），
// 商品评论发布前要过滤掉敏感词。敏感词数量与内容都是动态的，
// 这时只能用 new RegExp 把数组拼成"或"模式，且必须同时满足：
//   1. gi 修饰符：全局 + 忽略大小写（"BadWord" 与 "badword" 都要命中）
//   2. 转义：词库可能包含正则元字符（如 "C++"），直接拼进去会改变语义

function escapeRegExp(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义所有正则元字符
}

function sanitizeComment(comment: string, bannedWords: string[]): string {
  if (bannedWords.length === 0) {
    return comment; // 词库为空，直接放行
  }
  // 把词库拼成 (词1|词2|词3) 的"或"模式，动态构造正则：
  const pattern: string = `(${bannedWords.map(escapeRegExp).join('|')})`;
  const filter: RegExp = new RegExp(pattern, 'gi'); // 运行时才能拿到完整的 pattern
  return comment.replace(filter, (matched: string): string => '*'.repeat(matched.length));
}

const bannedWords: string[] = ['假货', 'C++', '加微信'];

console.log(sanitizeComment('这C++教程不错，但是有人说这是假货，加微信低价拿', bannedWords));
// 这***教程不错，但是有人说这是**，***低价拿

// 用 flags 属性自检过滤器的配置（调试 / 日志埋点时有用）：
const checkFilter: RegExp = new RegExp('假货|C\\+\\+|加微信', 'gi');
console.log('过滤器 flags：', checkFilter.flags); // 'gi'

export {};
