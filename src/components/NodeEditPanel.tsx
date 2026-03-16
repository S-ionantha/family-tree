import React, { useRef, useCallback, useState } from 'react';
import type { TreeNode } from '../types';

interface NodeEditPanelProps {
  selectedNode: TreeNode;
  onClose: () => void;
  onSaveNode: (e: React.FormEvent<HTMLFormElement>) => void;
  onAddChild: () => void;
  onDelete: () => void;
  onMoveSibling: (direction: 'left' | 'right') => void;
}

export default function NodeEditPanel({
  selectedNode,
  onClose,
  onSaveNode,
  onAddChild,
  onDelete,
  onMoveSibling,
}: NodeEditPanelProps) {
  // --- 下滑关闭手势状态 ---
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingDrawer = useRef(false);

  const CLOSE_THRESHOLD = 80; // 下滑超过 80px 关闭

  const handleDrawerTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollEl = scrollContainerRef.current;
    // 仅在滚动到顶部时允许下滑关闭
    const isAtTop = !scrollEl || scrollEl.scrollTop <= 0;
    if (isAtTop) {
      touchStartY.current = e.touches[0].clientY;
      isDraggingDrawer.current = false;
    } else {
      touchStartY.current = null;
    }
  }, []);

  const handleDrawerTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    // 只处理向下滑
    if (deltaY > 0) {
      isDraggingDrawer.current = true;
      setDragOffsetY(deltaY);
      // 阻止内部滚动
      e.preventDefault();
    } else {
      // 向上滑恢复正常滚动
      isDraggingDrawer.current = false;
      setDragOffsetY(0);
    }
  }, []);

  const handleDrawerTouchEnd = useCallback(() => {
    if (isDraggingDrawer.current && dragOffsetY > CLOSE_THRESHOLD) {
      onClose();
    }
    setDragOffsetY(0);
    touchStartY.current = null;
    isDraggingDrawer.current = false;
  }, [dragOffsetY, onClose]);

  return (
    <>
      {/* 移动端遮罩层 */}
      <div
        className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[19] animate-fade-in"
        onClick={onClose}
      />

      {/* 面板主体 */}
      <div
        className={
          "no-drag absolute bg-white/95 backdrop-blur-sm border-slate-200/60 shadow-2xl flex flex-col z-20 " +
          /* 移动端：底部抽屉 */
          "inset-x-0 bottom-0 max-h-[70vh] rounded-t-2xl border-t animate-slide-up " +
          /* 桌面端：右侧面板 */
          "md:right-0 md:top-0 md:bottom-0 md:left-auto md:w-80 md:max-h-none md:rounded-none md:border-t-0 md:border-l md:animate-slide-in"
        }
        style={
          // 下滑手势拖拽时实时偏移
          dragOffsetY > 0
            ? { transform: `translateY(${dragOffsetY}px)`, transition: 'none' }
            : undefined
        }
        onTouchStart={handleDrawerTouchStart}
        onTouchMove={handleDrawerTouchMove}
        onTouchEnd={handleDrawerTouchEnd}
      >
        {/* 移动端拖拽指示条 */}
        <div className="md:hidden flex justify-center pt-2 pb-1 cursor-grab">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* 头部 */}
        <div className="px-5 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">编辑节点</h2>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 active:text-slate-600 transition-colors p-1 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div ref={scrollContainerRef} className="p-5 flex-1 overflow-y-auto overscroll-contain">
          <form onSubmit={onSaveNode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">身份 / 排行</label>
              <input
                name="title"
                defaultValue={selectedNode.title || ''}
                key={`title-${selectedNode.id}`}
                className="w-full px-3 py-2 min-h-[44px] border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                placeholder="例如：长子、次子"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">姓名 / 称呼</label>
              <input
                name="name"
                defaultValue={selectedNode.name}
                key={`name-${selectedNode.id}`}
                className="w-full px-3 py-2 min-h-[44px] border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                placeholder="例如：孙守禄"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">配偶 / 备注</label>
              <input
                name="spouse"
                defaultValue={selectedNode.spouse || ''}
                key={`spouse-${selectedNode.id}`}
                className="w-full px-3 py-2 min-h-[44px] border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                placeholder="例如：元配张氏"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg font-semibold transition-all shadow-sm shadow-indigo-200 text-sm"
            >
              保存修改
            </button>
          </form>

          <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">节点操作</h3>
            <button
              onClick={onAddChild}
              className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] px-4 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-all text-sm font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              添加子嗣
            </button>

            {selectedNode.id !== 'root' && (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={() => onMoveSibling('left')}
                    className="flex-1 flex items-center justify-center gap-1 py-2.5 min-h-[44px] px-3 border border-slate-200 text-slate-600 bg-white rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-all text-sm"
                    title="向左移动 (排在兄长前面)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    左移
                  </button>
                  <button
                    onClick={() => onMoveSibling('right')}
                    className="flex-1 flex items-center justify-center gap-1 py-2.5 min-h-[44px] px-3 border border-slate-200 text-slate-600 bg-white rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-all text-sm"
                    title="向右移动 (排在弟妹后面)"
                  >
                    右移
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>

                <button
                  onClick={onDelete}
                  className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] px-4 border border-red-200/60 text-red-500 bg-white rounded-lg hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-all text-sm mt-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  删除该节点及子分支
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}