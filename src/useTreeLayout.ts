import { useMemo } from 'react';
import type { TreeNode } from './types';

export const NODE_W = 130;
export const NODE_H = 80;
export const H_GAP = 20;
export const V_GAP = 50;
export const LEVEL_H = NODE_H + V_GAP;
export const LABEL_W = 76;

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  depth: number;
  node: TreeNode;
}

interface ChildInfo {
  x: number;
  topY: number;
}

export interface Connection {
  parentX: number;
  parentBottomY: number;
  childrenInfo: ChildInfo[];
  midY: number;
}

export interface LayoutResult {
  positions: NodePosition[];
  connections: Connection[];
  maxDepth: number;
  totalWidth: number;
  totalHeight: number;
}

/**
 * 计算节点子树的横向占用宽度
 */
function calcSubtreeWidth(node: TreeNode): number {
  if (!node.children || node.children.length === 0) {
    return NODE_W;
  }
  const childrenWidth = node.children.reduce((sum: number, child: TreeNode) => sum + calcSubtreeWidth(child), 0);
  const gaps = (node.children.length - 1) * H_GAP;
  return Math.max(NODE_W, childrenWidth + gaps);
}

/**
 * 将数字转为中文世代标注："第一世"、"第二世"……
 */
export function toGenerationLabel(num: number): string {
  const NUMS = [
    '', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ];
  const label = num < NUMS.length ? NUMS[num] : String(num);
  return `第${label}世`;
}

/**
 * 自定义 Hook：计算族谱树的绝对定位布局
 */
export default function useTreeLayout(treeData: TreeNode): LayoutResult {
  return useMemo(() => {
    const positions: NodePosition[] = [];
    const connections: Connection[] = [];
    let maxDepth = 0;

    function traverse(node: TreeNode, depth: number, leftEdge: number): void {
      const subtreeWidth = calcSubtreeWidth(node);
      const x = leftEdge + subtreeWidth / 2;
      const y = depth * LEVEL_H;
      maxDepth = Math.max(maxDepth, depth);

      positions.push({ id: node.id, x, y, depth, node });

      if (node.children && node.children.length > 0) {
        const childrenInfo: ChildInfo[] = [];
        const childrenTotalWidth = node.children.reduce((sum: number, c: TreeNode) => sum + calcSubtreeWidth(c), 0)
          + (node.children.length - 1) * H_GAP;

        let childLeft = leftEdge;
        if (childrenTotalWidth < subtreeWidth) {
          childLeft = leftEdge + (subtreeWidth - childrenTotalWidth) / 2;
        }

        for (const child of node.children) {
          const childSubWidth = calcSubtreeWidth(child);
          const childX = childLeft + childSubWidth / 2;
          const childY = (depth + 1) * LEVEL_H;
          childrenInfo.push({ x: childX, topY: childY });
          traverse(child, depth + 1, childLeft);
          childLeft += childSubWidth + H_GAP;
        }

        connections.push({
          parentX: x,
          parentBottomY: y + NODE_H,
          childrenInfo,
          midY: y + NODE_H + V_GAP / 2
        });
      }
    }

    traverse(treeData, 0, 0);

    const totalWidth = calcSubtreeWidth(treeData);
    const totalHeight = (maxDepth + 1) * LEVEL_H;

    return { positions, connections, maxDepth, totalWidth, totalHeight };
  }, [treeData]);
}