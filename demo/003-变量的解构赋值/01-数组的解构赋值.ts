/**
 * 《ES6 标准入门（第三版）》第 3 章：变量的解构赋值
 * Demo 01：数组的解构赋值
 *
 * ES6 允许按照一定模式，从数组和对象中提取值，对变量进行赋值，
 * 这被称为解构（Destructuring）。本质上，这种写法属于"模式匹配"，
 * 只要等号两边的模式相同，左边的变量就会被赋予对应的值。
 *
 * 运行：node 01-数组的解构赋值.ts
 */

console.log('========== 1. 基本用法 ==========');

const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1 2 3

// 可以从数组中提取值，按照对应位置对变量赋值（本质是"模式匹配"）
const [foo, [[bar], baz]] = [1, [[2], 3]];
console.log(foo, bar, baz); // 1 2 3

// "不完全解构"：左边的模式只匹配一部分右边的数组，依然可以成功
const [x, y] = [1, 2, 3];
console.log(x, y); // 1 2

// 解构不成功：变量的值为 undefined（对应位置没有值）
// （右边声明为数组类型而不是数组字面量：字面量会按"元组"推断出长度 1，第二个位置就报错了）
const partial: string[] = ['a'];
const [head, tail] = partial;
console.log(head, tail); // 'a' undefined
// TS 提示：运行时 tail 是 undefined；类型上它是 string，
// 若希望 TS 也提示这种"可能不存在"，可开启编译选项 noUncheckedIndexedAccess

// 等号右边必须是可遍历的结构（或转为对象后有 Iterator 接口），否则报错：
// let [bad] = 1;            // TypeError: 1 is not iterable
// let [bad] = false;        // TypeError
// let [bad] = NaN;          // TypeError
// let [bad] = undefined;    // TypeError
// let [bad] = null;         // TypeError
// 只要某种数据结构具有 Iterator 接口，都可以采用数组形式解构（Set 也可以）
const [s1, s2] = new Set(['a', 'b']);
console.log(s1, s2); // a b

console.log('\n========== 2. 默认值 ==========');

// 解构赋值允许指定默认值，只有当数组成员严格等于 undefined 时，默认值才会生效
const [d1 = 1] = []; // d1 = 1
const [d2 = 1] = [undefined]; // d2 = 1（undefined 触发默认值）
const [d3 = 1] = [null]; // d3 = null（null 不严格等于 undefined，默认值不生效）
console.log(d1, d2, d3); // 1 1 null

// 默认值可以引用解构赋值的其他变量，但该变量必须已经声明
const [e1 = 1, e2 = e1] = []; // e1 = 1, e2 = e1 = 1
console.log(e1, e2); // 1 1

// 默认值是"惰性求值"的：只有用到时才会求值（函数不会白白执行）
function lazy(): number {
  console.log('（惰性求值：默认值函数被执行了）');
  return 999;
}
const [f1 = lazy()] = []; // lazy() 执行
const [f2 = lazy()] = [2]; // lazy() 不执行（默认值未用到）
console.log(f1, f2); // 999 2

console.log('\n========== 3. 剩余（rest）模式 ==========');

// rest 模式收集剩余的成员，注意它必须放在最后一位
const [head2, ...tail2] = [1, 2, 3, 4];
console.log(head2, tail2); // 1 [ 2, 3, 4 ]

// const [bad1, ...bad2, bad3] = [1, 2, 3]; // 报错：rest 元素必须是最后一个元素
// rest 模式解构空数组会得到空数组（而不是 undefined）
const [only, ...empty] = ['a'];
console.log(only, empty); // 'a' []

console.log('\n========== 4. 解构赋值的写法本质：模式 vs 变量 ==========');

// 等号左边不是单纯的变量，而是"模式"。下面代码中，第一个位置是模式 p，
// 真正被赋值的变量是 x：
const { 0: first, 1: second, length } = ['a', 'b', 'c'];
console.log(first, second, length); // a b 3（数组本质也是对象，键是索引）

console.log('\n========== 5. 业务场景：分页接口的数据解包 ==========');

// 需求：后端约定的列表接口返回 [数据数组, 总条数] 这种元组结构，
// 前端拿到响应后要把"列表"渲染到表格、"总数"渲染到分页器。
// 用数组解构一行就把两份数据拆开，比 resp.data[0]、resp.data[1] 可读得多：

interface OrderRow {
  id: string;
  amount: number; // 分
}

interface PageResponse<T> {
  data: [T[], number]; // [列表, 总条数]
  msg: string;
}

const orderPage: PageResponse<OrderRow> = {
  data: [
    [
      { id: 'SO-1001', amount: 9900 },
      { id: 'SO-1002', amount: 35900 },
      { id: 'SO-1003', amount: 1200 },
    ],
    128, // 总条数（当前页只返回 3 条）
  ],
  msg: 'ok',
};

// 一行解包：列表给表格，总数给分页器
const [orders, total] = orderPage.data;
console.log('当前页订单数：', orders.length); // 3
console.log('总条数（分页器用）：', total); // 128

// 配合"跳位解构 + 默认值"取首尾行（表格首行高亮、末行合计常用）：
const [firstOrder, , lastOrder] = orders;
console.log('首行 / 末行：', firstOrder.id, '/', lastOrder.id); // SO-1001 / SO-1003

// 再配合 rest 模式 + reduce 计算本页合计金额：
const [, ...restOrders] = orders; // 去掉第一行，剩余的参与合计
const restTotal: number = restOrders.reduce((sum, { amount }) => sum + amount, 0);
console.log('除首行外的合计（分）：', restTotal); // 37100

export {};
