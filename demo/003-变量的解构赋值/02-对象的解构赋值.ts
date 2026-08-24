/**
 * 《ES6 标准入门（第三版）》第 3 章：变量的解构赋值
 * Demo 02：对象的解构赋值
 *
 * 对象的解构与数组有一个重要的不同：数组的元素是按次序排列的，
 * 变量的取值由它的位置决定；而对象的属性没有次序，变量必须与属性同名，
 * 才能取到正确的值。
 *
 * 运行：node 02-对象的解构赋值.ts
 */

console.log('========== 1. 基本用法：变量必须与属性同名 ==========');

const { bar, foo } = { foo: 'aaa', bar: 'bbb' };
console.log(bar, foo); // bbb aaa（变量的声明顺序与属性的顺序无关）

// 如果解构失败，变量的值等于 undefined
const source: { foo: string; baz?: string } = { foo: 'aaa' };
const { baz } = source;
console.log(baz); // undefined

// 不加声明的嵌套解构会报错：
// let { foo: bar } = { bar: 'baz' }; 等号左边是模式 foo，变量是 bar（见下）

console.log('\n========== 2. 重命名：属性名: 变量名 ==========');

// 对象的解构赋值的内部机制，是先找到同名属性，然后再赋给对应的变量。
// 真正被赋值的是后者，而不是前者：
const renameSource: { foo: string; bar: string } = { foo: 'aaa', bar: 'bbb' };
const { foo: renamed } = renameSource;
console.log(renamed); // aaa（只取了 foo，bar 完全没有参与赋值）
// console.log(foo); // 报错：foo 只是模式，不是变量

// foo 是匹配的模式，renamed 才是变量。这种写法在导入模块、
// 处理同名冲突时非常常用（详见第 22 章 Module 的语法）。

console.log('\n========== 3. 默认值 ==========');

// 默认值生效的条件是，对象的属性值严格等于 undefined
const objWithDefault: { x?: number; y?: number } = { x: 1 };
const { x: xx = 3 } = objWithDefault;
console.log(xx); // 1（属性存在，默认值不生效）

const objEmpty: { x?: number } = {};
const { x: yy = 3 } = objEmpty;
console.log(yy); // 3（属性值为 undefined，默认值生效）

// 默认值可以结合重命名一起使用：{ 属性名: 变量名 = 默认值 }
// （上面两个例子已经是这种写法）

console.log('\n========== 4. 嵌套结构的解构 ==========');

const node: {
  loc: { start: { line: number; column: number }; end: { line: number; column: number } };
} = {
  loc: {
    start: { line: 1, column: 5 },
    end: { line: 1, column: 9 },
  },
};

// loc 与 start 都是模式，只有 line 与 column 是变量
const { loc: { start: { line, column } } } = node;
console.log(line, column); // 1 5
// console.log(loc); // 报错：loc 是模式，不是变量

// 嵌套解构 + 默认值的典型应用：为函数参数提供默认配置
const book: { name: string; metadata?: { author?: string } } = { name: 'ES6 标准入门' };
const { name: bookName, metadata: { author = '佚名' } = {} } = book;
console.log(bookName, author); // ES6 标准入门 佚名

console.log('\n========== 5. 字符串、数值、布尔值的解构赋值 ==========');

// 字符串也可以解构赋值：字符串被转换成了一个"类似数组的对象"
const [h1, h2, h3, ...hRest] = 'hello';
console.log(h1, h2, h3, hRest); // h e l [ 'l', 'o' ]

// 数值和布尔值的解构赋值：等号右边先转为对象（包装对象）
const { toString: nToString } = 123;
console.log(typeof nToString); // 'function'（从 Number 包装对象上取到方法）
// 注意：解构赋值的规则是，只要等号右边的值不是对象或数组，就先将其转为对象。
// 由于 undefined 和 null 无法转为对象，对它们解构都会报错：
// const { prop: u } = undefined; // TypeError
// const { prop: n } = null;      // TypeError

console.log('\n========== 6. 圆括号问题 ==========');

// 解构赋值虽然很方便，但解析起来并不容易。对于编译器来说，式子到底应该是模式，
// 还是表达式，没有办法从一开始就知道，必须解析到（或解析不到）等号才能知道。
// 由此带来的问题是：如果模式中出现圆括号怎么处理？ES6 的规则是：
//   - 变量声明语句中，不得使用圆括号（不能用）
//   - 函数参数中，模式不能使用圆括号（不能用）
//   - 赋值语句的非模式部分，可以使用圆括号（可以用）

// 可以使用圆括号的唯一场合：赋值语句的非模式部分
let renamedTarget: string;
({ foo: renamedTarget } = { foo: 'aaa' }); // 整个模式放在圆括号里，才是合法的赋值语句
console.log(renamedTarget); // aaa

// 错误的用法（会导致整个解构赋值的模式错误，运行时报错）：
// ({ foo: (renamedTarget) } = { foo: 'aaa' }); // 圆括号套在变量上是不合法的

console.log('\n========== 7. 业务场景：接口数据瘦身（重命名 + 脱敏） ==========');

// 需求：后端返回的用户对象字段很"原始"（下划线命名、带敏感信息），
// 组件需要的却是驼峰命名、且不能包含密码 / 完整邮箱。
// 用对象解构的"重命名 + 默认值"一次完成字段摘取：

interface RawUser {
  user_id: number;
  user_name: string;
  email: string;
  password: string; // 敏感字段，绝不能带进组件
  avatar_url?: string;
  vip_level?: number;
}

interface UserCardProps {
  id: number;
  name: string;
  avatar: string; // 重命名自 avatar_url，并提供默认头像
  level: number; // 重命名自 vip_level，并提供默认等级
}

function toUserCard(raw: RawUser): UserCardProps {
  // 一行完成"重命名 + 默认值 + 丢弃其余字段（含 password）"：
  const {
    user_id: id,
    user_name: name,
    avatar_url: avatar = 'https://cdn.example.com/default-avatar.png',
    vip_level: level = 0,
  } = raw;
  // 注意：password、email 没有被解构，自然不会进入返回值（数据瘦身）
  return { id, name, avatar, level };
}

// 邮箱脱敏：只暴露前 2 位与域名（配套的字符串处理）
function maskEmail(email: string): string {
  const [name, domain] = email.split('@'); // split 返回数组，正好用数组解构
  const masked: string = name.length <= 2 ? name + '**' : `${name.slice(0, 2)}****`;
  return `${masked}@${domain}`;
}

const rawUser: RawUser = {
  user_id: 10086,
  user_name: '小明',
  email: 'xiaoming@example.com',
  password: 'p@ssw0rd',
};

const card: UserCardProps = toUserCard(rawUser);
console.log('组件拿到的用户卡片：', card);
// { id: 10086, name: '小明', avatar: 'https://cdn.example.com/default-avatar.png', level: 0 }
console.log('卡片里是否还残留 password：', 'password' in card); // false（从未被带出）
console.log('脱敏邮箱：', maskEmail(rawUser.email)); // xi****@example.com

export {};
