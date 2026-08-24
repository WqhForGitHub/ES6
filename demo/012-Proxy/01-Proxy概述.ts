/**
 * 《ES6 标准入门（第三版）》第 12 章：Proxy
 * Demo 01：Proxy 概述
 *
 * Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改，
 * 属于一种"元编程"（meta programming），即对编程语言进行编程。
 *
 * Proxy 可以理解成在目标对象前架设一层"拦截"，外界对该对象的访问，
 * 都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。
 *
 * 运行：node 01-Proxy概述.ts
 */

console.log('========== 1. 基本用法 ==========');

const target: Record<string, number> = { a: 1, b: 2 };
const handler: ProxyHandler<Record<string, number>> = {
  get(t, key): unknown {
    console.log('  读取属性：', String(key));
    return t[key as string];
  },
  set(t, key, value): boolean {
    console.log('  写入属性：', String(key), '=', value);
    t[key as string] = value;
    return true;
  },
};

const proxy = new Proxy(target, handler);
console.log(proxy.a); // 触发 get 拦截
proxy.c = 3; // 触发 set 拦截
console.log('目标对象也被修改了：', target.c); // 3

// 要使得 Proxy 起作用，必须针对 Proxy 实例进行操作，而不是针对目标对象
console.log('直接访问目标对象不触发拦截：', target.a);

console.log('\n========== 2. get 拦截：读取不存在的属性报错 ==========');

const strict = new Proxy({ x: 1 }, {
  get(t: { x: number }, key: string | symbol): unknown {
    if (key in t) {
      return Reflect.get(t, key);
    }
    throw new ReferenceError(`Prop "${String(key)}" does not exist.`);
  },
});
console.log(strict.x); // 1
try {
  console.log((strict as Record<string, unknown>).y);
} catch (e) {
  console.log('拦截生效：', e instanceof ReferenceError); // true
}

console.log('\n========== 3. set 拦截：数据校验 ==========');

const validator: Record<string, number> = {};
const validated = new Proxy(validator, {
  set(t: Record<string, number>, key: string | symbol, value: number): boolean {
    if (key === 'age' && typeof value !== 'number') {
      throw new TypeError('年龄必须是数字');
    }
    if (key === 'age' && (value < 0 || value > 200)) {
      throw new RangeError('年龄必须在 0 ~ 200 之间');
    }
    t[key as string] = value;
    return true;
  },
});
validated.age = 18; // 正常写入
console.log(validated.age); // 18
try {
  validated.age = 300;
} catch (e) {
  console.log('校验生效：', e instanceof RangeError); // true
}

console.log('\n========== 4. Proxy 实例作为其他对象的原型 ==========');

// proxy 实例可以设置为对象的原型：对象上不存在的属性访问会"穿透"到代理上被拦截
const protoProxy = new Proxy({}, {
  get(t: object, key: string | symbol): unknown {
    void t;
    return `代理提供的 ${String(key)}`;
  },
});
const objOnProxy = Object.create(protoProxy) as Record<string, unknown>;
console.log(objOnProxy.anything); // 代理提供的 anything（访问沿原型链到达代理）
console.log('anything' in objOnProxy); // true（代理的目标是空对象，默认任何属性都"存在"）

export {};
