import type { TreeNode } from '../types';

export const generateId = (): string => 'node-' + Math.random().toString(36).substr(2, 9);

export const updateNode = (tree: TreeNode, id: string, newData: Partial<TreeNode>): TreeNode => {
  if (tree.id === id) return { ...tree, ...newData };
  if (tree.children) {
    return { ...tree, children: tree.children.map(c => updateNode(c, id, newData)) };
  }
  return tree;
};

export const deleteNodeFromTree = (tree: TreeNode, id: string): TreeNode => {
  if (tree.children) {
    const filtered = tree.children.filter(c => c.id !== id);
    return { ...tree, children: filtered.map(c => deleteNodeFromTree(c, id)) };
  }
  return tree;
};

export const addChildNode = (tree: TreeNode, parentId: string): TreeNode => {
  if (tree.id === parentId) {
    const newChild: TreeNode = { id: generateId(), name: "新建成员", title: "", spouse: "", children: [] };
    return { ...tree, children: [...(tree.children || []), newChild] };
  }
  if (tree.children) {
    return { ...tree, children: tree.children.map(c => addChildNode(c, parentId)) };
  }
  return tree;
};
