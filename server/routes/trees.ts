import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import type { TreeNode, FamilyTree, TreeListItem, BackupData, BackupListItem } from '../../src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const MAX_BACKUPS = 50;

// ============================================
// 辅助函数
// ============================================

function getTreeFilePath(id: string): string {
  return path.join(DATA_DIR, `${id}.json`);
}

function getBackupDir(treeId: string): string {
  return path.join(BACKUPS_DIR, treeId);
}

function readTreeFile(id: string): FamilyTree | null {
  const filePath = getTreeFilePath(id);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as FamilyTree;
}

function writeTreeFile(data: FamilyTree): void {
  fs.writeFileSync(getTreeFilePath(data.id), JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 为指定族谱创建一份备份（将当前主数据复制到备份目录）
 */
function createBackup(treeId: string): void {
  const tree = readTreeFile(treeId);
  if (!tree) return;

  const backupDir = getBackupDir(treeId);
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = Date.now().toString();
  const backupData: BackupData = {
    backupId: timestamp,
    treeId: tree.id,
    title: tree.title,
    treeData: tree.treeData,
    createdAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(backupDir, `${timestamp}.json`), JSON.stringify(backupData, null, 2), 'utf-8');

  // 清理超出上限的旧备份
  pruneBackups(treeId);
}

/**
 * 保留最近 MAX_BACKUPS 个备份，删除最早的
 */
function pruneBackups(treeId: string): void {
  const backupDir = getBackupDir(treeId);
  if (!fs.existsSync(backupDir)) return;

  const files = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.json'))
    .sort();

  if (files.length > MAX_BACKUPS) {
    const toDelete = files.slice(0, files.length - MAX_BACKUPS);
    toDelete.forEach(f => fs.unlinkSync(path.join(backupDir, f)));
  }
}

// ============================================
// 族谱 CRUD 接口
// ============================================

// GET /api/trees — 获取族谱列表
router.get('/', (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const list: TreeListItem[] = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')) as FamilyTree;
      return {
        id: data.id,
        title: data.title,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });
    // 按更新时间倒序
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    res.json(list);
  } catch (err) {
    console.error('获取族谱列表失败:', err);
    res.status(500).json({ error: '获取族谱列表失败' });
  }
});

// GET /api/trees/:id — 获取单棵族谱
router.get('/:id', (req: Request, res: Response) => {
  try {
    const tree = readTreeFile(req.params.id);
    if (!tree) { res.status(404).json({ error: '族谱不存在或已被删除' }); return; }
    res.json(tree);
  } catch (err) {
    console.error('获取族谱失败:', err);
    res.status(500).json({ error: '获取族谱失败' });
  }
});

// POST /api/trees — 新建族谱
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, treeData } = req.body as { title?: string; treeData?: TreeNode };
    if (!title || !treeData) {
      res.status(400).json({ error: '缺少 title 或 treeData' });
      return;
    }
    const now = new Date().toISOString();
    const tree: FamilyTree = {
      id: uuidv4(),
      title,
      treeData,
      createdAt: now,
      updatedAt: now
    };
    writeTreeFile(tree);
    res.status(201).json(tree);
  } catch (err) {
    console.error('创建族谱失败:', err);
    res.status(500).json({ error: '创建族谱失败' });
  }
});

// PUT /api/trees/:id — 更新族谱（自动备份）
router.put('/:id', (req: Request, res: Response) => {
  try {
    const existing = readTreeFile(req.params.id);
    if (!existing) { res.status(404).json({ error: '族谱不存在或已被删除' }); return; }

    // 先备份当前版本
    createBackup(req.params.id);

    const { title, treeData } = req.body as { title?: string; treeData?: TreeNode };
    if (title !== undefined) existing.title = title;
    if (treeData !== undefined) existing.treeData = treeData;
    existing.updatedAt = new Date().toISOString();

    writeTreeFile(existing);
    res.json(existing);
  } catch (err) {
    console.error('更新族谱失败:', err);
    res.status(500).json({ error: '更新族谱失败' });
  }
});

// DELETE /api/trees/:id — 删除族谱（同时删除所有备份）
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const filePath = getTreeFilePath(req.params.id);
    if (!fs.existsSync(filePath)) { res.status(404).json({ error: '族谱不存在或已被删除' }); return; }

    // 删除主文件
    fs.unlinkSync(filePath);

    // 删除备份目录
    const backupDir = getBackupDir(req.params.id);
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('删除族谱失败:', err);
    res.status(500).json({ error: '删除族谱失败' });
  }
});

// ============================================
// 备份管理接口
// ============================================

// GET /api/trees/:id/backups — 获取备份列表
router.get('/:id/backups', (req: Request, res: Response) => {
  try {
    const tree = readTreeFile(req.params.id);
    if (!tree) { res.status(404).json({ error: '族谱不存在或已被删除' }); return; }

    const backupDir = getBackupDir(req.params.id);
    if (!fs.existsSync(backupDir)) { res.json([]); return; }

    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
    const backups: BackupListItem[] = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(backupDir, f), 'utf-8')) as BackupData;
      return {
        backupId: data.backupId,
        title: data.title,
        createdAt: data.createdAt
      };
    });
    // 按时间倒序
    backups.sort((a, b) => Number(b.backupId) - Number(a.backupId));
    res.json(backups);
  } catch (err) {
    console.error('获取备份列表失败:', err);
    res.status(500).json({ error: '获取备份列表失败' });
  }
});

// GET /api/trees/:id/backups/:backupId — 获取单个备份
router.get('/:id/backups/:backupId', (req: Request, res: Response) => {
  try {
    const backupPath = path.join(getBackupDir(req.params.id), `${req.params.backupId}.json`);
    if (!fs.existsSync(backupPath)) { res.status(404).json({ error: '备份不存在或已被删除' }); return; }

    const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8')) as BackupData;
    res.json(data);
  } catch (err) {
    console.error('获取备份失败:', err);
    res.status(500).json({ error: '获取备份失败' });
  }
});

// POST /api/trees/:id/backups/:backupId/restore — 从备份恢复
router.post('/:id/backups/:backupId/restore', (req: Request, res: Response) => {
  try {
    const existing = readTreeFile(req.params.id);
    if (!existing) { res.status(404).json({ error: '族谱不存在或已被删除' }); return; }

    const backupPath = path.join(getBackupDir(req.params.id), `${req.params.backupId}.json`);
    if (!fs.existsSync(backupPath)) { res.status(404).json({ error: '备份不存在或已被删除' }); return; }

    // 先备份当前版本（恢复保护）
    createBackup(req.params.id);

    // 用备份内容覆盖当前版本
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8')) as BackupData;
    existing.title = backupData.title;
    existing.treeData = backupData.treeData;
    existing.updatedAt = new Date().toISOString();

    writeTreeFile(existing);
    res.json(existing);
  } catch (err) {
    console.error('恢复备份失败:', err);
    res.status(500).json({ error: '恢复备份失败' });
  }
});

// DELETE /api/trees/:id/backups/:backupId — 删除单个备份
router.delete('/:id/backups/:backupId', (req: Request, res: Response) => {
  try {
    const backupPath = path.join(getBackupDir(req.params.id), `${req.params.backupId}.json`);
    if (!fs.existsSync(backupPath)) { res.status(404).json({ error: '备份不存在或已被删除' }); return; }

    fs.unlinkSync(backupPath);
    res.json({ success: true });
  } catch (err) {
    console.error('删除备份失败:', err);
    res.status(500).json({ error: '删除备份失败' });
  }
});

export default router;