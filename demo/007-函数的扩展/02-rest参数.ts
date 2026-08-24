/**
 * 《ES6 标准入门（第三版）》第 7 章：函数的扩展
 * Demo 02：rest 参数
 *
 * ES6 引入 rest 参数（形式为"...变量名"），用于获取函数的多余参数，
 * 这样就不需要使用 arguments 对象了。rest 参数搭配的变量是一个数组，
 * 该变量将多余的参数放入数组中。
 *
 * 运行：node 02-rest参数.ts
 */

console.log('========== 1. 基本用法 ==========');

function add(...numbers: number[]): number {
  // rest 参数的变量是一个真正的数组，可以使用数组的一切方法
  return numbers.reduce((sum, n) => sum + n, 0);
}
console.log(add(1, 2, 3)); // 6
console.log(add(4, 5, 6, 7)); // 22
// 不传参数也是合法的（得到空数组）
console.log(add()); // 0

// rest 参数可以与普通参数混用，但必须是最后一个参数
function pushAll<T>(array: T[], ...items: T[]): T[] {
  items.forEach((item) => array.push(item));
  return array;
}
console.log(pushAll<number>([], 1, 2, 3)); // [1, 2, 3]

// rest 参数之后不能再有其他参数
// function f(a, ...rest, b) {} // SyntaxError: Rest parameter must be last formal parameter

console.log('\n========== 2. rest 参数与 arguments 对象的对比 ==========');

// ES5 中获取"多余参数"要靠 arguments（类数组对象，没有数组的方法）
function es5Style(a: string, b?: string): void {
  void a; void b;
  // arguments 包含"实际传入"的所有参数（包括已声明的 a / b）
  console.log('arguments 数量：', arguments.length);
  // arguments 不是数组：没有 map / reduce / forEach，必须先转换
  console.log('转为真正的数组：', Array.from(arguments));
}
es5Style('a', 'b', 'c', 'd'); // 4 [ 'a', 'b', 'c', 'd' ]

// rest 参数的写法：参数本身就是数组，还享受 TS 的类型检查
function restStyle(...args: string[]): string[] {
  return args.filter((s) => s.length > 1); // 直接使用数组方法
}
console.log(restStyle('a', 'ab', 'abc')); // [ 'ab', 'abc' ]

console.log('\n========== 3. length 属性不含 rest 参数 ==========');

function restLength1(...rest: string[]): void { void rest; }
function restLength2(a: string, ...rest: string[]): void { void a; void rest; }
console.log(restLength1.length, restLength2.length); // 0 1（rest 参数不计入）

console.log('\n========== 4. 实战：可变参数的工具函数 ==========');

// 格式化函数：占位符 {0} {1} ... 依次替换
function format(template: string, ...values: unknown[]): string {
  return template.replace(/\{(\d+)\}/g, (_: string, index: string): string =>
    String(values[Number(index)] ?? ''),
  );
}
console.log(format('你好，{0}！你今年 {1} 岁了', '张三', 20)); // 你好，张三！你今年 20 岁了

// 求最大值：Math.max 本身就是"可变参数"函数，配合扩展运算符可以作用于数组
const nums = [3, 1, 4, 1, 5, 9, 2, 6];
console.log(Math.max(...nums)); // 9

// 合并多个数组（rest 接收 + 扩展运算符展开）
function concatAll<T>(...arrays: T[][]): T[] {
  return ([] as T[]).concat(...arrays);
}
console.log(concatAll([1, 2], [3], [4, 5])); // [1, 2, 3, 4, 5]

export {};
