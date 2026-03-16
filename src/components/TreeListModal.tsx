import React from 'react';
import type { TreeListItem } from '../types';

interface TreeListModalProps {
  treeList: TreeListItem[];
  isLoading: boolean;
  onLoad: (id: string) => void;
  onDelete: (item: TreeListItem) => void;
  onClose: () => void;
  onCreate: (useTemplate: boolean) => void;
}

export default function TreeListModal({ treeList, isLoading, onLoad, onDelete, onClose, onCreate }: TreeListModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="no-drag bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-[calc(100vw-2rem)] max-w-[520px] max-h-[85vh] flex flex-col border border-slate-200/50" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">我的族谱</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-xl leading-none transition-colors">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center text-slate-400 py-10 text-sm">加载中...</div>
          ) : treeList.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <p className="mb-2 text-sm">暂无已保存的族谱</p>
              <p className="text-xs text-slate-300">点击下方按钮创建第一棵族谱</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {treeList.map(item => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 border border-slate-100/80 transition-all cursor-pointer group" onClick={() => onLoad(item.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-700 truncate text-sm group-hover:text-indigo-600 transition-colors">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(item.updatedAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <button
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(item); }}
                    className="ml-3 text-slate-300 hover:text-red-500 text-xs shrink-0 transition-colors"
                    title="删除"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-slate-100 flex gap-2">
          <button onClick={() => onCreate(false)} className="flex-1 py-2.5 min-h-[44px] border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100 rounded-lg font-medium transition-all text-sm">
            新建空白族谱
          </button>
          <button onClick={() => onCreate(true)} className="flex-1 py-2.5 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg font-semibold transition-all shadow-sm shadow-indigo-200 text-sm">
            使用示例模板
          </button>
        </div>
      </div>
    </div>
  );
}
