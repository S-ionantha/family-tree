# TypeScript 全量迁移：前端 React + 后端 Express 完整转换

- [x] 任务 1：安装 TypeScript 相关依赖并创建配置文件
    - 1.1: 执行 `pnpm add -D typescript tsx @types/node @types/express @types/cors @types/uuid` 安装所有 TS 依赖
    - 1.2: 创建 `tsconfig.json`（前端配置：target ES2020, jsx react-jsx, strict, moduleResolution bundler, include src）
    - 1.3: 创建 `tsconfig.node.json`（后端配置：target ES2020, module ESNext, include server + src/types.ts + vite.config.ts）
    - 1.4: 创建 `src/vite-env.d.ts`（Vite 客户端类型声明 `/// <reference types="vite/client" />`）
    - 1.5: 修改 `package.json` scripts 中 `dev:server` 改为 `tsx watch server/index.ts`，`start` 改为 `tsx server/index.ts`

- [x] 任务 2：创建共享类型定义并迁移前端核心文件（types、api、useTreeLayout）
    - 2.1: 创建 `src/types.ts`，定义 TreeNode、FamilyTree、TreeListItem、BackupData、BackupListItem 接口
    - 2.2: 创建 `src/api.ts`（替代 api.js），所有函数添加参数类型和返回值类型注解，request 函数使用泛型 `<T>`，各导出函数返回具体类型（如 `Promise<TreeListItem[]>`、`Promise<FamilyTree>` 等）
    - 2.3: 创建 `src/useTreeLayout.ts`（替代 useTreeLayout.js），定义 NodePosition、ChildInfo、Connection、LayoutResult 接口，calcSubtreeWidth 参数类型为 TreeNode，Hook 返回类型为 LayoutResult
    - 2.4: 删除 `src/api.js` 和 `src/useTreeLayout.js`

- [x] 任务 3：迁移前端 React 组件文件（main.tsx、App.tsx）
    - 3.1: 创建 `src/main.tsx`（替代 main.jsx），import 路径改为 `./App.tsx` → `./App`，添加 `document.getElementById('root')!` 非空断言
    - 3.2: 创建 `src/App.tsx`（替代 App.jsx），为所有组件 Props 定义接口（ToastProps、TreeListModalProps、BackupListModalProps），为事件处理函数添加 React 事件类型（React.MouseEvent、React.FormEvent、React.WheelEvent、React.DragEvent），state 类型通过 useState 泛型显式标注（如 `useState<TreeNode | null>(null)`）
    - 3.3: 修改 `index.html` 中 script src 从 `/src/main.jsx` 改为 `/src/main.tsx`
    - 3.4: 删除 `src/main.jsx` 和 `src/App.jsx`
    - 3.5: 执行 `npx vite build` 验证前端 TS 编译无报错

- [x] 任务 4：迁移后端 Express 文件（index.ts、routes/trees.ts）
    - 4.1: 创建 `server/index.ts`（替代 index.js），添加 Express Application 类型，PORT 类型为 `number | string`
    - 4.2: 创建 `server/routes/trees.ts`（替代 routes/trees.js），import 共享类型，Request/Response 参数添加类型注解，readTreeFile 返回类型为 `FamilyTree | null`，writeTreeFile 参数类型为 FamilyTree，日期比较使用 `new Date().getTime()` 避免 TS 类型错误
    - 4.3: 删除 `server/index.js` 和 `server/routes/trees.js`
    - 4.4: 执行 `tsx server/index.ts` 启动后端，curl 验证 GET /api/trees 正常返回

- [x] 任务 5：迁移配置文件并更新 ESLint、PM2、Vite 配置
    - 5.1: 创建 `vite.config.ts`（替代 vite.config.js），内容不变仅改扩展名，删除旧文件
    - 5.2: 修改 `eslint.config.js` 中 files 匹配从 `**/*.{js,jsx}` 改为 `**/*.{js,jsx,ts,tsx}`
    - 5.3: 修改 `ecosystem.config.cjs` 中 script 改为 `node_modules/.bin/tsx`，新增 `args: 'server/index.ts'`
    - 5.4: 执行 `pnpm run build` 验证完整构建成功，执行 `NODE_ENV=production tsx server/index.ts` 验证生产模式正常
