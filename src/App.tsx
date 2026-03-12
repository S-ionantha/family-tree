import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import {
  fetchTrees, fetchTree, createTree, updateTree, deleteTree as apiDeleteTree,
  fetchBackups, restoreBackup, deleteBackup as apiDeleteBackup
} from './api';
import useTreeLayout, { NODE_W, NODE_H, LEVEL_H, LABEL_W, toGenerationLabel } from './useTreeLayout';
import type { NodePosition, Connection } from './useTreeLayout';
import type { TreeNode, TreeListItem, BackupListItem } from './types';
import { toPng } from 'html-to-image';

// --- 默认空族谱模板 ---
const emptyTreeTemplate: TreeNode = {
  id: 'root',
  name: '始祖',
  spouse: '',
  children: []
};

// --- 初始族谱数据 (作为新建族谱的默认模板) ---
const initialData: TreeNode = {
  id: 'root',
  name: '孙守禄',
  spouse: '元配张氏',
  children: [
    {
      id: 'node-1',
      name: '起山',
      spouse: '元配尹氏',
      children: [
        {
          id: 'node-1-1',
          name: '述先',
          spouse: '元配谢氏,继配董氏,三配李氏',
          children: [
            {
              id: 'node-1-1-1',
              name: '士凤',
              spouse: '元配谭氏',
              children: [
                {
                  id: 'node-1-1-1-1',
                  name: '楷',
                  spouse: '元配王氏',
                  children: [
                    {
                      id: 'node-1-1-1-1-1',
                      name: '怀云',
                      spouse: '元配管氏',
                      children: [{ id: 'node-hy-1', name: '继宗', spouse: '元配王氏', children: [] }]
                    },
                    {
                      id: 'node-1-1-1-1-2',
                      name: '怀成',
                      spouse: '元配段氏',
                      children: [
                        {
                          id: 'node-hc-1',
                          name: '继生',
                          spouse: '元配张氏,继配祁氏',
                          children: [
                            {
                              id: 'node-js-1', name: '振铎', spouse: '元配赵氏',
                              children: [{ id: 'node-zd-1', title: '长子', name: '好宾', children: [{ id: 'node-zd-2', title: '长子', name: '佳树', children: [{ id: 'node-zd-3', title: '长子', name: '传兴', children: [{ id: 'node-zd-4', name: '铁良', children: [] }] }] }] }]
                            },
                            {
                              id: 'node-js-2', name: '振海', spouse: '元配姜氏',
                              children: [{ id: 'node-zh-1', title: '次子', name: '好宽', children: [{ id: 'node-zh-2', title: '次子', name: '佳林', children: [{ id: 'node-zh-3', title: '次子', name: '传业', children: [{ id: 'node-zh-4', name: '浩鹏', children: [] }] }] }] }]
                            },
                            {
                              id: 'node-js-3', name: '振涛', spouse: '元配谢氏',
                              children: [{ id: 'node-zt-1', title: '三子', name: '好宝', children: [{ id: 'node-zt-2', title: '三子', name: '佳柱', children: [{ id: 'node-zt-3', title: '三子', name: '传勇', children: [{ id: 'node-zt-4', name: '博文', children: [] }] }] }] }]
                            },
                            { id: 'node-js-4', name: '建章', spouse: '入嗣振海', children: [] }
                          ]
                        }
                      ]
                    },
                    {
                      id: 'node-1-1-1-1-3',
                      name: '怀清',
                      spouse: '元配李氏',
                      children: [
                         { id: 'node-hq-1', name: '振斌', spouse: '元配王氏', children: [
                             { id: 'node-zb-1', title: '长子', name: '好端', children: [{ id: 'node-zb-1-1', title: '长子', name: '佳信', children: [{ id: 'node-zb-1-1-1', title: '长子', name: '传仁', children: [] }] }] },
                             { id: 'node-zb-2', title: '次子', name: '好经', children: [{ id: 'node-zb-2-1', title: '次子', name: '佳丽', children: [{ id: 'node-zb-2-1-1', title: '次子', name: '传义', children: [] }] }] }
                         ]}
                      ]
                    },
                    {
                      id: 'node-1-1-1-1-4',
                      name: '怀收',
                      spouse: '元配王氏',
                      children: [{ id: 'node-hs-1', name: '振刚', children: [] }]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'node-1-2',
          name: '开先',
          spouse: '元配姜氏',
          children: [
            {
              id: 'node-1-2-1',
              name: '士超',
              spouse: '元配张氏',
              children: [
                {
                  id: 'node-1-2-1-1',
                  name: '树',
                  spouse: '',
                  children: [
                     {
                         id: 'node-shu-1', name: '连孟', spouse: '元配李氏',
                         children: [
                             { id: 'node-lm-1', title: '长子', name: '效堂', children: [{id:'node-lm-1-1', title: '长子', name:'好明', children:[]}] },
                             { id: 'node-lm-2', title: '次子', name: '效明', children: [{id:'node-lm-2-1', title: '次子', name:'好清', children:[]}] },
                             { id: 'node-lm-3', title: '三子', name: '效文', children: [{id:'node-lm-3-1', title: '三子', name:'好源', children:[]}] },
                             { id: 'node-lm-4', title: '四子', name: '效武', children: [] },
                             { id: 'node-lm-5', title: '五子', name: '效汤', children: [] },
                             { id: 'node-lm-6', title: '六子', name: '效胜', children: [] }
                         ]
                     },
                     { id: 'node-shu-2', name: '连子', spouse: '元配祁氏', children: [] },
                     { id: 'node-shu-3', name: '连双', spouse: '元配马氏', children: [] }
                  ]
                },
                { id: 'node-1-2-1-2', name: '朴', spouse: '', children: [] }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// --- 工具函数 ---
const generateId = (): string => 'node-' + Math.random().toString(36).substr(2, 9);

const updateNode = (tree: TreeNode, id: string, newData: Partial<TreeNode>): TreeNode => {
  if (tree.id === id) return { ...tree, ...newData };
  if (tree.children) {
    return { ...tree, children: tree.children.map(c => updateNode(c, id, newData)) };
  }
  return tree;
};

const deleteNodeFromTree = (tree: TreeNode, id: string): TreeNode => {
  if (tree.children) {
    const filtered = tree.children.filter(c => c.id !== id);
    return { ...tree, children: filtered.map(c => deleteNodeFromTree(c, id)) };
  }
  return tree;
};

const addChildNode = (tree: TreeNode, parentId: string): TreeNode => {
  if (tree.id === parentId) {
    const newChild: TreeNode = { id: generateId(), name: "新建成员", title: "", spouse: "", children: [] };
    return { ...tree, children: [...(tree.children || []), newChild] };
  }
  if (tree.children) {
    return { ...tree, children: tree.children.map(c => addChildNode(c, parentId)) };
  }
  return tree;
};

// --- Toast 类型与组件 ---
interface ToastData {
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface ToastProps extends ToastData {
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in`}>
      {message}
    </div>
  );
}

// --- 族谱列表弹窗 ---
interface TreeListModalProps {
  treeList: TreeListItem[];
  isLoading: boolean;
  onLoad: (id: string) => void;
  onDelete: (item: TreeListItem) => void;
  onClose: () => void;
  onCreate: (useTemplate: boolean) => void;
}

function TreeListModal({ treeList, isLoading, onLoad, onDelete, onClose, onCreate }: TreeListModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="no-drag bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-[520px] max-h-[70vh] flex flex-col border border-slate-200/50" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
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
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button onClick={() => onCreate(false)} className="flex-1 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-all text-sm">
            新建空白族谱
          </button>
          <button onClick={() => onCreate(true)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all shadow-sm shadow-indigo-200 text-sm">
            使用示例模板
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 备份列表弹窗 ---
interface BackupListModalProps {
  backupList: BackupListItem[];
  isLoading: boolean;
  onRestore: (item: BackupListItem) => void;
  onDelete: (item: BackupListItem) => void;
  onClose: () => void;
}

function BackupListModal({ backupList, isLoading, onRestore, onDelete, onClose }: BackupListModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="no-drag bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-[520px] max-h-[70vh] flex flex-col border border-slate-200/50" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
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


// --- 主组件 ---
export default function App() {
  // 族谱数据状态
  const [treeData, setTreeData] = useState<TreeNode>(initialData);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [treeTitle, setTreeTitle] = useState<string>("新建族谱");

  // 服务端存储状态
  const [currentTreeId, setCurrentTreeId] = useState<string | null>(null);
  const [treeList, setTreeList] = useState<TreeListItem[]>([]);
  const [showListModal, setShowListModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupList, setBackupList] = useState<BackupListItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // 视图控制状态
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    setToast({ message, type });
  }, []);

  // --- 服务端交互 ---
  const loadTreeList = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchTrees();
      setTreeList(list);
    } catch (err) {
      showToast('获取族谱列表失败: ' + (err as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const loadTree = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await fetchTree(id);
      setTreeData(data.treeData);
      setTreeTitle(data.title);
      setCurrentTreeId(data.id);
      setSelectedNode(null);
      setShowListModal(false);
      setScale(1);
      recenter();
      showToast('族谱加载成功');
    } catch (err) {
      showToast('加载族谱失败: ' + (err as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (currentTreeId) {
        await updateTree(currentTreeId, { title: treeTitle, treeData });
        showToast('保存成功（已自动备份）');
      } else {
        const result = await createTree(treeTitle, treeData);
        setCurrentTreeId(result.id);
        showToast('创建成功');
      }
    } catch (err) {
      showToast('保存失败: ' + (err as Error).message, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [currentTreeId, treeTitle, treeData, showToast]);

  const handleSaveAs = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await createTree(treeTitle + ' (副本)', treeData);
      setCurrentTreeId(result.id);
      setTreeTitle(result.title);
      showToast('另存为成功');
    } catch (err) {
      showToast('另存为失败: ' + (err as Error).message, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [treeTitle, treeData, showToast]);

  const handleNewTree = useCallback((useTemplate: boolean) => {
    setTreeData(useTemplate ? JSON.parse(JSON.stringify(initialData)) : JSON.parse(JSON.stringify(emptyTreeTemplate)));
    setTreeTitle(useTemplate ? "山东省潍坊昌邑市前柳疃村孙氏祖系图谱" : "新建族谱");
    setCurrentTreeId(null);
    setSelectedNode(null);
    setShowListModal(false);
    setScale(1);
    recenter();
  }, [recenter]);

  const handleDeleteTree = useCallback(async (item: TreeListItem) => {
    if (!confirm(`确定要删除「${item.title}」吗？此操作将同时删除所有备份，且不可恢复。`)) return;
    try {
      await apiDeleteTree(item.id);
      if (currentTreeId === item.id) {
        setCurrentTreeId(null);
        setTreeData(JSON.parse(JSON.stringify(emptyTreeTemplate)));
        setTreeTitle("新建族谱");
      }
      showToast('删除成功');
      loadTreeList();
    } catch (err) {
      showToast('删除失败: ' + (err as Error).message, 'error');
    }
  }, [currentTreeId, showToast, loadTreeList]);

  const loadBackups = useCallback(async () => {
    if (!currentTreeId) return;
    setIsLoading(true);
    try {
      const list = await fetchBackups(currentTreeId);
      setBackupList(list);
      setShowBackupModal(true);
    } catch (err) {
      showToast('获取备份列表失败: ' + (err as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentTreeId, showToast]);

  const handleRestore = useCallback(async (backup: BackupListItem) => {
    if (!confirm(`确定要恢复到「${new Date(backup.createdAt).toLocaleString('zh-CN')}」的版本吗？当前版本将被自动备份。`)) return;
    try {
      const result = await restoreBackup(currentTreeId!, backup.backupId);
      setTreeData(result.treeData);
      setTreeTitle(result.title);
      setShowBackupModal(false);
      showToast('已恢复到选定版本');
    } catch (err) {
      showToast('恢复失败: ' + (err as Error).message, 'error');
    }
  }, [currentTreeId, showToast]);

  const handleDeleteBackup = useCallback(async (backup: BackupListItem) => {
    if (!confirm('确定要删除这个备份吗？')) return;
    try {
      await apiDeleteBackup(currentTreeId!, backup.backupId);
      showToast('备份已删除');
      const list = await fetchBackups(currentTreeId!);
      setBackupList(list);
    } catch (err) {
      showToast('删除备份失败: ' + (err as Error).message, 'error');
    }
  }, [currentTreeId, showToast]);

  // 启动时弹出族谱列表
  useEffect(() => {
    setShowListModal(true);
    loadTreeList();
  }, [loadTreeList]);

  // 拖拽平移逻辑
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // 滚轮缩放逻辑（使用原生事件以支持 preventDefault）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('.no-drag')) return;
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      setScale(prev => Math.min(Math.max(0.2, prev + delta), 3));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // 节点操作处理
  const handleSaveNode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const titleVal = (formData.get('title') as string || '').trim();
    const updates: Partial<TreeNode> = {
      title: titleVal || undefined,
      name: formData.get('name') as string,
      spouse: formData.get('spouse') as string
    };
    setTreeData(updateNode(treeData, selectedNode!.id, updates));
    setSelectedNode(prev => prev ? {...prev, ...updates} : null);
  };

  const handleAddChild = () => {
    if (!selectedNode) return;
    const newData = addChildNode(treeData, selectedNode.id);
    setTreeData(newData);
  };

  const handleDelete = () => {
    if (!selectedNode || selectedNode.id === 'root') return;
    if (confirm(`确定要删除 ${selectedNode.name} 及其所有子节点吗？`)) {
      setTreeData(deleteNodeFromTree(treeData, selectedNode.id));
      setSelectedNode(null);
    }
  };

  const handleMoveSibling = (direction: 'left' | 'right') => {
    if (!selectedNode || selectedNode.id === 'root') return;
    
    const newTree: TreeNode = JSON.parse(JSON.stringify(treeData));
    
    const findParent = (node: TreeNode, childId: string): TreeNode | null => {
      if (!node.children) return null;
      if (node.children.some(c => c.id === childId)) return node;
      for (const child of node.children) {
        const p = findParent(child, childId);
        if (p) return p;
      }
      return null;
    };

    const parent = findParent(newTree, selectedNode.id);
    if (!parent || !parent.children) return;

    const index = parent.children.findIndex(c => c.id === selectedNode.id);
    
    if (direction === 'left' && index > 0) {
      [parent.children[index - 1], parent.children[index]] = [parent.children[index], parent.children[index - 1]];
      setTreeData(newTree);
    } else if (direction === 'right' && index < parent.children.length - 1) {
      [parent.children[index], parent.children[index + 1]] = [parent.children[index + 1], parent.children[index]];
      setTreeData(newTree);
    }
  };

  const handleMoveNode = (draggedId: string, targetId: string) => {
    if (draggedId === targetId || draggedId === 'root') return;

    const newTree: TreeNode = JSON.parse(JSON.stringify(treeData));

    const checkDescendant = (n: TreeNode, tid: string): boolean => {
      if (n.id === tid) return true;
      if (n.children) return n.children.some(c => checkDescendant(c, tid));
      return false;
    };

    let draggedNode: TreeNode | null = null;
    const findDragged = (n: TreeNode) => {
      if (n.id === draggedId) draggedNode = n;
      if (n.children) n.children.forEach(findDragged);
    };
    findDragged(newTree);

    if (!draggedNode) return;
    if (checkDescendant(draggedNode, targetId)) {
      alert("层级错误：不能将长辈节点拖入其晚辈分支中！");
      return;
    }

    const removeNode = (n: TreeNode, id: string): TreeNode | null => {
      if (!n.children) return null;
      for (let i = 0; i < n.children.length; i++) {
        if (n.children[i].id === id) {
          return n.children.splice(i, 1)[0];
        }
        const found = removeNode(n.children[i], id);
        if (found) return found;
      }
      return null;
    };
    const nodeToMove = removeNode(newTree, draggedId);
    if (!nodeToMove) return;

    const addNode = (n: TreeNode, tid: string, nodeObj: TreeNode): boolean => {
      if (n.id === tid) {
        if (!n.children) n.children = [];
        n.children.push(nodeObj);
        return true;
      }
      if (n.children) {
        for (const child of n.children) {
          if (addNode(child, tid, nodeObj)) return true;
        }
      }
      return false;
    };
    
    addNode(newTree, targetId, nodeToMove);
    setTreeData(newTree);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(treeData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "family_tree.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportImage = async () => {
    const element = document.getElementById('family-tree-content');
    if (!element) return;

    const btn = document.getElementById('export-img-btn');
    if (btn) btn.innerText = '正在导出...';

    const prevScale = scale;
    const prevPosition = { ...position };

    try {
      setScale(1);
      setPosition({ x: 0, y: 0 });

      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      const dataUrl = await toPng(element, {
        backgroundColor: '#f8fafc',
        pixelRatio: 2,
      });
      const safeName = (treeTitle || 'family_tree').replace(/[\n\r\t/\\:*?"<>|]/g, '').trim() || 'family_tree';
      const link = document.createElement('a');
      link.download = safeName.endsWith('.png') ? safeName : `${safeName}.png`;
      link.href = dataUrl;
      link.click();
      showToast('图片导出成功');
    } catch (error) {
      console.error('导出图片失败:', error);
      showToast('导出图片失败: ' + (error as Error).message, 'error');
    } finally {
      setScale(prevScale);
      setPosition(prevPosition);
      if (btn) btn.innerText = '导出图片';
    }
  };

  // 注入节点样式
  useEffect(() => {
    const styleId = 'tree-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .node-card {
           display: flex;
           flex-direction: column;
           justify-content: center;
           align-items: center;
           border: 1.5px solid #e2e8f0;
           border-radius: 12px;
           padding: 6px 10px;
           background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
           width: ${NODE_W}px;
           min-height: ${NODE_H}px;
           cursor: pointer;
           transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
           box-shadow: 0 1px 3px rgb(0 0 0 / 0.06), 0 1px 2px rgb(0 0 0 / 0.04);
           box-sizing: border-box;
           position: absolute;
        }
        .node-card:hover {
           border-color: #818cf8;
           box-shadow: 0 8px 25px -5px rgb(99 102 241 / 0.15), 0 4px 10px -3px rgb(0 0 0 / 0.05);
           transform: translateY(-1px);
        }
        .node-card.selected {
           border-color: #6366f1;
           background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
           box-shadow: 0 0 0 3px rgb(99 102 241 / 0.2), 0 4px 12px rgb(99 102 241 / 0.1);
        }
        .node-card.drag-over {
           border-color: #34d399 !important;
           background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
           box-shadow: 0 0 0 3px rgb(52 211 153 / 0.2) !important;
        }

        .node-title {
           font-size: 0.6rem;
           color: #6366f1;
           font-weight: 700;
           letter-spacing: 0.08em;
           text-transform: uppercase;
           pointer-events: none;
           text-align: center;
           margin-bottom: 1px;
           line-height: 1.2;
           opacity: 0.85;
        }
        .node-name {
           font-weight: 700;
           color: #0f172a;
           font-size: 0.95rem;
           pointer-events: none;
           max-width: 100%;
           text-align: center;
           word-wrap: break-word;
           overflow-wrap: break-word;
           line-height: 1.3;
           letter-spacing: 0.02em;
        }
        .node-spouse {
           font-size: 0.7rem;
           color: #94a3b8;
           margin-top: 4px;
           padding-top: 4px;
           border-top: 1px solid #f1f5f9;
           pointer-events: none;
           width: 100%;
           text-align: center;
           word-wrap: break-word;
           overflow-wrap: break-word;
           line-height: 1.3;
        }

        .gen-label {
          position: absolute;
          width: ${LABEL_W}px;
          height: ${NODE_H}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 500;
          letter-spacing: 0.06em;
          user-select: none;
          pointer-events: none;
        }
        .gen-stripe {
          position: absolute;
          left: ${LABEL_W}px;
          height: ${LEVEL_H}px;
          pointer-events: none;
        }
        .gen-stripe:nth-child(odd) { background: rgba(99,102,241,0.015); }

        @keyframes fade-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-in { animation: slide-in-right 0.25s ease-out; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // 使用布局 Hook 计算节点位置
  const { positions, connections, maxDepth, totalWidth, totalHeight } = useTreeLayout(treeData);

  // 居中视图
  const hasCentered = useRef(false);
  const [centerTrigger, setCenterTrigger] = useState(0);
  const recenter = useCallback(() => {
    hasCentered.current = false;
    setCenterTrigger(n => n + 1);
  }, []);

  useEffect(() => {
    if (hasCentered.current) return;
    const el = containerRef.current;
    if (!el || totalWidth <= 0) return;
    const containerW = el.clientWidth;
    const treeFullW = LABEL_W * 2 + totalWidth + 80;
    const x = Math.max(0, (containerW - treeFullW) / 2);
    setPosition({ x, y: 20 });
    hasCentered.current = true;
  }, [totalWidth, centerTrigger]);

  // 渲染节点卡片
  const renderNodeCard = (pos: NodePosition) => {
    const { id, x, y, node } = pos;
    return (
      <div
        key={id}
        className={`node-card no-drag ${selectedNode?.id === id ? 'selected' : ''}`}
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
          if (draggedId) handleMoveNode(draggedId, id);
        }}
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedNode(node); }}
      >
        <div className="node-title" style={node.title ? undefined : { visibility: 'hidden' }}>{node.title || '\u00A0'}</div>
        <div className="node-name">{node.name}</div>
        <div className="node-spouse" style={node.spouse ? undefined : { visibility: 'hidden', borderTop: 'none' }} title={node.spouse || ''}>{node.spouse || '\u00A0'}</div>
      </div>
    );
  };

  // 渲染 SVG 连线
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

  // 渲染代数标注
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
    <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      
      {/* Toast 提示 */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 族谱列表弹窗 */}
      {showListModal && (
        <TreeListModal
          treeList={treeList}
          isLoading={isLoading}
          onLoad={loadTree}
          onDelete={handleDeleteTree}
          onClose={() => setShowListModal(false)}
          onCreate={handleNewTree}
        />
      )}

      {/* 备份列表弹窗 */}
      {showBackupModal && (
        <BackupListModal
          backupList={backupList}
          isLoading={isLoading}
          onRestore={handleRestore}
          onDelete={handleDeleteBackup}
          onClose={() => setShowBackupModal(false)}
        />
      )}
      {/* 顶部工具栏 */}
      <header className="no-drag bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-3 flex justify-between items-center gap-6 z-20 shrink-0">
        <div className="shrink-0 min-w-0">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">家族族谱编辑器</h1>
          <p className="text-xs text-slate-400 break-words mt-0.5">
            {currentTreeId ? `正在编辑：${treeTitle}` : '未保存的新族谱'} · 拖拽移动 · 滚轮缩放 · 点击编辑
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end items-center">
          <button onClick={() => { setShowListModal(true); loadTreeList(); }} className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all text-sm font-medium">
            📂 打开
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg text-white font-semibold transition-all shadow-sm shadow-indigo-200 text-sm">
            {isSaving ? '保存中...' : '💾 保存'}
          </button>
          <button onClick={handleSaveAs} disabled={isSaving} className="px-3 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:border-slate-200 disabled:text-slate-400 rounded-lg font-medium transition-all text-sm">
            📋 另存为
          </button>
          <button
            onClick={loadBackups}
            disabled={!currentTreeId}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 rounded-lg font-medium transition-all text-sm"
          >
            🕐 备份
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button onClick={() => { setScale(1); recenter(); }} className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm">
            重置视图
          </button>
          <button id="export-img-btn" onClick={exportImage} className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm">
            导出图片
          </button>
          <button onClick={exportJSON} className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm">
            导出 JSON
          </button>
        </div>
      </header>

      {/* 主体布局 */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 画布区域 */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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
                onBlur={(e: React.FocusEvent<HTMLHeadingElement>) => setTreeTitle(e.currentTarget.innerText)}
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

        {/* 右侧编辑面板 */}
        {selectedNode && (
          <div className="no-drag absolute right-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-sm border-l border-slate-200/60 shadow-2xl flex flex-col animate-slide-in z-20">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">编辑节点</h2>
              <button onClick={() => setSelectedNode(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
              <form onSubmit={handleSaveNode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">身份 / 排行</label>
                  <input 
                    name="title" 
                    defaultValue={selectedNode.title || ''} 
                    key={`title-${selectedNode.id}`}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    placeholder="例如：长子、次子"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">姓名 / 称呼</label>
                  <input 
                    name="name" 
                    defaultValue={selectedNode.name} 
                    key={`name-${selectedNode.id}`}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    placeholder="例如：元配张氏"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all shadow-sm shadow-indigo-200 text-sm">
                  保存修改
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">节点操作</h3>
                <button 
                  onClick={handleAddChild}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all text-sm font-medium"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  添加子嗣
                </button>
                
                {selectedNode.id !== 'root' && (
                  <>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleMoveSibling('left')}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border border-slate-200 text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-all text-sm"
                        title="向左移动 (排在兄长前面)"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        左移
                      </button>
                      <button 
                        onClick={() => handleMoveSibling('right')}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border border-slate-200 text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-all text-sm"
                        title="向右移动 (排在弟妹后面)"
                      >
                        右移
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </button>
                    </div>

                    <button 
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-200/60 text-red-500 bg-white rounded-lg hover:bg-red-50 hover:border-red-300 transition-all text-sm mt-2"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      删除该节点及子分支
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}