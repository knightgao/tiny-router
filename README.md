# Tiny Router

Tiny Router 是一个为 Vue 应用程序设计的轻量级路由器。它提供了基本的路由功能，如路由切换、导航守卫、错误处理等，并支持 `history` 和 `hash` 两种模式。

## 目录

- [安装](#安装)
- [快速开始](#快速开始)
- [API 文档](#api-文档)
  - [构造函数](#构造函数)
  - [实例方法](#实例方法)
- [导航守卫](#导航守卫)
- [错误处理](#错误处理)
- [测试覆盖率报告](#测试覆盖率报告)

## 安装（假的）

您可以使用 npm 或 yarn 安装 Tiny Router：

```bash
npm install tiny-router
# 或者
yarn add tiny-router
```

## 快速开始

以下是一个基本的使用示例：

```typescript
import { createApp } from 'vue';
import Router from 'tiny-router';
import HomeComponent from './components/HomeComponent.vue';
import AboutComponent from './components/AboutComponent.vue';

const routes = [
  { path: '/', component: HomeComponent },
  { path: '/about', component: AboutComponent },
];

const router = new Router({ mode: 'history', routes });

const app = createApp(App);
app.use(router);
app.mount('#app');
```

## API 文档

### 构造函数

```typescript
constructor({ mode = 'history', routes = [] }: { mode?: string, routes?: any[] } = {})
```

- `mode`：路由模式，支持 `history` 和 `hash` 两种模式，默认为 `history`。
- `routes`：路由配置数组，每个路由对象包含 `path` 和 `component` 属性。

### 实例方法

#### `addRoutes(routes: any[])`

添加多个路由。

#### `beforeEach(hook: (from: string, to: string) => Promise<void>)`

添加全局前置守卫。

#### `beforeResolve(hook: (from: string, to: string) => Promise<void>)`

添加全局解析守卫。

#### `afterEach(hook: (from: string, to: string) => Promise<void>)`

添加全局后置守卫。

#### `onError(handler: (error: Error) => void)`

添加错误处理函数。

#### `isReady(): Promise<void>`

返回一个 Promise，当路由器初始化完成后会被 resolve。

#### `addRoute(path: string, component: any)`

添加单个路由。

#### `push(path: string)`

导航到指定路径。

#### `replace(path: string)`

替换当前路径。

#### `back()`

回退到上一个历史记录。

#### `forward()`

前进到下一个历史记录。

#### `go(delta: number)`

根据给定的偏移量导航。

#### `getCurrentPath(): string`

获取当前路径。

#### `getCurrentComponent()`

获取当前组件。

#### `install(app: App)`

安装路由插件。

## 导航守卫

Tiny Router 提供了三种类型的导航守卫：

- **全局前置守卫**：在路由导航前执行。
- **全局解析守卫**：在路由解析前执行。
- **全局后置守卫**：在路由导航后执行。

示例：

```typescript
router.beforeEach(async (from, to) => {
  console.log('Before each:', from, to);
});

router.beforeResolve(async (from, to) => {
  console.log('Before resolve:', from, to);
});

router.afterEach(async (from, to) => {
  console.log('After each:', from, to);
});
```

## 错误处理

您可以通过 `onError` 方法添加全局错误处理函数：

```typescript
router.onError((error) => {
  console.error('Routing error:', error);
});
```

## 测试覆盖率报告

以下是测试覆盖率报告：

```markdown
| File       | % Stmts | % Branch | % Funcs | % Lines |
|------------|---------|----------|---------|---------|
| All files  | 100     | 94.28    | 100     | 100     |
| Router.ts  | 100     | 94.28    | 100     | 100     |
```