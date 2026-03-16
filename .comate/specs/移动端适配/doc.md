# 移动端适配

## 概述
为家族族谱编辑器增加移动端适配能力，使其在手机和平板浏览器上也能流畅使用。核心目标是：在不改变桌面端体验的前提下，通过响应式布局、触控支持和组件形态调整，让移动设备用户能够浏览、编辑族谱。

---

## 1. 顶部工具栏响应式改造

### 场景与处理逻辑
桌面端工具栏一行排列所有按钮（打开、保存、另存为、备份、重置视图、导出图片、导出JSON），移动端屏幕宽度不足以容纳所有按钮。

移动端方案：
- 标题区域简化，仅显示应用名称（省略操作提示文字）
- 保留核心按钮（打开、保存）直接可见
- 其余按钮（另存为、备份、重置视图、导出图片、导出JSON）收纳到一个"更多"下拉菜单中
- 按钮文字在极窄屏幕下可只保留 emoji 图标

### 影响文件
| 修改类型 | 文件路径 | 影响的函数/组件 |
|---------|---------|---------------|
| 改造 | `src/components/Toolbar.tsx` | `Toolbar` 组件整体 |

### 实现细节

**Toolbar.tsx** 增加移动端下拉菜单：

```tsx
// 新增状态
const [showMore, setShowMore] = useState(false);

// 移动端 (<md) 只展示核心按钮 + 更多菜单
// 桌面端 (>=md) 保持原有布局不变
<header className="... px-4 md:px-6 py-2 md:py-3 ...">
  <div className="shrink-0 min-w-0">
    <h1 className="text-lg md:text-xl ...">家族族谱编辑器</h1>
    <p className="hidden md:block text-xs ...">
      {/* 操作提示仅桌面可见 */}
    </p>
  </div>
  <div className="flex gap-1.5 items-center">
    {/* 核心按钮始终可见 */}
    <button onClick={onOpenList}>📂</button>
    <button onClick={onSave}>💾</button>
    
    {/* 桌面端完整按钮 */}
    <div className="hidden md:flex gap-1.5 items-center">
      {/* 另存为、备份、分隔线、重置视图、导出图片、导出JSON */}
    </div>
    
    {/* 移动端更多菜单 */}
    <div className="relative md:hidden">
      <button onClick={() => setShowMore(!showMore)}>⋯</button>
      {showMore && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border ...">
          {/* 竖排菜单项 */}
        </div>
      )}
    </div>
  </div>
</header>
```

### 边界条件
- 点击菜单外区域应关闭下拉菜单
- 点击菜单项后自动关闭菜单

---

## 2. 画布触控交互支持

### 场景与处理逻辑
当前画布仅支持鼠标事件（mousedown/mousemove/mouseup + wheel），移动端需要支持：
- **单指拖拽**：移动画布视图
- **双指捏合**：缩放画布

### 影响文件
| 修改类型 | 文件路径 | 影响的函数/组件 |
|---------|---------|---------------|
| 改造 | `src/hooks/useCanvasInteraction.ts` | `useCanvasInteraction` hook |
| 改造 | `src/components/TreeCanvas.tsx` | `TreeCanvas` 组件（绑定 touch 事件） |

### 实现细节

**useCanvasInteraction.ts** 新增触控处理：

```ts
// 新增触控状态
const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
const lastPinchDistRef = useRef<number | null>(null);

const handleTouchStart = useCallback((e: React.TouchEvent) => {
  if ((e.target as HTMLElement).closest('.no-drag')) return;
  if (e.touches.length === 1) {
    // 单指拖拽
    lastTouchRef.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
    setIsDragging(true);
  } else if (e.touches.length === 2) {
    // 双指捏合开始
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    lastPinchDistRef.current = dist;
  }
}, [position]);

const handleTouchMove = useCallback((e: React.TouchEvent) => {
  e.preventDefault(); // 阻止页面滚动
  if (e.touches.length === 1 && lastTouchRef.current) {
    setPosition({
      x: e.touches[0].clientX - lastTouchRef.current.x,
      y: e.touches[0].clientY - lastTouchRef.current.y,
    });
  } else if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const delta = (dist - lastPinchDistRef.current) * 0.005;
    setScale(prev => Math.min(Math.max(0.2, prev + delta), 3));
    lastPinchDistRef.current = dist;
  }
}, []);

const handleTouchEnd = useCallback(() => {
  setIsDragging(false);
  lastTouchRef.current = null;
  lastPinchDistRef.current = null;
}, []);
```

**TreeCanvas.tsx** 绑定 touch 事件：

