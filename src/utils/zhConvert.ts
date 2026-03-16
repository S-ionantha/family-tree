import * as OpenCC from 'opencc-js';
import type { TreeNode } from '../types';

// 创建简→繁转换器 (中国大陆简体 → 台湾繁体)
const toTraditional = OpenCC.Converter({ from: 'cn', to: 'tw' });
// 创建繁→简转换器 (台湾繁体 → 中国大陆简体)
const toSimplified = OpenCC.Converter({ from: 'tw', to: 'cn' });

// 单个文本转换函数
export function convertText(text: string, toSimplified: boolean): string {
  if (!text) return text;
  const converter = toSimplified ? toSimplified : toTraditional;
  return converter(text);
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