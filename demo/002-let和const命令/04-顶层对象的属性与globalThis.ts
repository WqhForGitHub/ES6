/**
 * 《ES6 标准入门（第三版）》第 2 章：let 和 const 命令
 * Demo 04：顶层对象的属性与 globalThis
 *
 * 顶层对象在浏览器环境指 window，在 Node 指 global（Web Worker 中是 self）。
 * ES5 的顶层对象与全局变量的关系：顶层对象的属性赋值与全局变量的赋值是同一件事。
 * 这带来几个问题：
 *   1. 无法在编译时就报出变量未声明的错误，只有运行时才知道；
 *   2. 很容易不知不觉创建全局变量（如拼错变量名）；
 *   3. window 对象实体化，JavaScript 作为多环境语言不合理。
 *
 * ES6 规定：let、const、class 声明的全局变量，不属于顶层对象的属性。
 * ES2020 又引入 globalThis 作为统一的顶层对象入口。
 *
 * 注意：本文件是 ES 模块（末尾 export {}），模块中的 var 也不会挂到顶层对象；
 * "var 挂到顶层对象"只发生在非模块的"脚本"（script）中。
 *
 * 运行：node 04-顶层对象的属性与globalThis.ts
 */

console.log('========== 1. 顶层对象：不同环境的不同名字 ==========');

// 各环境的顶层对象（以注释形式给出，避免在特定环境下报错）：
//   浏览器：    window === globalThis
//   Web Worker： self === globalThis
//   Node：      global === globalThis
console.log('globalThis 的类型：', typeof globalThis); // 'object'（ES2020 统一入口）

// 任何环境都可以用同一个标识符拿到顶层对象：
const topObject: Record<string, unknown> = globalThis as unknown as Record<string, unknown>;
console.log('通过 globalThis 写入属性...');
topObject.appName = 'es6-demo';
console.log('读回属性：', topObject.appName); // es6-demo
delete topObject.appName; // 用完记得删除，避免污染全局
console.log('删除后：', 'appName' in topObject); // false

console.log('\n========== 2. var（脚本中）会挂到顶层对象，let / const 不会 ==========');

// 在"脚本"（非模块）中：
//   var command = 'var 声明';     -> window.command === 'var 声明'  ✓
//   function fn() {}              -> window.fn === fn                ✓
//
// 而 let / const / class 声明的全局变量，永远不属于顶层对象的属性：
let letValue: string = 'let 声明的变量';
const constValue: string = 'const 声明的变量';

console.log("'letValue' 是顶层对象的属性吗？", 'letValue' in topObject); // false
console.log("'constValue' 是顶层对象的属性吗？", 'constValue' in topObject); // false
console.log('但它们本身是可访问的：', letValue, constValue);

// 本文件是模块，var 也一样不会挂到顶层对象上：
var moduleVar: string = '模块中的 var 变量';
console.log("'moduleVar' 是顶层对象的属性吗？", 'moduleVar' in topObject); // false

console.log('\n========== 3. globalThis 的意义 ==========');

// ES5 时代取顶层对象需要各种兼容写法（历史代码常见）：
//   const global =
//     typeof window !== 'undefined' ? window :
//     typeof global !== 'undefined' ? global :
//     typeof self !== 'undefined' ? self : {};
//
// ES2020 之后只需一行，任何环境行为一致：
const unified: object = globalThis;
console.log('统一入口拿到顶层对象：', typeof unified); // 'object'

// 全局环境下的 this：
// ES6 模块中：顶层的 this 是 undefined（这有助于尽早暴露误用 this 的代码）
// 非模块的脚本中：非严格模式下 this === window，严格模式下 undefined
console.log('（说明：模块顶层的 this 是 undefined，非模块脚本中则是 window）');

console.log('\n========== 4. 业务场景：跨端统一的"应用配置"挂载 ==========');

// 需求：同一套前端代码要跑在浏览器、Node 脚本、Web Worker 三种环境里，
// 监控 SDK 需要把"追踪 ID"等配置挂到全局，供任意模块读取。
// ES2020 之前要写一堆环境判断（window / self / global），现在统一用 globalThis：

interface AppConfig {
  traceId: string;
  appId: string;
  startedAt: number;
}

const appConfig: AppConfig = {
  traceId: 'trace-2026-0824-001',
  appId: 'mall-h5',
  startedAt: Date.now(),
};

// 统一挂载（以前要判断 window / self / global，现在只有 globalThis）
const globalStore = globalThis as unknown as { __APP_CONFIG__?: AppConfig };
globalStore.__APP_CONFIG__ = appConfig;

// 任意模块、任意环境都能这样取：
function getTraceId(): string {
  return globalStore.__APP_CONFIG__?.traceId ?? 'unknown';
}
console.log('日志上报携带的 traceId：', getTraceId());

// 上报接口示例：错误监控上报时统一附带追踪信息
function reportError(err: Error): void {
  const cfg: AppConfig | undefined = globalStore.__APP_CONFIG__;
  console.log(`[${cfg?.appId ?? 'unknown'}] 上报错误：${err.message}（trace: ${cfg?.traceId ?? '-'}）`);
}
reportError(new Error('下单接口超时'));
// [mall-h5] 上报错误：下单接口超时（trace: trace-2026-0824-001）

// 用完清理，避免污染全局
delete globalStore.__APP_CONFIG__;
console.log('清理后配置是否还在：', '__APP_CONFIG__' in globalStore); // false

export {};
