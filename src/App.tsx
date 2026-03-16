import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import {
  fetchTrees, fetchTree, createTree, updateTree, deleteTree as apiDeleteTree,
  fetchBackups, restoreBackup, deleteBackup as apiDeleteBackup
} from './api';
import useTreeLayout, { LABEL_W } from './useTreeLayout';
import type { TreeNode, TreeListItem, BackupListItem } from './types';
import { toPng } from 'html-to-image';

// 拆分的组件
import Toast from './components/Toast';
import type { ToastData } from './components/Toast';
import TreeListModal from './components/TreeListModal';
import BackupListModal from './components/BackupListModal';
import NodeEditPanel from './components/NodeEditPanel';
import Toolbar from './components/Toolbar';
import TreeCanvas from './components/TreeCanvas';

// 拆分的工具 / 数据 / 样式 / Hook
import { updateNode, deleteNodeFromTree, addChildNode } from './utils/treeUtils';
import { emptyTreeTemplate, initialData } from './data/templates';
import { injectTreeStyles } from './styles/treeStyles';
import useCanvasInteraction from './hooks/useCanvasInteraction';

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

  // 画布交互
  const canvas = useCanvasInteraction();

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
      canvas.setScale(1);
      canvas.recenter();
      showToast('族谱加载成功');
    } catch (err) {
      showToast('加载族谱失败: ' + (err as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, canvas]);

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
    canvas.setScale(1);
    canvas.recenter();
  }, [canvas]);

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

    const prevScale = canvas.scale;
    const prevPosition = { ...canvas.position };

    try {
      canvas.setScale(1);
      canvas.setPosition({ x: 0, y: 0 });

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
      canvas.setScale(prevScale);
      canvas.setPosition(prevPosition);
      if (btn) btn.innerText = '导出图片';
    }
  };

  // 注入节点样式
  useEffect(() => { injectTreeStyles(); }, []);

  // 使用布局 Hook 计算节点位置
  const { positions, connections, maxDepth, totalWidth, totalHeight } = useTreeLayout(treeData);

  // 自动居中视图
  useEffect(() => {
    if (canvas.hasCentered.current) return;
    const el = canvas.containerRef.current;
    if (!el || totalWidth <= 0) return;
    const containerW = el.clientWidth;
    const treeFullW = LABEL_W * 2 + totalWidth + 80;
    const x = Math.max(0, (containerW - treeFullW) / 2);
    canvas.setPosition({ x, y: 20 });
    canvas.hasCentered.current = true;
  }, [totalWidth, canvas.centerTrigger]);

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
      <Toolbar
        treeTitle={treeTitle}
        currentTreeId={currentTreeId}
        isSaving={isSaving}
        onOpenList={() => { setShowListModal(true); loadTreeList(); }}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onLoadBackups={loadBackups}
        onResetView={canvas.resetView}
        onExportImage={exportImage}
        onExportJSON={exportJSON}
      />

      {/* 主体布局 */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 画布区域 */}
        <TreeCanvas
          treeTitle={treeTitle}
          positions={positions}
          connections={connections}
          maxDepth={maxDepth}
          totalWidth={totalWidth}
          totalHeight={totalHeight}
          selectedNodeId={selectedNode?.id ?? null}
          scale={canvas.scale}
          position={canvas.position}
          isDragging={canvas.isDragging}
          containerRef={canvas.containerRef}
          onMouseDown={canvas.handleMouseDown}
          onMouseMove={canvas.handleMouseMove}
          onMouseUp={canvas.handleMouseUp}
          onTouchStart={canvas.handleTouchStart}
          onTouchMove={canvas.handleTouchMove}
          onTouchEnd={canvas.handleTouchEnd}
          onSelectNode={setSelectedNode}
          onMoveNode={handleMoveNode}
          onTitleChange={setTreeTitle}
        />

        {/* 右侧编辑面板 */}
        {selectedNode && (
          <NodeEditPanel
            selectedNode={selectedNode}
            onClose={() => setSelectedNode(null)}
            onSaveNode={handleSaveNode}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            onMoveSibling={handleMoveSibling}
          />
        )}
      </div>
    </div>
  );
}
