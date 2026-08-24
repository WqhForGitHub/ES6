/**
 * 《ES6 标准入门（第三版）》第 12 章：Proxy
 * Demo 02：Proxy 实例的方法（拦截操作一览）
 *
 * Proxy 支持的拦截操作一共 13 种，与 Reflect 的 13 个静态方法一一对应（第 13 章）。
 * 本 demo 演示最常用的几种：get / set / has / deleteProperty / ownKeys / apply / construct。
 *
 * 运行：node 02-Proxy实例的方法.ts
 */

console.log('========== 1. get()：拦截属性读取 ==========');

// get(target, key, receiver)：第三个参数 receiver 表示原始操作所在的对象（继承场景有用）
// 经典应用：让数组支持负索引
function createArray<T>(elements: T[]): T[] {
  return new Proxy(elements, {
    get(target: T[], key: string | symbol, receiver: unknown): unknown {
      const index = typeof key === 'string' ? Number(key) : NaN;
      if (Number.isInteger(index) && index < 0) {
        return target[target.length + index]; // 负索引从末尾开始数
      }
      return Reflect.get(target, key, receiver);
    },
  });
}
const negativeArr = createArray([1, 2, 3, 4, 5]);
console.log(negativeArr[-1], negativeArr[-2], negativeArr[0]); // 5 4 1

// 另一个应用：读取 r/g/b 时自动把十六进制转成十进制
const colors = new Proxy({ r: 'ff', g: '80', b: '00' }, {
  get(t: Record<string, string>, key: string | symbol): unknown {
    if (typeof key === 'string' && key in t) {
      return parseInt(t[key], 16);
    }
    return undefined;
  },
});
console.log(colors.r, colors.g, colors.b); // 255 128 0

console.log('\n========== 2. set()：拦截属性写入 ==========');

// set(target, key, value, receiver)：必须返回一个布尔值，严格模式下返回 false 会抛错
const person: Record<string, unknown> = { name: '张三' };
const personProxy = new Proxy(person, {
  set(t: Record<string, unknown>, key: string | symbol, value: unknown): boolean {
    if (key === 'name' && typeof value !== 'string') {
      throw new TypeError('name 必须是字符串');
    }
    if (key === 'age' && typeof value !== 'number') {
      throw new TypeError('age 必须是数字');
    }
    t[key as string] = value;
    return true;
  },
});
personProxy.age = 20;
console.log(personProxy.age); // 20
try {
  personProxy.age = '二十';
} catch (e) {
  console.log('拦截成功：', e instanceof TypeError); // true
}

console.log('\n========== 3. has()：拦截 in 操作 ==========');

// 隐藏下划线开头的"私有"属性，使其不被 in 运算符发现
const withPrivate: Record<string, unknown> = { name: '公开', _secret: '秘密' };
const hidden = new Proxy(withPrivate, {
  has(t: Record<string, unknown>, key: string | symbol): boolean {
    if (typeof key === 'string' && key.startsWith('_')) {
      return false; // in 操作"看不见"下划线开头的属性
    }
    return key in t;
  },
});
console.log('name' in hidden); // true
console.log('_secret' in hidden); // false（被拦截）
console.log(hidden._secret); // 注意：has 拦截不影响直接读取（那需要 get 拦截）

console.log('\n========== 4. deleteProperty()：拦截 delete 操作 ==========');

const guarded: Record<string, unknown> = { keep: 1, drop: 2 };
const undeletable = new Proxy(guarded, {
  deleteProperty(t: Record<string, unknown>, key: string | symbol): boolean {
    if (key === 'keep') {
      throw new Error(`属性 ${String(key)} 不允许删除`);
    }
    return Reflect.deleteProperty(t, key);
  },
});
delete undeletable.drop;
console.log(undeletable.drop); // undefined（已被删除）
try {
  delete undeletable.keep;
} catch (e) {
  console.log('删除被拦截：', e instanceof Error); // true
}

console.log('\n========== 5. ownKeys()：拦截键的枚举 ==========');

// 拦截 Object.keys()、Object.getOwnPropertyNames()、JSON.stringify() 等操作
const withInternal: Record<string, unknown> = { a: 1, b: 2, _internal: 3 };
const filtered = new Proxy(withInternal, {
  ownKeys(t: Record<string, unknown>): ArrayLike<string | symbol> {
    return Reflect.ownKeys(t).filter((key) => !String(key).startsWith('_'));
  },
});
console.log(Object.keys(filtered)); // [ 'a', 'b' ]
console.log(Object.getOwnPropertyNames(filtered)); // [ 'a', 'b' ]
console.log(JSON.stringify(filtered)); // {"a":1,"b":2}

console.log('\n========== 6. apply()：拦截函数调用 ==========');

function sum(...nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0);
}
const doubled = new Proxy(sum, {
  apply(target: (...nums: number[]) => number, thisArg: unknown, args: unknown[]): unknown {
    return Reflect.apply(target, thisArg, args) * 2; // 把调用结果翻倍
  },
});
console.log(doubled(1, 2, 3)); // 12

console.log('\n========== 7. construct()：拦截 new 操作 ==========');

class Greeter {
  public readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
  hello(): string {
    return `Hello, ${this.name}`;
  }
}
const LoggingGreeter = new Proxy(Greeter, {
  construct(target: typeof Greeter, args: [string]): Greeter {
    console.log('  （正在构造 Greeter，参数：', args[0], '）');
    return new target(...args);
  },
});
console.log(new LoggingGreeter('ES6').hello());

export {};
