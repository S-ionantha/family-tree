# 族谱云存储 —— 需求文档

## 一、需求概述

将现有纯前端族谱编辑器转换为具备服务端存储能力的全栈应用。用户可以创建多棵族谱、保存编辑内容到服务端、从服务端加载已有族谱，实现数据持久化。

## 二、架构技术方案

### 整体架构

```
┌─────────────────┐       HTTP API       ┌──────────────────┐
│  React 前端      │  ◄───────────────►  │  Express 后端     │
│  (Vite 构建)     │    /api/trees/*     │  (Node.js)       │
└─────────────────┘                      └────────┬─────────┘
                                                  │
                                          ┌───────▼─────────┐
                                          │  文件系统存储     │
                                          │  server/data/*.json│
                                          └─────────────────┘
```

### 技术选型

| 层级 | 技术 | 理由 |
|------|------|------|
| 后端框架 | Express.js | 轻量、成熟，项目已有 Node.js 环境 |
| 数据存储 | JSON 文件 | 零依赖、无需数据库，适合单用户/小规模场景 |
| ID 生成 | uuid (npm) | 标准唯一 ID，避免冲突 |
| 开发代理 | Vite proxy | 开发时前端请求自动转发到 Express |
| 生产部署 | Express 静态托管 + PM2 | Express 提供 API 和静态文件，PM2 守护进程 |
| 进程管理 | PM2 | 进程守护、自动重启、日志管理、零停机重载 |

### 目录结构变化

```
family-tree/
├── server/                    # 新增：后端目录
│   ├── index.js               # Express 入口，注册路由 + 静态托管
│   ├── routes/
│   │   └── trees.js           # 族谱 CRUD 路由
│   └── data/                  # 运行时自动创建，存放族谱 JSON 文件
├── src/                       # 前端（现有，需修改）
│   ├── api.js                 # 新增：前端 API 调用封装
│   ├── App.jsx                # 修改：接入加载/保存逻辑
│   └── ...
├── ecosystem.config.cjs       # 新增：PM2 配置文件
├── package.json               # 修改：新增后端依赖和启动脚本
└── vite.config.js             # 修改：新增 proxy 配置
```

## 三、后端 API 设计

### 3.1 族谱 CRUD

| 方法 | 路径 | 功能 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/api/trees` | 获取族谱列表 | — | `[{id, title, updatedAt}]` |
| GET | `/api/trees/:id` | 获取单棵族谱完整数据 | — | `{id, title, treeData, createdAt, updatedAt}` |
| POST | `/api/trees` | 新建族谱 | `{title, treeData}` | `{id, title, ...}` |
| PUT | `/api/trees/:id` | 更新族谱（自动创建备份） | `{title?, treeData?}` | `{id, title, ...}` |
| DELETE | `/api/trees/:id` | 删除族谱（同时删除所有备份） | — | `{success: true}` |

### 3.2 备份管理

| 方法 | 路径 | 功能 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/api/trees/:id/backups` | 获取某棵族谱的备份列表 | — | `[{backupId, createdAt, title}]` |
| GET | `/api/trees/:id/backups/:backupId` | 获取某个备份的完整数据 | — | `{id, title, treeData, ...}` |
| POST | `/api/trees/:id/backups/:backupId/restore` | 从备份恢复（用备份内容覆盖当前版本，恢复前自动备份当前版本） | — | `{id, title, ...}` |
| DELETE | `/api/trees/:id/backups/:backupId` | 删除单个备份 | — | `{success: true}` |

### 3.3 备份机制说明

- **自动备份**：每次 PUT 更新族谱时，服务端先将当前版本复制到备份目录，再写入新数据
- **恢复保护**：从备份恢复时，也会先自动备份当前版本，防止恢复操作导致数据丢失
- **备份上限**：每棵族谱最多保留 **50** 个备份，超出时自动删除最早的备份

### 3.4 数据存储格式

**主数据文件** `server/data/{id}.json`：

```json
{
  "id": "uuid-xxxx",
  "title": "孙氏祖系图谱",
  "treeData": { /* 与现有 initialData 结构完全一致 */ },
  "createdAt": "2026-03-12T10:00:00.000Z",
  "updatedAt": "2026-03-12T10:30:00.000Z"
}
```

**备份文件** `server/data/backups/{treeId}/{timestamp}.json`：

```json
{
  "backupId": "1710244200000",
  "treeId": "uuid-xxxx",
  "title": "孙氏祖系图谱",
  "treeData": { /* 备份时刻的完整数据 */ },
  "createdAt": "2026-03-12T10:30:00.000Z"
}
```

## 四、前端改造

### 4.1 新增 `src/api.js` — API 调用层

封装所有与后端的通信，提供以下函数：
- `fetchTrees()` → GET /api/trees
- `fetchTree(id)` → GET /api/trees/:id
- `createTree(title, treeData)` → POST /api/trees
- `updateTree(id, data)` → PUT /api/trees/:id
- `deleteTree(id)` → DELETE /api/trees/:id

### 4.2 修改 `src/App.jsx` — 核心交互改造

**新增状态：**
- `currentTreeId` — 当前打开的族谱 ID（null 表示未保存的新族谱）
- `treeList` — 族谱列表
- `showListModal` — 是否显示族谱列表弹窗
- `showBackupModal` — 是否显示备份列表弹窗
- `backupList` — 当前族谱的备份列表
- `isSaving` / `isLoading` — 加载/保存状态指示

