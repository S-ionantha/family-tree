# 节点身份字段独立化

## 需求场景

当前族谱节点的 `name` 字段中混入了身份排行信息（如 `"长子 好宾"`、`"次子 佳林"`、`"三子 传勇"`），导致数据不规范、显示不灵活。需要为 TreeNode 新增独立的 `title`（身份）字段，将排行/身份信息与姓名彻底分离。

## 处理逻辑

- TreeNode 接口新增 `title?: string` 可选字段，用于存储"长子"、"次子"、"三子"等身份信息
- 初始模板数据中将混合在 name 里的身份信息拆分到 title 字段（如 `name: "长子 好宾"` → `title: "长子", name: "好宾"`）
- 节点卡片渲染时，若存在 title 则在姓名上方显示为小号标签
- 编辑面板新增"身份 / 排行"输入框
- 新建节点时 title 默认为空

## 影响文件

| 修改类型 | 文件路径 | 影响函数/区域 |
|---------|---------|-------------|
| 类型新增 | `src/types.ts` | TreeNode 接口 |
| 数据更新 | `src/App.tsx` | initialData 常量（约30+处 name 拆分） |
| 工具函数 | `src/App.tsx` | updateNode、addChildNode |
| 渲染逻辑 | `src/App.tsx` | renderNodeCard（卡片展示 title） |
| 编辑面板 | `src/App.tsx` | handleSaveNode + form 表单（新增 title 输入框） |
| 样式注入 | `src/App.tsx` | useEffect 中 `.node-title` 样式 |

## 实现细节

### 1. 类型定义 `src/types.ts`

```typescript
export interface TreeNode {
  id: string;
  name: string;
  title?: string;    // 新增：身份/排行，如"长子"、"次子"
  spouse?: string;
  children: TreeNode[];
}
```

### 2. 初始数据拆分示例

当前：
```typescript
{ id: 'node-zd-1', name: '长子 好宾', children: [...] }
```
改为：
```typescript
{ id: 'node-zd-1', title: '长子', name: '好宾', children: [...] }
```

需拆分的节点（共约24处）：
- 振铎分支：长子 好宾→佳树→传兴 / 铁良
- 振海分支：次子 好宽→佳林→传业 / 浩鹏  
- 振涛分支：三子 好宝→佳柱→传勇 / 博文
- 振斌分支：长子 好端→佳信→传仁 / 次子 好经→佳丽→传义
- 连孟分支：长子 效堂→好明 / 次子 效明→好清 / 三子 效文→好源 / 四子 效武 / 五子 效汤 / 六子 效胜

### 3. 节点卡片渲染

```tsx
<div className="node-card ...">
  {node.title && <div className="node-title">{node.title}</div>}
  <div className="node-name">{node.name}</div>
  {node.spouse && <div className="node-spouse">{node.spouse}</div>}
</div>
```

### 4. `.node-title` 样式

```css
.node-title {
  font-size: 0.65rem;
  color: #3b82f6;
  font-weight: 600;
  pointer-events: none;
  text-align: center;
  margin-bottom: 2px;
}
```

### 5. 编辑面板表单新增字段

在"姓名"输入框上方新增"身份 / 排行"输入框：
```tsx
<div>
  <label>身份 / 排行</label>
  <input name="title" defaultValue={selectedNode.title || ''} placeholder="例如：长子、次子" />
</div>
```

### 6. handleSaveNode 更新

```typescript
const updates: Partial<TreeNode> = {
  title: formData.get('title') as string || undefined,
  name: formData.get('name') as string,
  spouse: formData.get('spouse') as string
};
```

## 边界条件

- `title` 为可选字段，空值或不填时节点卡片不显示身份标签
- 已保存的旧数据无 title 字段，读取时自动兼容（可选字段不影响反序列化）
- 新建节点时 title 默认为空字符串

## 预期成果

- 身份排行信息从 name 中独立为 title 字段
- 节点卡片可视化显示身份标签（蓝色小字）
- 编辑面板支持独立编辑身份字段
- 旧数据向后兼容