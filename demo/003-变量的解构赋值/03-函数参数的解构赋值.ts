/**
 * 《ES6 标准入门（第三版）》第 3 章：变量的解构赋值
 * Demo 03：函数参数的解构赋值
 *
 * 函数的参数也可以使用解构赋值。传入函数的实参会被解构成形参模式，
 * 通常结合默认值一起使用，是"配置对象"风格 API 的标准写法。
 *
 * 运行：node 03-函数参数的解构赋值.ts
 */

console.log('========== 1. 基本用法 ==========');

// 数组参数的解构
function add([x, y]: [number, number]): number {
  return x + y;
}
console.log(add([1, 2])); // 3
// add(1, 2); // 报错：实参应该是整个数组（或可遍历结构）

// 函数参数的解构也可以使用默认值
function sumOfPair([x, y]: [number, number?] = [1, 2]): number {
  return x + (y ?? 0);
}
console.log(sumOfPair()); // 1（参数整体为空时使用默认数组）
console.log(sumOfPair([5, 6])); // 11

// 嵌套数组的解构
const pairs: Array<[number, number]> = [
  [1, 2],
  [3, 4],
];
console.log(pairs.map(([a, b]) => a + b)); // [ 3, 7 ]

console.log('\n========== 2. 对象参数的解构（最常用） ==========');

// 书中经典例子：move 的参数是一个对象，通过对这个对象进行解构，
// 得到变量 x 和 y 的值；解构给 x、y 提供了默认值，同时给参数整体也提供了默认值 {}
function move({ x = 0, y = 0 }: { x?: number; y?: number } = {}): [number, number] {
  return [x, y];
}
console.log(move({ x: 3, y: 8 })); // [ 3, 8 ]
console.log(move({ x: 3 })); // [ 3, 0 ]
console.log(move({})); // [ 0, 0 ]（属性缺失触发属性默认值）
console.log(move()); // [ 0, 0 ]（参数缺失触发整体默认值 {}）

// 对比：只为参数整体提供默认值的情况（这是两种完全不同的写法！）
function moveAll({ x, y }: { x: number; y: number } = { x: 0, y: 0 }): Array<number | undefined> {
  return [x, y];
}
console.log(moveAll({ x: 3, y: 8 })); // [ 3, 8 ]
console.log(moveAll()); // [ 0, 0 ]
console.log(moveAll({} as { x: number; y: number })); // [ undefined, undefined ]
// 注意最后一个：传入空对象时，整体默认值不生效（参数不是 undefined），
// 而属性默认值又没有提供，所以 x、y 都是 undefined。
// TS 提示：TS 会直接提示"缺少属性"的调用错误（上面用 as 断言仅为了演示运行时行为）。

console.log('\n========== 3. undefined 会触发参数的默认值 ==========');

// 参数默认值只有在传 undefined 时才会生效，传 null 不会
function greet({ name = '无名氏' }: { name?: string | null }): string {
  return `你好，${name ?? '无名氏（null）'}`;
}
console.log(greet({})); // 你好，无名氏（undefined 触发解构默认值）
console.log(greet({ name: undefined })); // 你好，无名氏
console.log(greet({ name: null })); // 你好，无名氏（null）（null 不触发默认值）

console.log('\n========== 4. 实战：配置对象风格的函数 ==========');

interface FetchOptions {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  timeout?: number;
}

function request({ url, method = 'GET', headers = {}, timeout = 3000 }: FetchOptions): string {
  return `${method} ${url}（超时 ${timeout}ms，请求头 ${Object.keys(headers).length} 个）`;
}
console.log(request({ url: '/api/users' }));
// GET /api/users（超时 3000ms，请求头 0 个）
console.log(request({ url: '/api/users', method: 'POST', headers: { token: 'abc' }, timeout: 5000 }));
// POST /api/users（超时 5000ms，请求头 1 个）

console.log('\n========== 5. 业务场景：列表页搜索参数的默认值 ==========');

// 需求：商品列表页的搜索接口支持一堆可选参数（页码、每页条数、排序、价格区间），
// 页面上用户往往只改其中一两个，其余都期望有合理的默认值。
// "对象参数解构 + 默认值"正是这类 API 的标准写法：

interface GoodsQuery {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'price' | 'sales' | 'created';
  priceRange?: [min: number, max: number]; // 元组：[最低价, 最高价]（分）
}

function buildGoodsUrl({
  keyword = '',
  page = 1,
  pageSize = 20,
  sortBy = 'sales',
  priceRange = [0, Number.MAX_SAFE_INTEGER],
}: GoodsQuery = {}): string {
  const [minPrice, maxPrice] = priceRange; // 参数里嵌套的元组同样可以解构
  const params: string[] = [
    `page=${page}`,
    `pageSize=${pageSize}`,
    `sort=${sortBy}`,
    `minPrice=${minPrice}`,
    `maxPrice=${maxPrice}`,
  ];
  if (keyword) {
    params.unshift(`keyword=${encodeURIComponent(keyword)}`); // 搜索词放最前面
  }
  return `/api/goods?${params.join('&')}`;
}

console.log(buildGoodsUrl());
// /api/goods?page=1&pageSize=20&sort=sales&minPrice=0&maxPrice=9007199254740991
console.log(buildGoodsUrl({ keyword: '蓝牙耳机', sortBy: 'price' }));
// /api/goods?keyword=%E8%93%9D%E7%89%99%E8%80%B3%E6%9C%BA&page=1&pageSize=20&sort=price&...
console.log(buildGoodsUrl({ page: 3, pageSize: 10, priceRange: [9900, 59900] }));
// /api/goods?page=3&pageSize=10&sort=sales&minPrice=9900&maxPrice=59900

// 好处：调用方只传关心的字段；新增可选参数不会破坏旧调用（比位置参数健壮得多）

export {};