```tsx
<div
  ref={containerRef}
  onMouseDown={onMouseDown}
  onMouseMove={onMouseMove}
  onMouseUp={onMouseUp}
  onMouseLeave={onMouseUp}
  onTouchStart={onTouchStart}
  onTouchMove={onTouchMove}
  onTouchEnd={onTouchEnd}
  className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative touch-none"
>
```

注意 `touch-none` CSS 类阻止浏览器默认触控行为（如页面缩放、滚动）。

### 边界条件
- 触控事件需调用 `e.preventDefault()` 防止页面跟随滚动
- 捏合缩放与单指拖拽之间的切换要平滑（2指变1指时不应突然跳动位置）
- 画布区域需加 `touch-action: none` 阻止浏览器手势

---

## 3. 节点编辑面板底部抽屉化

### 场景与处理逻辑
桌面端编辑面板从右侧滑出（w-80, 320px），移动端屏幕宽度不足以同时显示画布和面板。

移动端方案：编辑面板改为从底部滑出的抽屉（bottom sheet），占屏幕宽度100%，最大高度约70vh。

### 影响文件
| 修改类型 | 文件路径 | 影响的函数/组件 |
|---------|---------|---------------|
| 改造 | `src/components/NodeEditPanel.tsx` | `NodeEditPanel` 组件 |
| 改造 | `src/styles/treeStyles.ts` | 动画 keyframes |

### 实现细节

**NodeEditPanel.tsx** 响应式布局：

```tsx
// 桌面端：右侧面板（保持不变）
// 移动端：底部抽屉
<div className="
  no-drag absolute z-20 bg-white/95 backdrop-blur-sm border-slate-200/60 shadow-2xl flex flex-col
  /* 移动端：底部抽屉 */
  inset-x-0 bottom-0 max-h-[70vh] rounded-t-2xl border-t
  /* 桌面端：右侧面板 */
  md:right-0 md:top-0 md:bottom-0 md:left-auto md:w-80 md:max-h-none md:rounded-t-none md:rounded-none md:border-l md:border-t-0
  animate-slide-up md:animate-slide-in
">
  {/* 移动端拖拽指示条 */}
  <div className="md:hidden flex justify-center py-2">
    <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
  </div>
  {/* ... 其余内容不变 ... */}
</div>
```

**treeStyles.ts** 新增底部滑入动画：

```ts
@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
.animate-slide-up { animation: slide-up 0.3s ease-out; }
```

### 边界条件
- 底部面板不应超过视口高度的70%
- 面板内内容过多时可滚动

---

## 4. 弹窗组件响应式适配

### 场景与处理逻辑
`TreeListModal` 和 `BackupListModal` 当前使用固定宽度 `w-[520px]`，移动端会溢出屏幕。

### 影响文件
| 修改类型 | 文件路径 | 影响的函数/组件 |
|---------|---------|---------------|
| 改造 | `src/components/TreeListModal.tsx` | `TreeListModal` 组件 |
| 改造 | `src/components/BackupListModal.tsx` | `BackupListModal` 组件 |

### 实现细节

将弹窗的固定宽度改为响应式：

```tsx
// 旧
className="... w-[520px] max-h-[70vh] ..."

// 新：移动端全宽带边距，桌面端保持 520px
className="... w-[calc(100vw-2rem)] max-w-[520px] max-h-[80vh] mx-4 md:mx-0 ..."
```

两个弹窗都做同样的调整。

### 边界条件
- 小屏幕下弹窗应留有左右 1rem 的安全边距
- 弹窗内列表区域保持可滚动

---

## 5. 全局样式与安全区适配

### 场景与处理逻辑
iOS Safari 等浏览器有安全区域（notch、底部指示条），需要适配。同时禁止移动端页面整体缩放干扰画布操作。

### 影响文件
| 修改类型 | 文件路径 | 影响的函数/组件 |
|---------|---------|---------------|
| 改造 | `index.html` | viewport meta |
| 改造 | `src/index.css` | 全局样式 |

### 实现细节

**index.html** 更新 viewport meta：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

**index.css** 增加安全区和移动端基础样式：

```css
/* 防止 iOS 上 pull-to-refresh 和橡皮筋滚动 */
html, body {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

/* 安全区适配 */
#root {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 边界条件
- `user-scalable=no` 和 `maximum-scale=1.0` 防止双击/双指缩放页面（画布有自己的缩放逻辑）
- 安全区 padding 不应影响弹窗的 `fixed` 定位

---

## 预期成果
- 移动端（<768px）工具栏按钮收纳为精简布局 + 更多菜单
- 画布支持单指拖拽和双指捏合缩放
- 节点编辑面板在移动端以底部抽屉形式展示
- 弹窗在小屏幕下自适应宽度
- iOS/Android 浏览器安全区正确适配，无意外的页面缩放行为
- 桌面端体验完全不受影响