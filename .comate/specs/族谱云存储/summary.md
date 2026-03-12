# 族谱云存储 — 完成总结

## 概述

将原有纯前端族谱编辑器成功转换为具备服务端存储能力的全栈应用，支持族谱的持久化存储、多族谱管理、自动备份与恢复、同代水平对齐布局、图片导出，以及 PM2 生产部署。

## 完成的改造

### 1. 包管理器迁移
- 从 npm 切换到 **pnpm**，删除 `package-lock.json`，生成 `pnpm-lock.yaml`
- 新增依赖：express, uuid, cors, html2canvas, concurrently

### 2. Express 后端服务
- **`server/index.js`** — 服务入口，自动创建数据目录，生产环境托管前端静态文件
- **`server/routes/trees.js`** — 9 个 RESTful API 接口：
  - 族谱 CRUD：列表、详情、新建、更新（自动备份）、删除（级联清理备份）
  - 备份管理：备份列表、备份详情、从备份恢复（带恢复保护）、删除备份
  - 每棵族谱最多保留 50 个历史备份，超出自动清理最早的

### 3. 前端 API 层
- **`src/api.js`** — 封装 9 个接口调用函数，统一错误处理

### 4. App.jsx 全面改造
- **服务端集成**：新增保存/加载/另存为/删除等操作，支持多族谱管理
- **族谱列表弹窗**：启动时自动展示，可打开/删除已有族谱，或新建空白/模板族谱
- **备份列表弹窗**：按时间倒序展示，支持恢复和删除
- **Toast 通知**：操作成功/失败时的轻量提示
- **工具栏升级**：打开族谱、保存、另存为、历史备份、重置视图、导出图片、导出 JSON

### 5. 同代水平对齐布局与代数标注
- **`src/useTreeLayout.js`** — 自定义 Hook，计算每个节点的绝对坐标，保证同代节点严格水平对齐
- 替换原有递归 UL/LI 渲染为**绝对定位方案**
- 使用 **SVG** 绘制父子连线（竖线 + 水平线 + 分叉线）
- 族谱区域**左右两侧**各渲染一列代数标注（"第一世""第二世"……），与节点精确对齐

### 6. 图片导出优化
- html2canvas 从 CDN 动态加载改为 **pnpm 本地依赖 + ES Module 静态 import**
- 导出前临时重置画布变换（scale=1, translate=0），确保一比一还原
- 2 倍分辨率高清导出，文件名跟随族谱标题

### 7. PM2 部署配置
- **`ecosystem.config.cjs`** — 进程守护、自动重启、内存上限 300M
- `pnpm run deploy` 一键构建 + 启动
- 完整的 pm2 脚本：start / stop / restart / logs

## 新增/修改文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `server/index.js` | 新增 | Express 服务入口 |
| `server/routes/trees.js` | 新增 | 族谱 CRUD + 备份管理路由 |
| `src/api.js` | 新增 | 前端 API 调用封装 |
| `src/useTreeLayout.js` | 新增 | 树形布局计算 Hook |
| `src/App.jsx` | 重写 | 集成服务端存储、新布局、弹窗、Toast |
| `ecosystem.config.cjs` | 新增 | PM2 配置 |
| `package.json` | 修改 | 新增依赖和脚本 |
| `vite.config.js` | 修改 | 添加 /api 代理 |
| `.gitignore` | 修改 | 忽略 server/data/ |

## 使用方式

### 开发模式
```bash
pnpm run dev    # 同时启动 Vite 前端 + Express 后端
```

### 生产部署
```bash
pnpm run deploy   # 构建前端 + PM2 启动
pnpm run pm2:logs # 查看运行日志
```

## 验证结果

- ✅ `vite build` 构建成功
- ✅ 后端 9 个 API 接口全部通过 curl 测试
- ✅ 创建/更新/删除族谱正常
- ✅ 更新时自动创建备份、备份列表查询正常
- ✅ 生产模式单进程同时提供 API 和前端页面（HTTP 200）