**顶部工具栏改造：**
- 新增「保存」按钮：已有 ID 则 PUT 更新（自动备份），否则 POST 创建
- 新增「另存为」按钮：始终 POST 创建新族谱
- 新增「打开族谱」按钮：弹出列表弹窗，展示所有已保存族谱，点击加载
- 新增「新建族谱」按钮：重置为空白族谱模板
- 新增「历史备份」按钮：打开当前族谱的备份列表弹窗（仅当 currentTreeId 存在时可用）
- 保留现有「导出图片」和「导出数据 (JSON)」按钮

**族谱列表弹窗：**
- 展示所有已保存族谱的标题和最后修改时间
- 支持点击加载、删除操作
- 遮罩层点击可关闭

**备份列表弹窗：**
- 展示当前族谱的所有备份，按时间倒序排列
- 每条备份显示：备份时间、族谱标题
- 操作按钮：「恢复此版本」（确认后恢复）、「删除」
- 遮罩层点击可关闭

**初始化流程改变：**
- 应用启动时不再使用硬编码 `initialData`，改为展示族谱列表弹窗让用户选择
- 保留 `initialData` 作为「新建族谱」的默认模板

### 4.3 修改 `vite.config.js`

新增 proxy 配置，将 `/api` 请求转发到 `http://localhost:3001`：

```js
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

## 五、`package.json` 改造

新增依赖：
- `express` — 后端框架
- `uuid` — ID 生成
- `cors` — 跨域支持（生产环境非必需，开发方便）
- `concurrently` — 同时启动前后端（开发模式）

新增脚本：
```json
{
  "dev:server": "node server/index.js",
  "dev:client": "vite",
  "dev": "concurrently \"pnpm run dev:server\" \"pnpm run dev:client\"",
  "start": "node server/index.js",
  "pm2:start": "pm2 start ecosystem.config.cjs",
  "pm2:stop": "pm2 stop family-tree",
  "pm2:restart": "pm2 restart family-tree",
  "pm2:logs": "pm2 logs family-tree",
  "deploy": "pnpm run build && pnpm run pm2:start"
}
```

> **注意**：项目使用 **pnpm** 作为包管理器。安装依赖使用 `pnpm add`，运行脚本使用 `pnpm run`。需删除现有的 `package-lock.json`，使用 `pnpm install` 生成 `pnpm-lock.yaml`。

## 五-B、PM2 部署配置

### `ecosystem.config.cjs` 配置文件

```js
module.exports = {
  apps: [{
    name: 'family-tree',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,           // 崩溃后自动重启
    watch: false,                // 生产环境不监听文件变化
    max_memory_restart: '300M',  // 内存超 300M 自动重启
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

### PM2 部署说明

| 操作 | 命令 | 说明 |
|------|------|------|
| 首次部署 | `pnpm run deploy` | 构建前端 + PM2 启动服务 |
| 停止服务 | `pnpm run pm2:stop` | 停止进程但保留配置 |
| 重启服务 | `pnpm run pm2:restart` | 重启进程 |
| 查看日志 | `pnpm run pm2:logs` | 实时查看运行日志 |
| 查看状态 | `pm2 status` | 查看进程运行状态 |
| 设置开机启动 | `pm2 startup && pm2 save` | 系统重启后自动拉起服务 |

### 生产环境 Express 静态托管

`server/index.js` 中，当 `NODE_ENV === 'production'` 时，Express 同时托管 `dist/` 目录下的前端构建产物，使得 PM2 启动后单进程同时提供 API 和页面服务，无需额外的 Nginx 反向代理。

## 六、边界条件与异常处理

| 场景 | 处理方式 |
|------|----------|
| 后端 data 目录不存在 | 服务启动时自动创建 `data/` 和 `data/backups/` |
| 请求的族谱 ID 不存在 | 返回 404，前端提示"族谱不存在或已被删除" |
| 请求的备份 ID 不存在 | 返回 404，前端提示"备份不存在或已被删除" |
| 保存时 JSON 写入失败 | 返回 500，前端提示保存失败 |
| 备份超过 50 个 | 自动清理最早的备份，保留最近 50 个 |
| 前端网络请求失败 | catch 异常，显示友好错误提示 |
| 删除族谱确认 | 前端弹出确认对话框，提示将同时删除所有备份 |
| 恢复备份确认 | 前端弹出确认对话框，提示当前版本将被覆盖（但会自动备份） |
| 并发写入 | 文件级别操作天然串行，小规模场景不做额外锁 |

## 七、数据流动路径

### 保存流程
```
用户点击「保存」 → App 调用 api.updateTree/createTree
  → fetch PUT/POST /api/trees → Express 路由处理
    → 写入 server/data/{id}.json → 返回成功
      → 前端更新 currentTreeId，提示保存成功
```

### 加载流程
```
用户点击「打开族谱」 → App 调用 api.fetchTrees
  → fetch GET /api/trees → Express 扫描 data 目录
    → 返回列表 → 前端展示弹窗
用户选择一棵 → App 调用 api.fetchTree(id)
  → fetch GET /api/trees/:id → Express 读取对应 JSON 文件
    → 返回完整数据 → 前端 setTreeData + setTreeTitle
```

## 八、预期成果

1. 族谱数据可持久化到服务端，刷新页面不丢失
2. 支持管理多棵族谱（新建、打开、保存、删除）
3. 每次保存自动备份历史版本，支持查看备份列表、从备份恢复、删除备份
4. 现有编辑功能完全保留（节点增删改、拖拽、缩放等）
5. 开发模式一条命令同时启动前后端
6. 生产模式通过 PM2 部署，进程守护、自动重启、日志管理一步到位
7. `pnpm run deploy` 一键完成构建 + 启动
8. 全程使用 pnpm 管理依赖，统一包管理工具