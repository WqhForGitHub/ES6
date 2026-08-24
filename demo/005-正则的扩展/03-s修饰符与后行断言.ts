/**
 * 《ES6 标准入门（第三版）》第 5 章：正则的扩展
 * Demo 03：s 修饰符（dotAll）与后行断言（ES2018）
 *
 * ES2018 对正则表达式新增了 s 修饰符（dotAll 模式），使得 . 可以
 * 匹配任意单个字符（包括换行符 \n、回车符 \r 等"行终止符"）。
 * 同时引入了"后行断言"：匹配前面/后面位置的条件（先行断言 ES5 已有）。
 *
 * 运行：node 03-s修饰符与后行断言.ts
 */

console.log('========== 1. 先行断言（lookahead，ES5 已支持，回顾） ==========');

// x(?=y)：x 只有在 y 前面才匹配（"先行断言"）
console.log(/\d+(?=%)/.exec('50% 的结果是 100%')?.[0]); // '50'（只匹配 % 前面的数字）
// x(?!y)：x 只有不在 y 前面才匹配（"先行否定断言"）
console.log(/\d+(?!%)/.exec('50% 的结果是 100%')?.[0]); // '0'（50 被 % 跟随被排除，匹配到 0）

console.log('\n========== 2. 后行断言（lookbehind，ES2018 新增） ==========');

// (?<=y)x：x 只有在 y 后面才匹配（"后行断言"）
// 匹配货币符号 $ 后面的数字：
const priceRegex: RegExp = /(?<=\$)\d+(\.\d+)?/;
console.log(priceRegex.exec('书价 $59.90')?.[0]); // '59.90'
console.log(priceRegex.exec('书价 ¥59.90')); // null（前面不是 $）

// (?<!y)x：x 只有不在 y 后面才匹配（"后行否定断言"）
const notDollar: RegExp = /(?<!\$)\d+/;
console.log(notDollar.exec('价格 €42')?.[0]); // '42'（前面不是 $，匹配成功）
console.log(notDollar.exec('价格 $42')?.[0]); // '2'（'4' 前面是 $ 被排除，只能匹配到 '2'）

// 后行断言的经典应用：千分位分割（从后往前匹配）
function thousandsSeparators(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+$)/g, ',');
}
console.log(thousandsSeparators(1234567890)); // '1,234,567,890'

console.log('\n========== 3. s 修饰符（dotAll 模式，ES2018 新增） ==========');

// ES5 中 . 不匹配"行终止符"（\n、\r、\u2028、\u2029）
console.log(/foo.bar/.test('foo\nbar')); // false（. 无法匹配换行符）
// ES2018 引入 s 修饰符后，. 可以匹配任意单个字符（包括行终止符）
console.log(/foo.bar/s.test('foo\nbar')); // true
console.log(/foo.bar/s.dotAll); // true（dotAll 属性与 s 修饰符对应）
console.log(/foo.bar/.dotAll); // false

// 多行文本匹配示例：匹配任意两个单词（中间允许换行）
const paragraph: string = '第一行\n第二行';
console.log(/第一行.第二行/s.test(paragraph)); // true（. 跨过了换行符）

console.log('\n========== 4. 一个综合例子 ==========');

// 从多行日志中提取紧跟着 ERROR 的时间（先行断言 + 后行断言 + s 修饰符）
const log: string = `2026-08-24 ERROR 连接失败
2026-08-24 INFO 重试中
2026-08-25 ERROR 连接失败`;

// 逐行分析：匹配紧随 ERROR 的日期（该日期位于行首）
const errorDates: RegExp = /(?<=^)(\d{4}-\d{2}-\d{2})(?= ERROR)/gm;
console.log(log.match(errorDates)); // [ '2026-08-24', '2026-08-25' ]

console.log('\n========== 5. 业务场景：客服消息里的 @提及 提取（后行断言） ==========');

// 需求：IM 聊天里输入 "@张三 你看一下这个工单"，要把 @ 后面的
// 客服姓名提取出来做高亮与提醒推送。
// 关键：@ 必须出现在"单词边界之后"（@ 前面是空白或行首），
// 但 @ 本身不能被吃进结果 —— 这正是后行断言 (?<=) 的主场：
// "匹配到 X，但 X 前面必须是 @，且结果里不包含 @"。

function extractMentions(message: string): string[] {
  // 两个后行断言组合使用：
  //   (?<=@)        ：姓名必须紧跟在 @ 之后（@ 不进入结果）
  //   (?<![\w.]@)   ：这个 @ 的前面不能是字母/数字/下划线/点（排除邮箱 user@examp.com）
  // 姓名本身：2~4 个汉字，或英文账号 \w+（u 修饰符配合 \p{...}，见 Demo 02）
  const mentionPattern: RegExp = /(?<=@)(?<![\w.]@)(?:[\p{Script=Han}]{2,4}|\w+)/gu;
  return message.match(mentionPattern) ?? [];
}

console.log(extractMentions('@张三 你看一下这个工单，@李四 也需要确认')); // [ '张三', '李四' ]
console.log(extractMentions('邮箱是 user@examp.com，不是提及')); // []（@ 前面是字母，被负向后行断言排除）
console.log(extractMentions('@Alex 请 review 一下 PR')); // [ 'Alex' ]

// 反例对比：如果只用 /(?<=@)\w+/gu，邮箱 user@examp.com 里的 examp 会被误判为提及；
// 负向后行断言 (?<!...) 让"排除逻辑"也能零宽表达，不必把 @ 吃进结果再切。

export {};
