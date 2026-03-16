# 家族族谱编辑器移动端全功能适配

- [x] 任务 1：全局基础设施——viewport meta、安全区、防缩放样式
    - 1.1: 修改 `index.html` 中 viewport meta 标签，添加 `maximum-scale=1.0, user-scalable=no, viewport-fit=cover`
    - 1.2: 修改 `src/index.css`，添加 `overscroll-behavior: none` 防止橡皮筋滚动，添加 `#root` 安全区 padding
    - 1.3: 在 `src/styles/treeStyles.ts` 中新增底部滑入动画 `slide-up` 的 keyframes 定义

- [x] 任务 2：画布触控交互——单指拖拽与双指捏合缩放
    - 2.1: 在 `src/hooks/useCanvasInteraction.ts` 中新增 `lastTouchRef`、`lastPinchDistRef` 两个 ref，实现 `handleTouchStart`、`handleTouchMove`、`handleTouchEnd` 三个回调函数
    - 2.2: 更新 hook 返回值，导出三个 touch 事件处理器
    - 2.3: 修改 `src/components/TreeCanvas.tsx`，新增 props 定义（`onTouchStart`、`onTouchMove`、`onTouchEnd`），在画布容器上绑定 touch 事件，添加 `touch-none` Tailwind 类
    - 2.4: 修改 `src/App.tsx`，将 touch 事件处理器从 canvas hook 传递给 `TreeCanvas` 组件

- [x] 任务 3：顶部工具栏响应式改造——保留全部功能的精简布局
    - 3.1: 将 `Toolbar` 改为有状态组件，新增 `showMore` 状态控制下拉菜单显隐
    - 3.2: 移动端（<md）标题区域简化：隐藏操作提示文字，缩小字号和内边距
    - 3.3: 移动端核心按钮（打开、保存）始终可见，其余按钮（另存为、备份、重置视图、导出图片、导出JSON）收入"更多⋯"下拉菜单
    - 3.4: 桌面端（≥md）保持原有横排布局完全不变
    - 3.5: 下拉菜单点击外部区域自动关闭，点击菜单项后自动关闭

- [x] 任务 4：节点编辑面板底部抽屉化（保证移动端良好的可交互性）
    - 4.1: 修改 `src/components/NodeEditPanel.tsx` 的容器样式：移动端从底部滑出（`inset-x-0 bottom-0 max-h-[70vh] rounded-t-2xl`），桌面端保持右侧面板不变（`md:right-0 md:top-0 md:bottom-0 md:w-80`）
    - 4.2: 移动端增加半透明背景遮罩层，点击遮罩可关闭面板；桌面端无遮罩（保持原有行为）
    - 4.3: 移动端面板顶部添加拖拽指示条（灰色横杠），支持下滑手势关闭抽屉（touchstart/touchmove 检测下滑距离超过阈值时触发关闭）；桌面端隐藏指示条
    - 4.4: 面板内表单输入框和所有按钮确保最小触控区域 44px 高度（移动端 `min-h-[44px]`），间距适当放大便于手指操作
    - 4.5: 抽屉内部滚动与下滑关闭手势隔离：仅在内容滚动到顶部时下滑才触发关闭，避免正常滚动被误判
    - 4.6: 使用新增的 `animate-slide-up` 动画类替代移动端的 `animate-slide-in`

- [x] 任务 5：弹窗组件响应式宽度适配
    - 5.1: 修改 `src/components/TreeListModal.tsx`，将 `w-[520px]` 改为 `w-[calc(100vw-2rem)] max-w-[520px]`，确保小屏有安全边距
    - 5.2: 修改 `src/components/BackupListModal.tsx`，同样的宽度响应式处理
    - 5.3: 弹窗内最大高度调整为 `max-h-[85vh]`，保证小屏幕上列表区域有足够的可视空间

- [x] 任务 6：整体验证与细节修复
    - 6.1: 启动开发服务器，使用浏览器移动端模拟器检查各组件在 375px（iPhone SE）、390px（iPhone 14）、768px（iPad）宽度下的表现
    - 6.2: 确认桌面端（≥1024px）体验无任何回归变化
    - 6.3: 修复发现的样式溢出、交互异常等问题
