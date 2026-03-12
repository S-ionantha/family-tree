import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import treesRouter from './routes/trees.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT: number | string = process.env.PORT || 3001;

// 确保数据目录存在
const DATA_DIR = path.join(__dirname, 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API 路由
app.use('/api/trees', treesRouter);

// 生产环境：托管前端静态文件
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  // 前端路由 fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Family Tree Server running at http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Serving frontend from dist/`);
  }
});