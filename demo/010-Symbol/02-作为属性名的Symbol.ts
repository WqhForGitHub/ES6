/**
 * 《ES6 标准入门（第三版）》第 10 章：Symbol
 * Demo 02：作为属性名的 Symbol -- 消除魔法字符串
 *
 * Symbol 值作为属性名的最大好处，就是其他代码不能轻易引用或改写
 * 同名的属性（保证不会出现同名属性的覆盖 / 冲突）。
 * 常用来定义一组常量，保证这组常量的值都是彼此不相同的。
 *
 * 运行：node 02-作为属性名的Symbol.ts
 */

console.log('========== 1. 消除"魔法字符串" ==========');

// 魔法字符串：在代码之中多次出现、与代码形成强耦合的某一个具体的字符串或数值。
// 风格良好的代码，应该尽量消除魔法字符串，改由含义清晰的变量代替。
// 用 Symbol 定义常量，可以保证这三个值是不相等的。

const shapeType = {
  triangle: Symbol('triangle'),
  square: Symbol('square'),
} as const;

interface Shape {
  area(): number;
}

const shapes: Record<symbol, Shape> = {
  [shapeType.triangle]: { area: () => 3 },
  [shapeType.square]: { area: () => 4 },
};

function getArea(type: symbol): number {
  const shape: Shape | undefined = shapes[type];
  return shape ? shape.area() : 0;
}

console.log(getArea(shapeType.triangle)); // 3
console.log(getArea(shapeType.square)); // 4
console.log(getArea(Symbol('triangle'))); // 0（描述相同但值不同 -- 这正是 Symbol 的意义）

console.log('\n========== 2. 常量集合 ==========');

// 另一个例子：日志级别。用 Symbol 保证不会与其他模块的常量冲突
const logLevels = {
  DEBUG: Symbol('debug'),
  INFO: Symbol('info'),
  WARN: Symbol('warn'),
  ERROR: Symbol('error'),
} as const;

const levelNames: Record<symbol, string | undefined> = {
  [logLevels.DEBUG]: '调试',
  [logLevels.INFO]: '信息',
  [logLevels.WARN]: '警告',
  [logLevels.ERROR]: '错误',
};

function log(level: symbol, message: string): void {
  console.log(`[${levelNames[level] ?? '未知级别'}] ${message}`);
}

log(logLevels.INFO, '服务已启动'); // [信息] 服务已启动
log(logLevels.WARN, '磁盘空间不足'); // [警告] 磁盘空间不足
log(Symbol('info'), '描述相同但不是同一个值'); // [未知级别] ...

console.log('\n========== 3. 定义"内部使用"的方法 ==========');

// 为对象定义一些非私有的、但又希望只用于内部的方法：
// 外部代码即使拿到对象，也很难"碰巧"写出正确的 Symbol 键
const internalMethod = Symbol('internal');

interface Service {
  [internalMethod](): string;
  publicApi(): string;
}

const service: Service = {
  [internalMethod](): string {
    return '内部状态';
  },
  publicApi(): string {
    // 只在对象内部使用 Symbol 方法，实现类似"内部约定"的效果
    return `公开接口（内部调用结果：${this[internalMethod]()}）`;
  },
};

console.log(service.publicApi()); // 公开接口（内部调用结果：内部状态）
console.log('外部仍能发现 Symbol 键（不是真正的私有）：', Object.getOwnPropertySymbols(service).length); // 1

export {};
