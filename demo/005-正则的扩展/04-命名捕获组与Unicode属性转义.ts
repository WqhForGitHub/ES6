/**
 * 《ES6 标准入门（第三版）》第 5 章：正则的扩展
 * Demo 04：命名捕获组与 Unicode 属性转义（ES2018）
 *
 * ES2018 引入了"命名捕获组"（Named Capture Groups），允许为每一个
 * 组匹配指定一个名字，既便于阅读代码，也便于引用匹配结果。
 * "Unicode 属性转义"则提供了直接匹配符合某种 Unicode 属性的字符的能力。
 *
 * 运行：node 04-命名捕获组与Unicode属性转义.ts
 */

console.log('========== 1. 命名捕获组的基本用法 ==========');

// ES5 只能用数字序号引用捕获组，语义不明：
const es5Regex: RegExp = /(\d{4})-(\d{2})-(\d{2})/;
const es5Match: RegExpExecArray | null = es5Regex.exec('2026-08-24');
console.log(es5Match?.[1], es5Match?.[2], es5Match?.[3]); // 2026 08 24（1 是年？2 是月？）

// ES2018 命名捕获组：(?<名字>模式)
const dateRegex: RegExp = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const m: RegExpExecArray | null = dateRegex.exec('2026-08-24');
console.log(m?.groups?.year, m?.groups?.month, m?.groups?.day); // 2026 08 24（语义一目了然）

// 配合解构赋值，代码更加清晰（groups 可能是 undefined，TS 会提示处理）
// （TS 的 groups 类型是索引签名形式，从中解构出的字段都是 string）
const groups: { [key: string]: string } | undefined = m?.groups;
if (groups) {
  const { year, month, day } = groups;
  console.log(`${day}/${month}/${year}`); // 24/08/2026
}

console.log('\n========== 2. 在 replace 中引用命名捕获组 ==========');

// $<名字> 引用命名捕获组（配合 replace 使用）
const replaced: string = '2026-08-24'.replace(dateRegex, '$<day>/$<month>/$<year>');
console.log(replaced); // 24/08/2026

// replace 的第二个参数也可以是函数，直接拿到 groups 对象：
const swapped: string = '2026-08-24'.replace(
  dateRegex,
  (
    _match: string,
    year: string,
    month: string,
    day: string,
    _offset: number,
    _whole: string,
    namedGroups: { year: string; month: string; day: string } | undefined
  ): string => {
    void year; void month; void day; // 未使用的位置捕获组
    return `${namedGroups?.year} 年 ${namedGroups?.month} 月 ${namedGroups?.day} 日`;
  }
);
console.log(swapped); // 2026 年 08 月 24 日

console.log('\n========== 3. 引用命名捕获组（反向引用 \\k<名字>） ==========');

// 同名标签配对匹配（HTML 的简单示例）：
const tagRegex: RegExp = /<(?<tag>[a-z]+)>(?<text>.*?)<\/\k<tag>>/;
const tagMatch: RegExpExecArray | null = tagRegex.exec('<h1>标题</h1>');
console.log(tagMatch?.groups?.tag, tagMatch?.groups?.text); // h1 标题
console.log(tagRegex.test('<h1>标题</p>')); // false（开闭标签不一致）

console.log('\n========== 4. Unicode 属性转义 \\p{...}（ES2018） ==========');

// \p{...} 匹配满足指定 Unicode 属性的字符，必须配合 u 修饰符使用：

// 匹配希腊字母（Script 属性）
console.log(/\p{Script=Greek}/u.test('χαλεπά')); // true（希腊文）
console.log(/\p{Script=Greek}/u.test('汉字')); // false

// 匹配所有"数字"类字符（Number 属性，包含罗马数字等）
console.log(/\p{Number}/u.test('Ⅷ')); // true（罗马数字 8 属于 Number 属性）
console.log(/\p{Number}/u.test('四')); // false（汉字'四'是普通表意文字，不属于 Number）
console.log(/^\p{Decimal_Number}+$/u.test('123')); // true（纯十进制数字）

// 匹配字母（Alphabetic 属性）
console.log(/^\p{Alphabetic}+$/u.test('hello')); // true
console.log(/^\p{Alphabetic}+$/u.test('hello123')); // false

// 大写 \P 表示否定（不满足该属性的字符）
console.log(/\P{Number}/u.test('abc')); // true
console.log(/\P{Number}/u.test('123')); // false

// 一个实用的例子：用 \p{...} 删除字符串中所有非字母字符
const messy: string = 'Héllo, 世界! 123';
console.log(messy.replace(/[^\p{L}\p{N}\s]/gu, '')); // Héllo 世界 123

console.log('\n========== 5. 业务场景：Nginx 访问日志解析 ==========');

// 需求：运维平台要统计"哪些接口最慢"，原始数据是 Nginx 的 access.log，
// 每行格式固定但字段很多。用命名捕获组一次解出所有关心的字段，
// 语义清晰、改起来也安全（不会像数字序号那样"插一个组、全错位"）。

const logLine: string =
  '10.2.9.17 - - [24/Aug/2026:10:21:03 +0800] "POST /api/order/create HTTP/1.1" 200 1250 832';

const logRegex: RegExp =
  /^(?<ip>\S+) \S+ \S+ \[(?<time>[^\]]+)\] "(?<method>\w+) (?<path>\S+) [^"]+" (?<status>\d{3}) (?<size>\d+) (?<costMs>\d+)$/;

function parseLogLine(line: string):
  | { ip: string; time: string; method: string; path: string; status: number; size: number; costMs: number }
  | null {
  const m: RegExpExecArray | null = logRegex.exec(line);
  const g: { [key: string]: string } | undefined = m?.groups;
  if (!g) {
    return null; // 格式不符合（脏数据/多行日志被截断）
  }
  // 命名捕获组 + 一层转换，直接得到强类型的日志对象：
  return {
    ip: g.ip,
    time: g.time,
    method: g.method,
    path: g.path,
    status: Number(g.status),
    size: Number(g.size),
    costMs: Number(g.costMs),
  };
}

const entry: ReturnType<typeof parseLogLine> = parseLogLine(logLine);
console.log(entry);
// { ip: '10.2.9.17', time: '24/Aug/2026:10:21:03 +0800',
//   method: 'POST', path: '/api/order/create', status: 200, size: 1250, costMs: 832 }

// 统计慢接口（超过 500ms 视为慢请求）：
const allLogs: string[] = [
  logLine,
  '10.2.9.18 - - [24/Aug/2026:10:21:04 +0800] "GET /api/goods/list HTTP/1.1" 200 20480 96',
  '10.2.9.19 - - [24/Aug/2026:10:21:05 +0800] "GET /api/report/export HTTP/1.1" 200 8192 1530',
  '脏数据行（不是日志）',
];

const slowApis: Array<{ path: string; costMs: number }> = [];
for (const line of allLogs) {
  const parsed: ReturnType<typeof parseLogLine> = parseLogLine(line);
  if (parsed && parsed.costMs > 500) {
    slowApis.push({ path: parsed.path, costMs: parsed.costMs });
  }
}
console.log('慢接口（>500ms）：', slowApis);
// [ { path: '/api/order/create', costMs: 832 }, { path: '/api/report/export', costMs: 1530 } ]

export {};
