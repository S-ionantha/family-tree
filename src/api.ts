import type { FamilyTree, TreeListItem, TreeNode, BackupListItem, BackupData } from './types';

const BASE = '/api/trees';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `请求失败 (${res.status})`);
  }
  return data as T;
}

// ============================================
// 族谱 CRUD
// ============================================

export function fetchTrees(): Promise<TreeListItem[]> {
  return request<TreeListItem[]>(BASE);
}

export function fetchTree(id: string): Promise<FamilyTree> {
  return request<FamilyTree>(`${BASE}/${id}`);
}

export function createTree(title: string, treeData: TreeNode): Promise<FamilyTree> {
  return request<FamilyTree>(BASE, {
    method: 'POST',
    body: JSON.stringify({ title, treeData }),
  });
}

export function updateTree(id: string, { title, treeData }: { title?: string; treeData?: TreeNode }): Promise<FamilyTree> {
  return request<FamilyTree>(`${BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, treeData }),
  });
}

export function deleteTree(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`${BASE}/${id}`, { method: 'DELETE' });
}

// ============================================
// 备份管理
// ============================================

export function fetchBackups(treeId: string): Promise<BackupListItem[]> {
  return request<BackupListItem[]>(`${BASE}/${treeId}/backups`);
}

export function fetchBackup(treeId: string, backupId: string): Promise<BackupData> {
  return request<BackupData>(`${BASE}/${treeId}/backups/${backupId}`);
}

export function restoreBackup(treeId: string, backupId: string): Promise<FamilyTree> {
  return request<FamilyTree>(`${BASE}/${treeId}/backups/${backupId}/restore`, {
    method: 'POST',
  });
}

export function deleteBackup(treeId: string, backupId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`${BASE}/${treeId}/backups/${backupId}`, {
    method: 'DELETE',
  });
}