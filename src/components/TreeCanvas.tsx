import React from 'react';
import type { TreeNode } from '../types';
import type { NodePosition, Connection } from '../useTreeLayout';
import { NODE_W, NODE_H, LABEL_W, LEVEL_H, toGenerationLabel } from '../useTreeLayout';

interface TreeCanvasProps {
  treeTitle: string;
  positions: NodePosition[];
  connections: Connection[];
  maxDepth: number;
  totalWidth: number;
  totalHeight: number;
  selectedNodeId: string | null;
  scale: number;
  position: { x: number; y: number };
  isDragging: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: () => void;
  onSelectNode: (node: TreeNode) => void;
  onMoveNode: (draggedId: string, targetId: string) => void;
  onTitleChange: (title: string) => void;
}

export default function TreeCanvas({
  treeTitle,
  positions,
  connections,
  maxDepth,
  totalWidth,
  totalHeight,
  selectedNodeId,
  scale,
  position,
  isDragging,
  containerRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onSelectNode,
  onMoveNode,
  onTitleChange,
}: TreeCanvasProps) {

  const renderNodeCard = (pos: NodePosition) => {
    const { id, x, y, node } = pos;
    return (
      <div
        key={id}
        className={`node-card no-drag ${selectedNodeId === id ? 'selected' : ''}`}
        style={{ left: LABEL_W + x - NODE_W / 2, top: y }}
        draggable={id !== 'root'}
        onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
          e.dataTransfer.setData('nodeId', id);
          (e.target as HTMLElement).style.opacity = '0.4';
        }}
        onDragEnd={(e: React.DragEvent<HTMLDivElement>) => { (e.target as HTMLElement).style.opacity = '1'; }}
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
        onDragLeave={(e: React.DragEvent<HTMLDivElement>) => { e.currentTarget.classList.remove('drag-over'); }}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.classList.remove('drag-over');
          const draggedId = e.dataTransfer.getData('nodeId');
          if (draggedId) onMoveNode(draggedId, id);
        }}
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSelectNode(node); }}
      >
        <div className="node-title" style={node.title ? undefined : { visibility: 'hidden' }}>{node.title || '\u00A0'}</div>
        <div className="node-name">{node.name}</div>
        <div className="node-spouse" style={node.spouse ? undefined : { visibility: 'hidden', borderTop: 'none' }} title={node.spouse || ''}>{node.spouse || '\u00A0'}</div>
      </div>
    );
  };

  const renderConnections = () => {
    const fullW = LABEL_W * 2 + totalWidth;
    return (
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: fullW, height: totalHeight, pointerEvents: 'none' }}
      >
        {connections.map((conn: Connection, i: number) => {
          const px = LABEL_W + conn.parentX;
          const lines: React.ReactElement[] = [];
          lines.push(
            <line key={`v-${i}`} x1={px} y1={conn.parentBottomY} x2={px} y2={conn.midY}
              stroke="#c7d2fe" strokeWidth="1.5" />
          );
          if (conn.childrenInfo.length > 1) {
            const xs = conn.childrenInfo.map(c => LABEL_W + c.x);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            lines.push(
              <line key={`h-${i}`} x1={minX} y1={conn.midY} x2={maxX} y2={conn.midY}
                stroke="#c7d2fe" strokeWidth="1.5" />
            );
          }
          conn.childrenInfo.forEach((child, j) => {
            const cx = LABEL_W + child.x;
            lines.push(
              <line key={`c-${i}-${j}`} x1={cx} y1={conn.midY} x2={cx} y2={child.topY}
                stroke="#c7d2fe" strokeWidth="1.5" />
            );
          });
          return <g key={i}>{lines}</g>;
        })}
      </svg>
    );
  };

  const renderGenerationLabels = () => {
    const labels: React.ReactElement[] = [];
    for (let d = 0; d <= maxDepth; d++) {
      const y = d * LEVEL_H;
      labels.push(
        <div key={`stripe-${d}`} className="gen-stripe"
          style={{ top: y, width: totalWidth, left: LABEL_W }} />
      );
      labels.push(
        <div key={`left-${d}`} className="gen-label" style={{ left: 0, top: y }}>
          {toGenerationLabel(d + 1)}
        </div>
      );
      labels.push(
        <div key={`right-${d}`} className="gen-label" style={{ left: LABEL_W + totalWidth, top: y }}>
          {toGenerationLabel(d + 1)}
        </div>
      );
    }
    return labels;
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative touch-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* 背景网格 */}
      <div className="absolute inset-0 pointer-events-none opacity-30" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 0.5px, transparent 0.5px)', backgroundSize: '24px 24px', transform: `scale(${scale})`, transformOrigin: '0 0', backgroundPosition: `${position.x}px ${position.y}px` }}></div>
      
      <div 
        className="absolute origin-top"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <div id="family-tree-content" style={{ padding: 40, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: 'max-content' }}>
          <h2 
            className="text-2xl font-bold text-slate-700 mb-8 tracking-[0.15em] outline-none border-b-2 border-transparent hover:border-slate-300 focus:border-indigo-400 transition-colors cursor-text px-4 py-2"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e: React.FocusEvent<HTMLHeadingElement>) => onTitleChange(e.currentTarget.innerText)}
            title="点击即可编辑标题"
          >
            {treeTitle}
          </h2>
          <div style={{ position: 'relative', width: LABEL_W * 2 + totalWidth, height: totalHeight }}>
            {renderGenerationLabels()}
            {renderConnections()}
            {positions.map(renderNodeCard)}
          </div>
        </div>
      </div>
    </div>
  );
}
