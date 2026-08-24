/**
 * 《ES6 标准入门（第三版）》第 13 章：Reflect
 * Demo 03：Reflect 与 Proxy 配合使用
 *
 * Proxy 的每个拦截操作内部，都可以调用 Reflect 对应的方法完成"默认行为"，
 * 只需在默认行为之外增加自己的逻辑——这正是两者 13 个方法一一对应的原因。
 *
 * 运行：node 03-与Proxy配合使用.ts
 */

console.log('========== 1. 拦截 + 转发默认行为 ==========');

const loggedTarget: Record<string, number> = { x: 1, y: 2 };

const logged = new Proxy(loggedTarget, {
  get(target: Record<string, number>, key: string | symbol, receiver: unknown): unknown {
    console.log(`  [log] get ${String(key)}`);
    return Reflect.get(target, key, receiver); // 转发默认行为
  },
  set(
    target: Record<string, number>,
    key: string | symbol,
    value: number,
    receiver: unknown,
  ): boolean {
    console.log(`  [log] set ${String(key)} = ${value}`);
    return Reflect.set(target, key, value, receiver);
  },
  has(target: Record<string, number>, key: string | symbol): boolean {
    console.log(`  [log] has ${String(key)}`);
    return Reflect.has(target, key);
  },
  deleteProperty(target: Record<string, number>, key: string | symbol): boolean {
    console.log(`  [log] delete ${String(key)}`);
    return Reflect.deleteProperty(target, key);
  },
});

console.log(logged.x); // 触发 get 拦截
logged.z = 3; // 触发 set 拦截
console.log('y' in logged); // 触发 has 拦截
delete logged.y; // 触发 deleteProperty 拦截
console.log('最终目标对象：', JSON.stringify(loggedTarget)); // {"x":1,"z":3}

console.log('\n========== 2. 观察者模式（本书经典示例） ==========');

const queuedObservers = new Set<() => void>();

function observe(fn: () => void): void {
  queuedObservers.add(fn);
}

function observable<T extends object>(obj: T): T {
  return new Proxy(obj, {
    set(...args): boolean {
      const result = Reflect.set(...args); // 1. 先完成默认的写入行为
      queuedObservers.forEach((observer) => observer()); // 2. 再通知所有观察者
      return result;
    },
  });
}

const person = observable({
  name: '张三',
  age: 20,
});

observe((): void => console.log('  观察者 A：person 的属性发生了变化'));
observe((): void => console.log(`  观察者 B：新的 age 是 ${person.age}`));

person.name = '李四'; // 写入动作自动触发两个观察者
person.age = 21;

console.log('\n========== 3. 简化的"数据 -> 视图"绑定示意 ==========');

// 利用 observe/observable 可以实现"数据变化自动更新视图"的模型（简化版）
const state = observable({ count: 0 });
observe((): void => console.log('  视图更新：当前计数 =', state.count));
state.count = 1;
state.count = 2;

export {};
