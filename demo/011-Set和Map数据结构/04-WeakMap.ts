/**
 * 《ES6 标准入门（第三版）》第 11 章：Set 和 Map 数据结构
 * Demo 04：WeakMap
 *
 * WeakMap 结构与 Map 结构类似，也是用于生成键值对的集合。区别在于：
 *   1. WeakMap 只接受对象作为键名（null 除外），不接受其他类型的值；
 *   2. WeakMap 的键名所指向的对象，不计入垃圾回收机制（弱引用）。
 *
 * WeakMap 与 Map 在 API 上的区别：没有遍历操作，即没有 keys / values / entries /
 * forEach / size，也没有 clear，只有 get / set / has / delete 四个方法可用。
 *
 * 运行：node 04-WeakMap.ts
 */

console.log('========== 1. 基本用法 ==========');

const wm = new WeakMap<object, string>();
const key1 = {};
const key2 = {};

// set / get / has / delete
wm.set(key1, '值1');
console.log(wm.get(key1), wm.has(key1), wm.get(key2)); // 值1 true undefined
console.log(wm.delete(key1), wm.has(key1)); // true false

// 键必须是对象，否则运行时报错
try {
  wm.set(42 as unknown as object, 'x'); // TypeError: Invalid value used as weak map key
} catch (e) {
  console.log('非对象键被拒绝：', e instanceof TypeError); // true
}

// WeakMap 没有 size 属性，也没有遍历方法
console.log('size：', (wm as unknown as Record<string, unknown>).size); // undefined
// wm.forEach; // undefined（不存在该方法）
// for (const [k, v] of wm) {} // TypeError: wm is not iterable

console.log('\n========== 2. 典型用途：实现私有属性 ==========');

// 将私有数据放在 WeakMap 中，以实例（this）为键：
//   - 外部无法枚举、无法直接访问这些数据（真正意义上的"隐藏"）；
//   - 实例销毁后记录自动被回收，不会造成内存泄漏
const privateData = new WeakMap<object, { hp: number; mp: number }>();

class Character {
  constructor(hp: number, mp: number) {
    privateData.set(this, { hp, mp });
  }

  get status(): string {
    const data = privateData.get(this);
    return `HP ${data?.hp ?? 0} / MP ${data?.mp ?? 0}`;
  }

  castSpell(cost: number): string {
    const data = privateData.get(this);
    if (!data) {
      return '没有数据';
    }
    if (data.mp < cost) {
      return '法力不足';
    }
    data.mp -= cost;
    return `施法成功，剩余 MP ${data.mp}`;
  }
}

const hero = new Character(100, 30);
console.log(hero.status); // HP 100 / MP 30
console.log(hero.castSpell(10)); // 施法成功，剩余 MP 20
console.log(hero.castSpell(100)); // 法力不足
console.log('hp 在实例上不可见：', (hero as unknown as Record<string, unknown>).hp); // undefined

console.log('\n========== 3. 典型用途：为对象附加元数据 ==========');

// 例如：记录 DOM 节点上绑定的事件监听器（这里用普通对象模拟节点）。
// 节点从文档移除后无需手动清理记录 -- WeakMap 不会阻止节点被回收
const listenerBookkeeping = new WeakMap<object, string[]>();

function addListener(node: object, type: string): void {
  const list = listenerBookkeeping.get(node) ?? [];
  list.push(type);
  listenerBookkeeping.set(node, list);
}

const btn = {};
addListener(btn, 'click');
addListener(btn, 'focus');
console.log('btn 上的监听记录：', listenerBookkeeping.get(btn)); // ['click', 'focus']

// 如果这里用的是 Map，只要 Map 还在，btn 就永远不会被回收（内存泄漏的根源）

export {};
