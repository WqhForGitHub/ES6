/**
 * 《ES6 标准入门（第三版）》第 4 章：字符串的扩展
 * Demo 03：模板字符串
 *
 * 模板字符串（template string）是增强版的字符串，用反引号（`）标识。
 * 它可以当作普通字符串使用，也可以用来定义多行字符串，或者在字符串中
 * 嵌入变量、表达式，还支持"标签模板"功能。
 *
 * 运行：node 03-模板字符串.ts
 */

console.log('========== 1. 基本用法：变量嵌入 ==========');

const name: string = '张三';
const age: number = 20;

// ES5 的拼接写法
console.log('大家好，我叫' + name + '，今年' + age + '岁。');
// 模板字符串：${} 中可以放入变量和任意 JavaScript 表达式
console.log(`大家好，我叫 ${name}，今年 ${age} 岁。`);
console.log(`明年我 ${age + 1} 岁，是否成年：${age >= 18 ? '是' : '否'}`);

// ${} 中可以调用函数
function fn(): string {
  return 'Hello World';
}
console.log(`他 说：${fn()}`);

// ${} 中甚至可以嵌套模板字符串
const inner: Array<{ id: number; title: string }> = [
  { id: 1, title: 'ES6' },
  { id: 2, title: '模板字符串' },
];
console.log(`列表：${inner.map((t) => `(${t.id})${t.title}`).join('、')}`);
// 列表：(1)ES6、(2)模板字符串

console.log('\n========== 2. 多行字符串 ==========');

// 模板字符串中所有的空格、缩进和换行都会被保留
const multiLine: string = `第一行
  第二行（前面的缩进会保留）
第三行`;
console.log(multiLine);
// ES5 中实现多行必须依赖 \n 转义或数组 join

// 如果不想要换行符，可以配合 trim() 或使用反斜杠续行：
console.log(
  `这是一个很长的字符串，
它其实有两行。`
);

console.log('\n========== 3. 标签模板（tagged template） ==========');

// 标签模板：模板字符串跟在一个函数名后面，该函数将被调用来处理这个模板字符串。
// 这其实不是模板，而是函数调用的一种特殊形式："标签"指的就是函数。
// 标签模板使模板字符串成为了一种真正的"模板语言"能力。

function tag(strings: TemplateStringsArray, ...values: number[]): string {
  console.log('模板中的原始字符串数组：', strings); // [ '第一个值：', '，第二个值：', '' ]
  console.log('各插值表达式的结果：', values); // [ 6, 18 ]
  let result: string = '';
  strings.forEach((str: string, i: number): void => {
    result += str + (i < values.length ? values[i] : '');
  });
  return result;
}
const a: number = 5;
const b: number = 10;
console.log(tag`第一个值：${a + 1}，第二个值：${a + b}`); // 第一个值：6，第二个值：18

// "标签模板"的一个重要应用：过滤 HTML 字符串，防止用户输入恶意内容
function saferHTML(templateData: TemplateStringsArray, ...substitutions: string[]): string {
  let s: string = templateData[0];
  for (let i = 0; i < substitutions.length; i++) {
    const esc: string = substitutions[i]
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    s += esc + templateData[i + 1];
  }
  return s;
}
const sender: string = '<script>alert("攻击")</script>';
console.log(saferHTML`<p>${sender} 发送了一条消息</p>`);
// <p>&lt;script&gt;alert("攻击")&lt;/script&gt; 发送了一条消息</p>

console.log('\n========== 4. String.raw ==========');

// String.raw 是一个标签函数，返回斜杠被转义（即"原样"）的字符串
console.log(String.raw`Hi\n${1 + 2}`); // Hi\n3（\n 没有被转义成换行符）
console.log(`Hi\n${1 + 2}`); // Hi 换行 3（普通模板字符串中 \n 是换行符）

// 原理：标签函数的第一个参数（TemplateStringsArray）带有 raw 属性，
// 保存的是转义后的原始字符串：
function showRaw(strings: TemplateStringsArray): string {
  return `cooked: ${JSON.stringify(strings[0])}, raw: ${JSON.stringify(strings.raw[0])}`;
}
console.log(showRaw`\n\t\x`); // cooked: "\n\t\x"（已转义）, raw: "\\n\\t\\x"（原样）

console.log('\n========== 5. 实战：简易模板编译 ==========');

// 模板字符串 + 正则，可以实现简单的模板引擎：
function render(template: string, data: Record<string, string>): string {
  return template.replace(/\$\{(\w+)\}/g, (_match: string, key: string): string => data[key] ?? '');
}
const template: string = '尊敬的 ${title}${name}，您的订单 ${orderId} 已发货。';
console.log(render(template, { title: '张', name: '三', orderId: 'A1024' }));
// 尊敬的张三，您的订单 A1024 已发货。

console.log('\n========== 6. 业务场景：发货通知短信 ==========');

// 需求：订单发货后给用户下发短信 / 站内信，文案要嵌入收件人、快递公司、
// 运单号、预计送达时间等动态字段，并对超长地址做截断。

interface ShipNotice {
  receiver: string;
  phone: string; // 需要脱敏
  courier: string;
  trackingNo: string;
  eta: Date;
  address: string;
}

function sendShipNotice(notice: ShipNotice): string {
  // 手机号脱敏：138****8000
  const maskedPhone: string = notice.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  // 超长地址截断（避免短信超出长度被拆成多条计费）
  const shortAddress: string =
    notice.address.length > 18 ? `${notice.address.slice(0, 18)}…` : notice.address;
  // 多行模板 + 嵌入表达式，一份文案看得一清二楚：
  const message: string = `【橙子商城】${notice.receiver}您好，您购买的商品已由${notice.courier}揽收，
运单号：${notice.trackingNo}
预计送达：${notice.eta.toLocaleDateString('zh-CN')}（3 日内）
收货地址：${shortAddress}
联系电话：${maskedPhone}`;
  return message;
}

console.log(
  sendShipNotice({
    receiver: '李四',
    phone: '13800138000',
    courier: '顺丰速运',
    trackingNo: 'SF1234567890',
    eta: new Date('2026-08-27'),
    address: '上海市浦东新区张江高科技园区博云路 2 号浦软大厦 1301 室',
  }),
);
// 【橙子商城】李四您好，您购买的商品已由顺丰速运揽收，
// 运单号：SF1234567890
// 预计送达：2026/8/27（3 日内）
// 收货地址：上海市浦东新区张江高科技园区博云路…
// 联系电话：138****8000

// 对比 ES5 的字符串拼接（同样的文案要写成一行超长代码，极易漏引号、加号）：
// '【橙子商城】' + receiver + '您好，您购买的商品已由' + courier + '揽收，\n' + ...

export {};
