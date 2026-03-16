import { tify, sify } from 'chinese-conv';
import type { TreeNode } from '../types';

// 单个文本转换函数
function convertText(text: string, toSimplified: boolean): string {
  if (!text) return text;
  return toSimplified ? sify(text) : tify(text);
}

// 递归转换整个树节点
export function convertTreeNode(node: TreeNode, toSimplified: boolean): TreeNode {
  return {
    ...node,
    name: convertText(node.name, toSimplified),
    title: node.title ? convertText(node.title, toSimplified) : undefined,
    spouse: node.spouse ? convertText(node.spouse, toSimplified) : undefined,
    children: node.children?.map(child => convertTreeNode(child, toSimplified)) || []
  };
}

// 转换标题
export function convertTitle(title: string, toSimplified: boolean): string {
  return convertText(title, toSimplified);
}