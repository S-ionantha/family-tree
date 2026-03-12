# 族谱云存储：全栈改造与 PM2 部署

- [x] 任务 1：切换 pnpm 并安装后端依赖
    - 1.1: 删除 `package-lock.json`，使用 `pnpm install` 重新生成 `pnpm-lock.yaml`
    - 1.2: 在 `package.json` 中新增后端依赖（express, uuid, cors）和开发依赖（concurrently），新增 scripts（dev:server, dev:client, dev, start, pm2:start, pm2:stop, pm2:restart, pm2:logs, deploy）
    - 1.3: 执行 `pnpm install` 安装所有新增依赖

- [x] 任务 2：创建 Express 后端服务与族谱 CRUD 路由
    - 2.1: 创建 `server/index.js`，初始化 Express 应用，注册中间件（cors, json 解析），挂载路由，启动时自动创建 `server/data/` 和 `server/data/backups/` 目录，生产环境下静态托管 `dist/` 目录并处理前端路由 fallback
    - 2.2: 创建 `server/routes/trees.js`，实现五个族谱 CRUD 接口：GET 列表（扫描 data 目录返回摘要）、GET 单条（读取 JSON 文件）、POST 新建（uuid 生成 ID，写入 JSON）、PUT 更新（先备份当前版本再写入新数据，备份超 50 个自动清理）、DELETE 删除（同时删除对应备份目录）
    - 2.3: 在同一路由文件中实现四个备份管理接口：GET 备份列表（扫描备份目录按时间倒序）、GET 单个备份数据、POST 恢复备份（先备份当前版本再用备份内容覆盖）、DELETE 删除单个备份
    - 2.4: 启动后端服务 `node server/index.js`，用 curl 验证 GET /api/trees 返回空数组

- [x] 任务 3：配置 Vite 代理并创建前端 API 层
    - 3.1: 修改 `vite.config.js`，新增 `server.proxy` 配置将 `/api` 请求转发到 `http://localhost:3001`
    - 3.2: 创建 `src/api.js`，封装 fetchTrees、fetchTree、createTree、updateTree、deleteTree 五个族谱接口函数，以及 fetchBackups、fetchBackup、restoreBackup、deleteBackup 四个备份接口函数，统一错误处理抛出带消息的异常

- [x] 任务 4：改造 App.jsx 接入服务端存储与备份功能
    - 4.1: 新增状态（currentTreeId、treeList、showListModal、showBackupModal、backupList、isSaving、isLoading、toast 提示），新增 loadTreeList、loadTree、handleSave、handleSaveAs、handleNewTree、handleDeleteTree、loadBackups、handleRestore、handleDeleteBackup 等处理函数
    - 4.2: 改造顶部工具栏，新增「新建族谱」「打开族谱」「保存」「另存为」「历史备份」按钮，保存按钮显示 isSaving 状态，历史备份按钮仅 currentTreeId 存在时可用
    - 4.3: 实现族谱列表弹窗组件（showListModal 控制），展示标题和最后修改时间，支持点击加载和删除（含确认对话框）
    - 4.4: 实现备份列表弹窗组件（showBackupModal 控制），按时间倒序展示备份，支持「恢复此版本」（含确认）和「删除」操作
    - 4.5: 实现轻量 Toast 提示（保存成功/失败、加载成功/失败、恢复成功等），应用启动时自动弹出族谱列表弹窗让用户选择

- [x] 任务 5：同代水平对齐布局与代数标注
    - 5.1: 新建 `src/useTreeLayout.js` 自定义 Hook，遍历树计算最大深度（总代数），按层级收集每层所有节点，为每个节点记录 depth（第几世）和 parentId 信息，返回 `{ layers, maxDepth }` 结构
    - 5.2: 重构 `renderTree`，替换原有递归 UL/LI 渲染为逐层渲染方案：外层按层级（代）逐行排列，每行使用 flex 布局横向排列该层所有节点，确保同代成员严格在同一水平线上；通过 CSS 变量或内联样式控制每行固定高度，节点居中对齐
    - 5.3: 使用 SVG 或绝对定位 div 绘制父子连线，根据父节点和子节点的实际 DOM 位置（通过 ref 或 `getBoundingClientRect`）动态计算连线坐标，支持一对多分叉连线
    - 5.4: 在族谱内容区域左侧和右侧各渲染一列代数标注（"第一世""第二世"……"第N世"），与对应层级行精确垂直对齐，使用半透明背景和竖线辅助视觉定位，标注随画布缩放平移同步变换

- [x] 任务 6：完善图片导出功能，确保一比一还原页面展示
    - 6.1: 使用 `pnpm add html2canvas` 将 html2canvas 纳入本地依赖管理，移除 App.jsx 中 CDN 动态加载 script 的逻辑，改为 ES Module 静态 import
    - 6.2: 重写 `exportImage` 函数：导出前临时重置画布的 transform（scale=1, translate=0,0）使族谱内容以原始尺寸渲染，调用 html2canvas 时设置 `scale: 2`（高清）、`useCORS: true`、`backgroundColor: '#f9fafb'`，导出完成后恢复画布状态
    - 6.3: 确保导出范围为 `#family-tree-content` 整个族谱区域（包含标题、代数标注、所有节点及连线），导出图片完整无裁切，样式与页面展示完全一致

- [x] 任务 7：创建 PM2 配置文件并验证全流程
    - 7.1: 创建 `ecosystem.config.cjs`，配置应用名 family-tree、脚本路径 server/index.js、autorestart、max_memory_restart 300M、环境变量 NODE_ENV=production 和 PORT=3001
    - 7.2: 使用 `pnpm run dev` 同时启动前后端，在浏览器中验证新建族谱、编辑保存、打开加载、备份恢复、删除、代数对齐显示、图片导出等完整流程
    - 7.3: 执行 `pnpm run build` 构建前端，然后 `NODE_ENV=production node server/index.js` 验证生产模式下单进程同时提供 API 和静态页面
