/**
 * 《ES6 标准入门（第三版）》第 12 章：Proxy
 * Demo 04：Proxy 应用示例
 *
 * 综合运用 get / set 等拦截器，实现几个常见的工程化需求：
 *   1. 数据校验器（createValidator）
 *   2. 只读视图（readOnlyView）
 *   3. 访问审计日志（withAudit）
 *   4. Web Service 客户端（createWebService）
 *
 * 运行：node 04-应用示例.ts
 */

console.log('========== 1. 数据校验器 createValidator ==========');

interface Rule {
  test(value: unknown): boolean;
  message: string;
}

function createValidator<T extends object>(target: T, rules: Record<string, Rule>): T {
  return new Proxy(target, {
    set(t: T, key: string | symbol, value: unknown): boolean {
      if (typeof key === 'string') {
        const rule = rules[key];
        if (rule && !rule.test(value)) {
          throw new TypeError(
            `属性 ${key} 校验失败：${rule.message}（实际收到：${JSON.stringify(value)}）`,
          );
        }
      }
      return Reflect.set(t, key, value);
    },
  });
}

interface User {
  name: string;
  age: number;
  email: string;
}

const user = createValidator<User>({} as User, {
  name: {
    test: (v) => typeof v === 'string' && v.length > 0,
    message: '必须是非空字符串',
  },
  age: {
    test: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 150,
    message: '必须是 0 ~ 150 之间的整数',
  },
  email: {
    test: (v) => typeof v === 'string' && /^[^@\s]+@[^@\s]+$/.test(v),
    message: '必须是合法的邮箱格式',
  },
});

user.name = '张三';
user.age = 20;
user.email = 'zhang@example.com';
console.log(user.name, user.age, user.email); // 张三 20 zhang@example.com
try {
  user.age = 300;
} catch (e) {
  console.log('拦截：', e instanceof Error ? e.message : '未知错误');
}

console.log('\n========== 2. 只读视图 readOnlyView ==========');

function readOnlyView<T extends object>(target: T): T {
  return new Proxy(target, {
    set(): boolean {
      throw new TypeError('只读视图：不允许修改属性');
    },
    deleteProperty(): boolean {
      throw new TypeError('只读视图：不允许删除属性');
    },
    defineProperty(): boolean {
      throw new TypeError('只读视图：不允许定义新属性');
    },
  });
}

const config = { host: 'localhost', port: 8080 };
const frozenView = readOnlyView(config);
console.log(frozenView.host, frozenView.port); // localhost 8080
try {
  frozenView.port = 80;
} catch (e) {
  console.log('修改被拒绝：', e instanceof TypeError); // true
}
console.log('原对象不受影响：', config.port); // 8080

console.log('\n========== 3. 访问审计日志 withAudit ==========');

function withAudit<T extends object>(target: T, label: string): T {
  return new Proxy(target, {
    get(t: T, key: string | symbol): unknown {
      const value = Reflect.get(t, key);
      console.log(`  [审计] ${label}：读取 ${String(key)}`);
      return value;
    },
    set(t: T, key: string | symbol, value: unknown): boolean {
      console.log(`  [审计] ${label}：写入 ${String(key)} = ${JSON.stringify(value)}`);
      return Reflect.set(t, key, value);
    },
  });
}

interface CartItem {
  name: string;
  qty: number;
  price: number;
}

const cart = withAudit<CartItem>({ name: '书', qty: 1, price: 59 }, '购物车');
cart.qty = 2;
console.log('小计：', cart.qty * cart.price); // 118

console.log('\n========== 4. Web Service 客户端 createWebService ==========');

// Proxy 拦截 get，把任意属性名变成一个"接口调用函数"，
// 这样无需为每个接口手写方法
type ApiResult = { ok: boolean; api: string; args: unknown[] };
type ApiClient = Record<string, (...args: unknown[]) => Promise<ApiResult>>;

function createWebService(baseUrl: string): ApiClient {
  return new Proxy({} as ApiClient, {
    get(t: ApiClient, key: string | symbol): unknown {
      if (typeof key !== 'string') {
        return undefined;
      }
      return async (...args: unknown[]): Promise<ApiResult> => {
        // 演示环境不发送真实请求，只打印将要访问的接口
        console.log(`  请求 ${baseUrl}/${key}，参数：${JSON.stringify(args)}`);
        return { ok: true, api: key, args };
      };
    },
  });
}

async function main(): Promise<void> {
  const api = createWebService('https://api.example.com');
  const r1 = await api.getUser({ id: 1 });
  console.log('  响应：', r1.ok, r1.api);
  const r2 = await api.listOrders({ page: 1, size: 10 });
  console.log('  响应：', r2.ok, r2.api);
}
void main();

export {};
