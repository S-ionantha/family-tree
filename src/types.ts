// 族谱节点
export interface TreeNode {
  id: string;
  name: string;
  title?: string;    // 身份/排行，如"长子"、"次子"
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