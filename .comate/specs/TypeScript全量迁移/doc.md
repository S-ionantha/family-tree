# TypeScript 全量迁移 — 需求文档

## 一、需求概述

将整个 family-tree 项目（前端 React + 后端 Express）从 JavaScript 全量迁移到 TypeScript，包括类型定义、配置文件和构建/运行流程的适配。

## 二、迁移范围

### 2.1 前端文件（src/）

| 原文件 | 新文件 | 说明 |
|--------|--------|------|
| `src/main.jsx` | `src/main.tsx` | 入口文件 |
| `src/App.jsx` | `src/App.tsx` | 主组件，需添加接口/类型定义 |
| `src/api.js` | `src/api.ts` | API 调用层，需定义请求/响应类型 |
| `src/useTreeLayout.js` | `src/useTreeLayout.ts` | 布局 Hook，需定义节点/连线类型 |

### 2.2 后端文件（server/）

| 原文件 | 新文件 | 说明 |
|--------|--------|------|
| `server/index.js` | `server/index.ts` | Express 入口 |
| `server/routes/trees.js` | `server/routes/trees.ts` | 路由，需定义数据模型类型 |

### 2.3 配置文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `tsconfig.json` | 新增 | 前端 TS 配置（target ESNext, jsx react-jsx） |
| `tsconfig.node.json` | 新增 | 后端/构建工具 TS 配置（Node 运行环境） |
| `index.html` | 修改 | 入口脚本引用改为 `/src/main.tsx` |
| `package.json` | 修改 | 新增 TS 依赖、脚本中用 `tsx` 运行后端 |
| `eslint.config.js` | 修改 | 匹配规则扩展为 `*.{ts,tsx}` |
| `ecosystem.config.cjs` | 修改 | PM2 script 路径改用 tsx 运行 .ts |
| `vite.config.js` → `vite.config.ts` | 重命名 | Vite 配置改用 TS |

## 三、新增依赖

```
pnpm add -D typescript tsx @types/node @types/express @types/cors @types/uuid
```

- `typescript` — TypeScript 编译器
- `tsx` — Node.js 的 TypeScript 运行器（替代 ts-node，零配置、ESM 友好）
- `@types/node` — Node.js 类型定义
- `@types/express` — Express 类型定义
- `@types/cors` — cors 中间件类型定义
- `@types/uuid` — uuid 类型定义

> 注意：`@types/react` 和 `@types/react-dom` 已在 devDependencies 中。

## 四、类型定义设计

### 4.1 共享类型（`src/types.ts`）

前后端共享的核心数据类型：

```typescript
// 族谱节点
export interface TreeNode {
  id: string;
  name: string;
  spouse?: string;
  children: TreeNode[];
}

// 族谱完整数据（存储格式）
export interface FamilyTree {
  id: string;
  title: string;
  treeData: TreeNode;
  createdAt: string;
  updatedAt: string;
}

// 族谱列表项（摘要）
export interface TreeListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// 备份数据
export interface BackupData {
  backupId: string;
  treeId: string;
  title: string;
  treeData: TreeNode;
  createdAt: string;
}

// 备份列表项
export interface BackupListItem {
  backupId: string;
  title: string;
  createdAt: string;
}
```

### 4.2 布局类型（`src/useTreeLayout.ts` 内部）

```typescript
export interface NodePosition {
  id: string;
  x: number;
  y: number;
  depth: number;
  node: TreeNode;
}

interface ChildInfo {
  x: number;
  topY: number;
}

export interface Connection {
  parentX: number;
  parentBottomY: number;
  childrenInfo: ChildInfo[];
  midY: number;
}

export interface LayoutResult {
  positions: NodePosition[];
  connections: Connection[];
  maxDepth: number;
  totalWidth: number;
  totalHeight: number;
}
```

### 4.3 API 层类型（`src/api.ts`）

函数签名添加参数和返回值类型，基于 4.1 的共享类型。

### 4.4 后端类型

后端路由使用 Express 的 `Request`、`Response` 类型注解，数据模型复用 `TreeNode`、`FamilyTree`、`BackupData` 等类型（后端通过相对路径 import 共享类型文件，或在 server 目录下创建独立类型文件）。

由于前后端使用不同的 tsconfig（前端面向浏览器，后端面向 Node），共享类型文件放在 `src/types.ts`，后端通过 `../src/types.ts` 导入（tsx 运行器支持此模式）。

## 五、tsconfig 配置

### 5.1 `tsconfig.json`（前端）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

### 5.2 `tsconfig.node.json`（后端 + 构建工具）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["server", "src/types.ts", "vite.config.ts", "ecosystem.config.cjs"]
}
```

## 六、脚本与配置变更

### package.json scripts 调整

```json
{
  "dev:server": "tsx watch server/index.ts",
  "start": "tsx server/index.ts"
}
```

> `tsx watch` 提供文件变更时自动重启，适合开发模式。

### ecosystem.config.cjs 调整

```js
script: 'node_modules/.bin/tsx',
args: 'server/index.ts',
```

> 或者使用 `interpreter` + `interpreter_args` 方式让 PM2 通过 tsx 运行 .ts。

### index.html 入口

```html
<script type="module" src="/src/main.tsx"></script>
```

## 七、影响文件总览

| 文件 | 操作类型 |
|------|----------|
| `src/types.ts` | 新增 |
| `src/main.tsx` | 新增（替代 main.jsx） |
| `src/App.tsx` | 新增（替代 App.jsx） |
| `src/api.ts` | 新增（替代 api.js） |
| `src/useTreeLayout.ts` | 新增（替代 useTreeLayout.js） |
| `src/vite-env.d.ts` | 新增（Vite 类型声明） |
| `server/index.ts` | 新增（替代 index.js） |
| `server/routes/trees.ts` | 新增（替代 trees.js） |
| `tsconfig.json` | 新增 |
| `tsconfig.node.json` | 新增 |
| `vite.config.ts` | 新增（替代 vite.config.js） |
| `index.html` | 修改 |
| `package.json` | 修改 |
| `eslint.config.js` | 修改 |
| `ecosystem.config.cjs` | 修改 |
| 旧 .js/.jsx 文件 | 删除（共 8 个） |

## 八、预期成果

1. 所有源代码文件使用 TypeScript 编写，类型安全
2. 前端使用 Vite 原生 TS 支持，零额外配置即可编译
3. 后端使用 `tsx` 直接运行 .ts 文件，无需预编译步骤
4. 共享类型定义，前后端数据结构一致
5. 所有现有功能保持不变，构建和运行正常