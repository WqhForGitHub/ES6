/**
 * 《ES6 标准入门（第三版）》第 3 章：变量的解构赋值
 * Demo 04：解构赋值的用途
 *
 * 解构赋值的写法对提取对象中的属性、数组中的元素非常方便，
 * 在实际开发中有大量应用场景。
 *
 * 运行：node 04-解构赋值的用途.ts
 */

console.log('========== 1. 交换变量的值 ==========');

let x: number = 1;
let y: number = 2;
[x, y] = [y, x];
console.log(x, y); // 2 1（不需要临时变量）

console.log('\n========== 2. 从函数返回多个值 ==========');

// 函数只能返回一个值，如果要返回多个值，只能将它们放在数组或对象里返回，
// 有了解构赋值，取出这些值就非常方便：

// 返回一个数组
function example(): [number, number, string] {
  return [1, 2, 'three'];
}
const [a, b, c] = example();
console.log(a, b, c); // 1 2 three

// 返回一个对象（比数组更直观，可以按属性名取值，不用关心顺序）
function getPoint(): { x: number; y: number } {
  return { x: 10, y: 20 };
}
const { x: px, y: py } = getPoint();
console.log(px, py); // 10 20
const { y: onlyY } = getPoint(); // 只取需要的属性
console.log(onlyY); // 20

console.log('\n========== 3. 函数参数的定义 ==========');

// 解构赋值可以方便地将一组参数与变量名对应起来
function f([z1, z2, z3]: [number, number, number]): void {
  console.log(z1, z2, z3);
}
f([1, 2, 3]); // 1 2 3

// 参数是一组有次序的值时，用数组解构；参数是一组无次序的值时，用对象解构
function userInfo({ id, name, age }: { id: number; name: string; age: number }): string {
  return `#${id} ${name}（${age} 岁）`;
}
console.log(userInfo({ id: 1, name: '张三', age: 20 }));

console.log('\n========== 4. 提取 JSON 数据 ==========');

const jsonData: string = '{"id": 42, "status": "OK", "result": ["a", "b"]}';
const data: { id: number; status: string; result: string[] } = JSON.parse(jsonData);
const { id, status, result } = data;
console.log(id, status, result); // 42 OK [ 'a', 'b' ]

console.log('\n========== 5. 遍历 Map 结构 ==========');

const map = new Map<string, string>();
map.set('first', 'hello');
map.set('second', 'world');

// 任何部署了 Iterator 接口的对象，都可以用 for...of 循环遍历。
// Map 结构原生支持 Iterator 接口，配合数组的解构赋值，获取键名和键值非常方便：
for (const [key, value] of map) {
  console.log(`${key} = ${value}`); // first = hello / second = world
}
// 只想获取键名或键值，可以这样：
for (const [key] of map) {
  console.log('键名：', key);
}
for (const [, value] of map) {
  console.log('键值：', value);
}

console.log('\n========== 6. 输入模块的指定方法 ==========');

// 加载模块时，往往需要指定输入哪些方法，解构赋值的写法一清二楚：
// ES5 写法：
//   const { SourceMapConsumer, SourceNode } = require('source-map');
// ES6/TS 写法（详见第 22 章）：
//   import { SourceMapConsumer, SourceNode } from 'source-map';
// 本 demo 目录中的所有文件用到的 export {} / import 正是模块语法的体现

console.log('\n========== 7. 业务场景：拆分支付订单金额 ==========');

// 需求：支付成功后要把一笔订单金额拆成"本金、手续费、第三方分账"三部分入账，
// 财务接口返回一个元组；同时在回调里要从 JSON 报文中解出交易流水号做幂等校验。

type SplitResult = [principal: number, fee: number, share: number]; // 三部分（分）

function splitOrderAmount(amount: number, feeRate: number): SplitResult {
  const fee: number = Math.trunc(amount * feeRate); // 手续费向下取整（分）
  const share: number = Math.trunc((amount - fee) * 0.1); // 第三方分 10%
  return [amount - fee - share, fee, share];
}

// 一行拆出三个入账科目：
const [principal, fee, share] = splitOrderAmount(9900, 0.006);
console.log('本金 / 手续费 / 分账（分）：', principal, fee, share); // 8811 59 530

// 支付回调：解构 JSON 报文里的关键字段（配合第 4 节的"提取 JSON 数据"）
const callbackBody: string = '{"out_trade_no":"PAY-20260824-0007","trade_state":"SUCCESS","buyer":{"nick":"小明"}}';
const payment: {
  out_trade_no: string;
  trade_state: string;
  buyer: { nick: string };
} = JSON.parse(callbackBody);

// 重命名 + 嵌套解构：后端下划线字段 -> 前端驼峰变量，一步到位
const {
  out_trade_no: tradeNo,
  trade_state: state,
  buyer: { nick: buyerNick },
} = payment;
console.log(`流水 ${tradeNo} 状态 ${state}，买家 ${buyerNick}`);
// 流水 PAY-20260824-0007 状态 SUCCESS，买家 小明

// 幂等校验：同一流水号只入账一次（用 Map 记录，配合第 5 节的遍历输出）
const settled = new Map<string, boolean>();
function settleOnce(no: string): string {
  if (settled.has(no)) {
    return `流水 ${no} 已入账过，跳过（幂等保护）`;
  }
  settled.set(no, true);
  return `流水 ${no} 首次入账成功`;
}
console.log(settleOnce(tradeNo)); // 首次入账
console.log(settleOnce(tradeNo)); // 幂等保护

export {};
