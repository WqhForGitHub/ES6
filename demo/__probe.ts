// 临时验证文件 v2（验证后删除）

// 1. ES5 构造函数模式（通过接口声明 new 签名）
interface PersonES5Instance {
  name: string;
  sayHello(): string;
}
interface PersonES5Ctor {
  new (name: string): PersonES5Instance;
  prototype: PersonES5Instance;
}
const PersonES5 = function (this: PersonES5Instance, name: string): void {
  this.name = name;
} as unknown as PersonES5Ctor;
PersonES5.prototype.sayHello = function (this: PersonES5Instance): string {
  return '你好，我是 ' + this.name;
};
const p = new PersonES5('张三');
console.log(p.sayHello());

// 2. instanceof 左侧为原始值（需 any）
class Even {
  static [Symbol.hasInstance](obj: number): boolean {
    return obj % 2 === 0;
  }
}
const two: any = 2;
console.log(two instanceof Even);

// 3. arguments（函数需声明形参）
function argsDemo(x: string, y?: string): void {
  console.log(Array.from(arguments).length, x, y);
}
argsDemo('a', 'b');

// 4. globalThis 取 var 声明（模块内 var 不会挂到 globalThis，运行时为 undefined）
var globalVar = 'g';
console.log((globalThis as Record<string, unknown>).globalVar);

// 5. Proxy 各拦截器
const target42: Record<string, number> = { a: 1 };
const validated = new Proxy(target42, {
  set(target: Record<string, number>, key: string | symbol, value: number): boolean {
    if (typeof value !== 'number') throw new TypeError('必须是数字');
    target[key as string] = value;
    return true;
  },
  has(target: Record<string, number>, key: string | symbol): boolean {
    if (String(key)[0] === '_') return false;
    return key in target;
  },
  ownKeys(target: Record<string, number>): ArrayLike<string | symbol> {
    return Reflect.ownKeys(target).filter((k) => String(k)[0] !== '_');
  },
  deleteProperty(target: Record<string, number>, key: string | symbol): boolean {
    console.log('删除属性', String(key));
    return Reflect.deleteProperty(target, key);
  },
});
validated.b = 2;
console.log('b' in validated, Object.keys(validated));

class Service {
  constructor(public readonly name: string) {}
  hello(): string {
    return `hello ${this.name}`;
  }
}
const ServiceProxy = new Proxy(Service, {
  construct(target: typeof Service, args: ConstructorParameters<typeof Service>): Service {
    console.log('construct 拦截');
    return new target(...args);
  },
});
console.log(new ServiceProxy('es6').hello());

// 6. 类实现 Iterable
class Range implements Iterable<number> {
  constructor(
    private readonly start: number,
    private readonly end: number,
  ) {}
  [Symbol.iterator](): Iterator<number> {
    let cursor = this.start;
    const end = this.end;
    return {
      next(): IteratorResult<number> {
        if (cursor <= end) {
          const value = cursor;
          cursor += 1;
          return { value, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}
console.log([...new Range(1, 5)]);

// 7. Symbol.replace / Symbol.split 自定义
const customReplace = {
  [Symbol.replace](str: string, replacement: string): string {
    return str.split('es6').join(replacement);
  },
};
console.log('hello es6 world'.replace(customReplace as unknown as string, 'ES2015'));

// 8. Promise 组合
async function promiseDemo(): Promise<void> {
  const results = await Promise.all([Promise.resolve(1), Promise.resolve(2)]);
  console.log(results);
  const timed = await Promise.race([
    new Promise<string>((resolve) => setTimeout(() => resolve('slow'), 50)),
    new Promise<string>((resolve) => setTimeout(() => resolve('fast'), 10)),
  ]);
  console.log(timed);
}
void promiseDemo();

// 9. Set 运算
const setA = new Set([1, 2, 3]);
const setB = new Set([2, 3, 4]);
console.log(new Set([...setA, ...setB]), new Set([...setA].filter((x) => setB.has(x))));

// 10. WeakSet
const ws = new WeakSet<object>();
const objRef = {};
ws.add(objRef);
console.log(ws.has(objRef));

// 11. 闭包引用后声明的变量（绕过 TS 静态检查，运行时演示 TDZ / var 提升）
function tdzClosure(): void {
  try {
    const read = (): string => value;
    console.log(read()); // ReferenceError
    let value = 'inner';
  } catch (e) {
    console.log('caught:', e instanceof ReferenceError);
  }
}
tdzClosure();

function typeofClosure(): void {
  try {
    const typeOfVar = (): string => typeof undeclaredLet;
    console.log(typeOfVar()); // ReferenceError
    let undeclaredLet = 1;
  } catch (e) {
    console.log('caught:', e instanceof ReferenceError);
  }
}
typeofClosure();

const outerTmp = new Date();
function es5BugClosure(): void {
  const read = (): string => tmp;
  console.log('tmp =', read()); // undefined
  if (false) {
    var tmp = 'hello world';
  }
}
es5BugClosure();
console.log(outerTmp instanceof Date);

// 12. var 提升的重构写法
var hoistedVar2: number | undefined;
console.log(hoistedVar2);
hoistedVar2 = 1;

// 13. Record 索引 symbol 修复
const tobj: Record<string, unknown> = {};
const pkey: string | symbol = 'k';
tobj[pkey as string] = 1;
console.log(tobj);

export {};
