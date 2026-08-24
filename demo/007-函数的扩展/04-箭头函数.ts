/**
 * 《ES6 标准入门（第三版）》第 7 章：函数的扩展
 * Demo 04：箭头函数
 *
 * ES6 允许使用"箭头"（=>）定义函数。箭头函数有几个使用注意点：
 *   1. 函数体内的 this 对象是"定义时所在的对象"，而不是使用时所在的对象；
 *   2. 不可以当作构造函数，也就是说，不可以使用 new 命令；
 *   3. 不可以使用 arguments 对象，该对象在函数体内不存在（可用 rest 参数代替）；
 *   4. 不可以使用 yield 命令，因此箭头函数不能用作 Generator 函数。
 *
 * 运行：node 04-箭头函数.ts
 */

console.log('========== 1. 基本语法 ==========');

// 完整写法
const sum = (a: number, b: number): number => a + b;
console.log(sum(1, 2)); // 3

// 表达式体：自动返回表达式的值
const isEven = (n: number): boolean => n % 2 === 0;
console.log(isEven(4)); // true

// 代码块体：需要显式 return
const makeGreeting = (name: string): string => {
  const greeting = `你好，${name}`;
  return greeting;
};
console.log(makeGreeting('ES6')); // 你好，ES6

// 返回对象字面量时，必须给对象加上圆括号（否则大括号会被解析为代码块）
const getPerson = (): { name: string; age: number } => ({ name: '张三', age: 20 });
console.log(getPerson()); // { name: '张三', age: 20 }

// 箭头函数与变量解构结合（参数直接解构）
const fullName = ({ first, last }: { first: string; last: string }): string =>
  `${last}${first}`;
console.log(fullName({ first: '三', last: '张' })); // 张三

console.log('\n========== 2. this：词法作用域（最大价值所在） ==========');

class Greeter2 {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  delayedGreetArrow(): void {
    setTimeout((): void => {
      // 箭头函数没有自己的 this，这里的 this 沿用"定义时"外层方法的 this（实例）
      console.log('箭头函数中的 this 是实例：', this instanceof Greeter2, this.name);
    }, 10);
  }

  delayedGreetFunction(): void {
    setTimeout(function (this: any): void {
      // 普通函数的 this 在"运行时"才确定（取决于调用方式），这里丢失了实例
      console.log('普通函数中的 this 是实例：', this instanceof Greeter2);
    }, 10);
  }
}

const greeter = new Greeter2('ES6');
greeter.delayedGreetFunction(); // false
greeter.delayedGreetArrow(); // true ES6（注意：两行输出是定时器异步打印的）

// ES5 时代的变通写法（保存 this）已经不再需要：
//   const that = this;
//   setTimeout(function () { console.log(that.name); }, 10);

console.log('\n========== 3. 没有 arguments 对象 ==========');

function outer(a: string, b: string): void {
  // 普通函数里有 arguments
  console.log('普通函数的 arguments：', arguments.length); // 2

  // 箭头函数里没有自己的 arguments；
  // 在箭头函数里写 arguments，实际引用的是"外层函数"的 arguments
  const arrowUsesOuterArguments = (): number => arguments.length;
  console.log('箭头函数引用的 arguments：', arrowUsesOuterArguments()); // 2（外层的）
}
outer('a', 'b');

// 需要"多余参数"时，用 rest 参数代替：
const variadic = (...args: string[]): number => args.length;
console.log('rest 参数代替 arguments：', variadic('a', 'b', 'c')); // 3

console.log('\n========== 4. 不能作为构造函数 ==========');

const F = (): void => {};

// 箭头函数没有 prototype 属性
console.log('prototype 属性：', (F as unknown as { prototype?: unknown }).prototype); // undefined

// 不能使用 new 命令（运行时报 TypeError；TS 层面用断言绕过检查）
try {
  const broken = new (F as unknown as new () => void)();
  void broken;
} catch (e) {
  console.log('箭头函数不能 new：', e instanceof TypeError); // true
}

// 也不能使用 call / apply / bind 改变 this 的指向
//（bind 之后依然取定义时的 this，不会有任何效果）

console.log('\n========== 5. 适用与不适用的场合 ==========');

// 适合：简短的回调（map / filter / sort / setTimeout 等）
const numbers = [5, 2, 8, 1];
console.log(numbers.map((n) => n * 2)); // [10, 4, 16, 2]
console.log(numbers.sort((a, b) => a - b)); // [1, 2, 5, 8]

// 不适合一：定义对象的方法（this 不会指向对象本身）
const counter = {
  count: 0,
  // 这个方法里的 this 是定义时外层的 this（模块 this，而不是 counter）
  badIncrement: (): void => {
    // this.count += 1; // 这里拿不到 counter.count
  },
  goodIncrement(): void {
    this.count += 1; // 普通函数方法：this 指向调用者 counter
  },
};
counter.goodIncrement();
counter.goodIncrement();
console.log(counter.count); // 2

// 不适合二：需要动态 this 的场合（如事件回调绑定 DOM 元素、原型方法等）

export {};
