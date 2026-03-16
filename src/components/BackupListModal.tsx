import React from 'react';
import type { BackupListItem } from '../types';

interface BackupListModalProps {
  backupList: BackupListItem[];
  isLoading: boolean;
  onRestore: (item: BackupListItem) => void;
  onDelete: (item: BackupListItem) => void;
  onClose: () => void;
}

export default function BackupListModal({ backupList, isLoading, onRestore, onDelete, onClose }: BackupListModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="no-drag bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-[calc(100vw-2rem)] max-w-[520px] max-h-[85vh] flex flex-col border border-slate-200/50" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">历史备份</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-xl leading-none transition-colors">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center text-slate-400 py-10 text-sm">加载中...</div>
          ) : backupList.length === 0 ? (
            <div className="text-center text-slate-400 py-10 text-sm">暂无备份记录</div>
          ) : (
            <div className="space-y-1.5">
              {backupList.map(item => (
                <div key={item.backupId} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 border border-slate-100/80 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-700 text-sm">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(item.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <div className="flex gap-3 ml-3 shrink-0">
                    <button
                      onClick={() => onRestore(item)}
                      className="text-indigo-500 hover:text-indigo-700 text-xs font-medium transition-colors"
                    >
                      恢复
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="text-slate-300 hover:text-red-500 text-xs transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-300 text-center">
          每次保存时自动备份，最多保留 50 个版本
        </div>
      </div>
    </div>
  );
}
