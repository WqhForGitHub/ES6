/**
 * 《ES6 标准入门（第三版）》第 1 章：ECMAScript 6 简介
 * Demo 02：Babel 转码示例
 *
 * Babel 是一个广泛使用的 ES6 转码器，可以把 ES6 代码编译成 ES5 代码，
 * 从而在只支持 ES5 的老环境中运行。
 *
 * 常用命令（需要先安装）：
 *   npm install --save-dev @babel/core @babel/cli @babel/preset-env
 *   npx babel src --out-dir lib          # 把 src 目录转码后输出到 lib 目录
 *   npx babel input.js -o output.js      # 转码单个文件
 *
 * 配置文件 babel.config.json 示例（注释形式给出）：
 *   {
 *     "presets": ["@babel/env"]
 *   }
 *
 * 补充：TypeScript 本身就是一个"转码器"——tsc 既能做类型检查，也能把
 * TS/新语法编译成指定 target（如 ES5）的代码。
 *
 * 本文件先打印一段 ES6 源码及其 Babel 编译后的等价 ES5 代码（手工示意），
 * 再直接运行 ES6 版本的代码。
 *
 * 运行：node 02-Babel转码示例.ts
 */

console.log('========== 1. ES6 源码 ==========');

const es6Source = `
const sum = (a, b = 1) => a + b;            // 箭头函数 + 默认参数
const [x, ...rest] = [1, 2, 3];             // 数组解构 + rest 参数
const { name } = { name: 'es6' };           // 对象解构
class Point {                               // class
  constructor(x) { this.x = x; }
  getX() { return this.x; }
}
const s = \`你好 \${name}\`;                    // 模板字符串
for (const v of [1, 2]) {}                  // for...of
`;

console.log(es6Source);

console.log('========== 2. Babel 编译后的 ES5 代码（示意） ==========');

const es5Output = `
"use strict";

var sum = function sum(a) {
  var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  return a + b;
};

var _ref = [1, 2, 3],
    x = _ref[0],
    rest = _ref.slice(1);

var name = { name: 'es6' }.name;

var Point = function Point(x) {
  _classCallCheck(this, Point);   // Babel 注入：禁止把类当普通函数调用
  this.x = x;
};

Point.prototype.getX = function () {   // class 方法落到原型上
  return this.x;
};

var s = '你好 ' + name;              // 模板字符串退化为拼接

var _arr = [1, 2];
for (var _i = 0; _i < _arr.length; _i++) {  // for...of 退化为普通循环
  var v = _arr[_i];
}
`;

console.log(es5Output);

console.log('========== 3. 直接运行 ES6 版本（Node 原生支持） ==========');

// 上面的 ES6 代码在 Node 中可以直接运行，无需转码
const sum = (a: number, b: number = 1): number => a + b;
const [x, ...rest] = [1, 2, 3];
const { name } = { name: 'es6' };

class Point {
  x: number;
  constructor(x: number) {
    this.x = x;
  }
  getX(): number {
    return this.x;
  }
}

const s: string = `你好 ${name}`;

console.log('sum(10) =', sum(10)); // 11
console.log('x, rest =', x, rest); // 1 [ 2, 3 ]
console.log('name =', name); // es6
console.log('new Point(5).getX() =', new Point(5).getX()); // 5
console.log('s =', s); // 你好 es6
for (const v of [1, 2]) {
  console.log('for...of 值：', v);
}

console.log('\n========== 4. 业务场景：为什么银行 / 政务项目仍在用 Babel ==========');

// 场景：某银行的活动页必须兼容旧版浏览器（如 IE11、低版本安卓 WebView），
// 开发时用 ES6+ 写"运费计算"，上线前用 Babel / tsc 转成 ES5。

const es6ShippingFee = `
// 满额免运费，否则按重量计费（价格为分）
const calcShippingFee = (amount, weightKg) => {
  const [base, perKg] = [800, 200];       // 基础运费 8 元 + 2 元/kg
  if (amount >= 19900) return 0;          // 满 199 元免运费
  return base + Math.max(0, weightKg - 1) * perKg;  // 首重 1kg
};
console.log(calcShippingFee(12800, 3));   // 800 + 2 * 200 = 1200（12 元）
`;

const es5ShippingFee = `
var calcShippingFee = function (amount, weightKg) {
  var base = 800, perKg = 200;
  if (amount >= 19900) return 0;
  return base + Math.max(0, weightKg - 1) * perKg;
};
`;

console.log(es6ShippingFee);
console.log('转码后的 ES5 版本（箭头函数退化为 function、解构退化为逐个取值）：');
console.log(es5ShippingFee);

// 直接运行 ES6 版本（Node 原生支持，无需转码）
const calcShippingFee = (amount: number, weightKg: number): number => {
  const [base, perKg] = [800, 200];
  if (amount >= 19900) return 0;
  return base + Math.max(0, weightKg - 1) * perKg;
};
console.log('订单 ¥128 / 3kg 的运费：', calcShippingFee(12800, 3), '分'); // 1200 分（12 元）
console.log('订单 ¥199 / 3kg 的运费：', calcShippingFee(19900, 3), '分'); // 0 分（满额免运费）

export {};
