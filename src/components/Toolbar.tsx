import React, { useState, useEffect, useRef } from 'react';

interface ToolbarProps {
  treeTitle: string;
  currentTreeId: string | null;
  isSaving: boolean;
  onOpenList: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onLoadBackups: () => void;
  onResetView: () => void;
  onExportImage: () => void;
  onExportJSON: () => void;
}

export default function Toolbar({
  treeTitle,
  currentTreeId,
  isSaving,
  onOpenList,
  onSave,
  onSaveAs,
  onLoadBackups,
  onResetView,
  onExportImage,
  onExportJSON,
}: ToolbarProps) {
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // 点击外部区域关闭下拉菜单
  useEffect(() => {
    if (!showMore) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMore]);

  const handleMenuItem = (action: () => void) => {
    action();
    setShowMore(false);
  };

  return (
    <header className="no-drag bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-3 md:px-6 py-2 md:py-3 flex justify-between items-center gap-2 md:gap-6 z-20 shrink-0">
      {/* 标题区域 */}
      <div className="shrink-0 min-w-0">
        <h1 className="text-base md:text-xl font-bold text-slate-800 tracking-tight">家族族谱编辑器</h1>
        <p className="hidden md:block text-xs text-slate-400 break-words mt-0.5">
          {currentTreeId ? `正在编辑：${treeTitle}` : '未保存的新族谱'} · 拖拽移动 · 滚轮缩放 · 点击编辑
        </p>
        {/* 移动端简化提示 */}
        <p className="md:hidden text-[10px] text-slate-400 truncate mt-0.5">
          {currentTreeId ? treeTitle : '未保存'}
        </p>
      </div>

      {/* 按钮区域 */}
      <div className="flex gap-1 md:gap-1.5 items-center shrink-0">
        {/* 核心按钮：打开 & 保存 —— 始终可见 */}
        <button
          onClick={onOpenList}
          className="px-2 md:px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-all text-sm font-medium min-h-[36px]"
        >
          📂 <span className="hidden sm:inline">打开</span>
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-3 md:px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 rounded-lg text-white font-semibold transition-all shadow-sm shadow-indigo-200 text-sm min-h-[36px]"
        >
          {isSaving ? '...' : '💾'} <span className="hidden sm:inline">{isSaving ? '保存中' : '保存'}</span>
        </button>

        {/* ===== 桌面端：完整按钮行 ===== */}
        <div className="hidden md:flex gap-1.5 items-center">
          <button onClick={onSaveAs} disabled={isSaving} className="px-3 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:border-slate-200 disabled:text-slate-400 rounded-lg font-medium transition-all text-sm">
            📋 另存为
          </button>
          <button
            onClick={onLoadBackups}
            disabled={!currentTreeId}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 rounded-lg font-medium transition-all text-sm"
          >
            🕐 备份
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button onClick={onResetView} className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm">
            重置视图
          </button>
          <button id="export-img-btn" onClick={onExportImage} className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm">
            导出图片
          </button>
          <button onClick={onExportJSON} className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm">
            导出 JSON
          </button>
        </div>

        {/* ===== 移动端：更多菜单 ===== */}
        <div className="relative md:hidden" ref={moreRef}>
          <button
            onClick={() => setShowMore(!showMore)}
            className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-all text-sm font-medium min-h-[36px]"
          >
            ⋯
          </button>
          {showMore && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-fade-in">
              <button
                onClick={() => handleMenuItem(onSaveAs)}
                disabled={isSaving}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-300 transition-colors"
              >
                📋 另存为
              </button>
              <button
                onClick={() => handleMenuItem(onLoadBackups)}
                disabled={!currentTreeId}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-300 transition-colors"
              >
                🕐 备份
              </button>
              <div className="h-px bg-slate-100 my-1 mx-3"></div>
              <button
                onClick={() => handleMenuItem(onResetView)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                重置视图
              </button>
              <button
                id="export-img-btn"
                onClick={() => handleMenuItem(onExportImage)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                导出图片
              </button>
              <button
                onClick={() => handleMenuItem(onExportJSON)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                导出 JSON
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}