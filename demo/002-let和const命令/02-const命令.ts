/**
 * 《ES6 标准入门（第三版）》第 2 章：let 和 const 命令
 * Demo 02：const 命令
 *
 * const 声明一个只读的常量。一旦声明，常量的值就不能改变，
 * 这意味着 const 一旦声明变量，就必须立即初始化，不能留到以后赋值。
 *
 * 注意：const 实际保证的并不是变量的值不得改动，而是变量指向的
 * 那个内存地址不得改动。对于简单类型（数值、字符串、布尔值），
 * 值就保存在变量指向的内存地址中，因此等同于常量；但对于复合类型
 * （对象、数组），变量指向的是内存地址，保存的只是一个指针，
 * const 只能保证这个指针是固定的，至于它指向的数据结构是不是可变，
 * 完全不受控制。
 *
 * 运行：node 02-const命令.ts
 */

console.log('========== 1. 基本用法 ==========');

const PI: number = 3.1415926;
console.log('PI =', PI);

// const foo; // 报错：Missing initializer in const declaration（必须立即初始化）
// PI = 3.14; // 报错：Assignment to constant variable（常量不可重新赋值）

// const 的作用域与 let 命令相同：只在声明所在的块级作用域内有效
{
  const blockScoped: string = '只在块内有效';
  console.log(blockScoped);
}
// console.log(blockScoped); // 报错：blockScoped is not defined

// const 声明的常量同样存在暂时性死区，只能在声明之后使用
// console.log(deadZone); // 报错：Cannot access 'deadZone' before initialization
// const deadZone = 1;

// const 声明的常量也与 let 一样不可重复声明
// var message = 'Hello';
// const message = 'World'; // 报错：message has already been declared

console.log('\n========== 2. 本质：内存地址不可变，内容可变 ==========');

const person: { name: string; age: number } = { name: '张三', age: 20 };

// person = { name: '李四', age: 30 }; // 报错：变量 person 的指针不可变
person.age = 30; // 完全合法：改变的是对象的内容，指针没变
console.log('修改对象内容后：', person); // { name: '张三', age: 30 }

const arr: number[] = [];
arr.push(1); // 合法
arr.length = 0; // 合法
console.log('数组清空后：', arr); // []

console.log('\n========== 3. 冻结对象：Object.freeze ==========');

// 想让对象真正不可变，可以用 Object.freeze 冻结（TS 中类型也会变为只读）
const frozenPerson = Object.freeze<{ name: string; age: number }>({ name: '张三', age: 20 });
console.log('冻结对象：', frozenPerson);
// frozenPerson.age = 30; // 运行时静默失败（严格模式下抛 TypeError），TS 也直接报错

// freeze 只冻结一层（浅冻结），想彻底冻结需要递归处理
function deepFreeze(obj: Record<string, unknown>): void {
  const propNames: string[] = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const value: unknown = obj[name];
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value as Record<string, unknown>);
    }
  }
  Object.freeze(obj);
}

const company: Record<string, unknown> = {
  name: 'Acme',
  address: { city: '北京' },
};
deepFreeze(company);
// company.address.city = '上海'; // 严格模式下抛 TypeError：city 也被冻结了
console.log('彻底冻结后的嵌套对象：', company);

console.log('\n========== 4. ES6 声明变量的六种方法 ==========');

// ES5 只有两种：var 命令、function 命令
// ES6 添加了：let、const、import 命令和 class 命令，共六种
// 本 demo 文件末尾的 export {} 正是 import/export 模块语法（详见第 22 章）
class Six {} // class 声明
console.log('class 声明的类型：', typeof Six); // function

console.log('\n========== 5. 业务场景：环境配置常量与"只读"购物车 ==========');

// 场景一：项目配置用 const + as const 声明，防止在代码中被意外改写
// （真实事故：有人手滑把生产库地址改成本地，全站数据写到了测试库）
const API_CONFIG = {
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  env: 'production',
} as const; // TS 的 as const：所有属性变成只读的字面量类型
console.log('当前环境：', API_CONFIG.env, '，超时：', API_CONFIG.timeout, 'ms');
// API_CONFIG.env = 'dev'; // 报错：Cannot assign to 'env' because it is a read-only property

// 场景二：const 声明的购物车数组仍可以增删商品（指针不变，内容可变）
const cart: Array<{ sku: string; price: number }> = [];
cart.push({ sku: 'KB-01', price: 35900 });
cart.push({ sku: 'MS-02', price: 12900 });
console.log('购物车商品数：', cart.length); // 2
// cart = []; // 报错：不能给 const 重新赋值（但清空内容要用 cart.length = 0）

// 场景三：真正不可变的场合（审计日志、税率表）要用 Object.freeze 冻结
const TAX_RATE = Object.freeze({ standard: 0.13, reduced: 0.09 });
console.log('税率配置（已冻结，运行时也无法修改）：', TAX_RATE);

export {};
