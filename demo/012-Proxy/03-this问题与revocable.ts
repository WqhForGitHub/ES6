/**
 * 《ES6 标准入门（第三版）》第 12 章：Proxy
 * Demo 03：this 问题与可撤销的 Proxy
 *
 * 一、this 问题：
 * 在 Proxy 代理的情况下，目标对象内部的 this 关键字会指向 Proxy 代理。
 * 有些操作依赖 this 指向目标对象本身（例如以 this 为键的 WeakMap 私有数据、
 * 原生对象的内部槽），经代理调用时就会出错，需要在拦截器里把 this 绑回目标对象。
 *
 * 二、Proxy.revocable()：
 * 返回一个 { proxy, revoke } 对象。revoke() 执行后，再访问 proxy 的任何属性
 * 都会抛出 TypeError。适用于不允许直接接触目标对象、用完即收回代理权的场景。
 *
 * 运行：node 03-this问题与revocable.ts
 */

console.log('========== 1. this 问题：WeakMap 私有数据 ==========');

// 私有数据存放在 WeakMap 中，以 this 为键 —— 一旦 this 变成了 proxy，就查不到数据了
const privateNames = new WeakMap<object, string>();

class Person {
  constructor(name: string) {
    privateNames.set(this, name);
  }
  getName(): string {
    return privateNames.get(this) ?? '(查不到私有数据)';
  }
}

const person = new Person('张三');
const personProxy = new Proxy(person, {});
console.log('直接调用：', person.getName()); // 张三
console.log('经代理调用：', personProxy.getName()); // (查不到私有数据) —— this 指向了 proxy

console.log('\n========== 2. 解决办法：在 get 拦截器中绑定目标对象 ==========');

const boundProxy = new Proxy(person, {
  get(t: Person, key: string | symbol): unknown {
    const value = Reflect.get(t, key); // 从目标对象上取值
    // 取到函数时绑定到目标对象上，保证方法内部的 this 是目标对象而不是 proxy
    return typeof value === 'function' ? (value as (this: Person) => unknown).bind(t) : value;
  },
});
console.log('绑定后经代理调用：', boundProxy.getName()); // 张三

console.log('\n========== 3. this 问题：原生对象的内部槽 ==========');

// Date、Map、Set 等原生对象的方法都会检查 this 是否"真正的"该类型实例（内部槽），
// proxy 不是真正的 Date，因此直接调用会抛 TypeError
const date = new Date(2025, 0, 1);
const dateProxy = new Proxy(date, {});
try {
  console.log(dateProxy.getFullYear());
} catch (e) {
  console.log('原生方法报错：', e instanceof TypeError); // true
}

const fixedDateProxy = new Proxy(date, {
  get(t: Date, key: string | symbol): unknown {
    const value = Reflect.get(t, key);
    return typeof value === 'function' ? (value as (this: Date) => unknown).bind(t) : value;
  },
});
console.log('绑定后正常工作：', fixedDateProxy.getFullYear()); // 2025

console.log('\n========== 4. Proxy.revocable()：可撤销的代理 ==========');

const revocable = Proxy.revocable(
  { secret: 42 },
  {
    get(t: { secret: number }, key: string | symbol): unknown {
      return Reflect.get(t, key);
    },
  },
);
console.log('撤销前读取：', revocable.proxy.secret); // 42
revocable.revoke(); // 收回代理权，不允许再访问
try {
  console.log(revocable.proxy.secret);
} catch (e) {
  console.log('撤销后访问抛错：', e instanceof TypeError); // true
}

// 典型场景：把 proxy 交给第三方使用，用完立刻 revoke，防止对方继续读取内部数据
const oneShot = Proxy.revocable({ token: 'abc' }, {});
const borrowed = oneShot.proxy;
console.log('借出时读取：', borrowed.token); // abc
oneShot.revoke();
try {
  void borrowed.token;
} catch (e) {
  console.log('归还后无法读取：', e instanceof TypeError); // true
}

export {};
