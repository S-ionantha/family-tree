# 移动端适配 — 完成总结

## 修改概览

本次迭代为家族族谱编辑器增加了全面的移动端适配能力，在完全保留桌面端体验的前提下，让手机和平板用户也能流畅浏览和编辑族谱。

## 变更文件清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `index.html` | 修改 | viewport meta 增加 `maximum-scale=1.0, user-scalable=no, viewport-fit=cover`，防止页面缩放并适配安全区 |
| `src/App.css` | 修改 | `#root` 增加安全区 padding 和 `100dvh` 高度 |
| `src/index.css` | 修改 | `html, body` 增加 `overscroll-behavior: none` 防止橡皮筋滚动 |
| `src/styles/treeStyles.ts` | 修改 | 新增 `slide-up` 动画 keyframes 和 `.animate-slide-up` 类 |
| `src/hooks/useCanvasInteraction.ts` | 修改 | 新增 `handleTouchStart`、`handleTouchMove`、`handleTouchEnd` 三个触控事件处理器，支持单指拖拽和双指捏合缩放 |
| `src/components/TreeCanvas.tsx` | 修改 | 新增 touch 事件 props 绑定，画布容器添加 `touch-none` 类 |
| `src/App.tsx` | 修改 | 将 touch 事件处理器从 canvas hook 传递给 `TreeCanvas` |
| `src/components/Toolbar.tsx` | 重写 | 改为有状态组件：移动端核心按钮(打开/保存)始终可见，其余功能收入"更多⋯"下拉菜单；桌面端保持原有横排不变 |
| `src/components/NodeEditPanel.tsx` | 重写 | 移动端改为底部抽屉（含遮罩层、拖拽指示条、下滑手势关闭、滚动隔离），所有可交互元素保证 44px 最小触控区域；桌面端保持右侧面板不变 |
| `src/components/TreeListModal.tsx` | 修改 | 弹窗宽度改为 `w-[calc(100vw-2rem)] max-w-[520px]`，高度改为 `max-h-[85vh]`，按钮增加触控友好的最小高度 |
| `src/components/BackupListModal.tsx` | 修改 | 同 TreeListModal 的响应式宽度和高度调整 |

## 适配要点

### 1. 全局基础设施
- 禁止浏览器级别的双指/双击缩放（画布有自己的缩放逻辑）
- iOS 安全区（notch、底部指示条）通过 `env(safe-area-inset-*)` 适配
- 防止 iOS Safari 的橡皮筋滚动干扰画布操作

### 2. 画布触控
- 单指拖拽平移画布，双指捏合缩放
- 双指切单指时不会出现位置跳动
- 画布区域设置 `touch-action: none` 隔离浏览器默认手势

### 3. 工具栏
- **移动端 (<768px)**：精简为"打开"+"保存"两个核心按钮 + "⋯"更多菜单
- **桌面端 (≥768px)**：完全保持原有横排布局，无任何视觉变化
- 所有功能一个不少，全部可通过菜单访问

### 4. 编辑面板
- **移动端**：从底部滑出的抽屉样式，半透明遮罩，点击遮罩或下滑超过 80px 关闭
- 内容滚动与关闭手势智能隔离——仅在内容滚动到顶部时下滑才触发关闭
- 所有输入框和按钮最小高度 44px，符合 Apple HIG 触控标准

### 5. 弹窗
- 小屏自适应宽度（左右各留 1rem 安全边距），大屏保持 520px
- 最大高度提升至 85vh，确保列表在小屏上有充足可视空间

## 验证结果
- ✅ `pnpm run build` 构建成功（0 错误）
- ✅ `tsc --noEmit` TypeScript 类型检查通过
- ✅ 桌面端布局和交互无任何回归变化