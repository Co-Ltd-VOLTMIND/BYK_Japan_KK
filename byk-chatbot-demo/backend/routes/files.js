const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const db = require('../database/db');

// Multerの設定
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 日本語ファイル名を正しく処理
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + originalName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('PDF、Word、テキストファイルのみアップロード可能です'));
    }
  }
});

// ファイルアップロードエンドポイント
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { category, tags } = req.body;
    const filepath = req.file.path;
    // 日本語ファイル名を正しくデコード
    const filename = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    // ファイルからテキストを抽出
    let content = '';
    const ext = path.extname(filename).toLowerCase();

    if (ext === '.pdf') {
      const dataBuffer = await fs.readFile(filepath);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filepath });
      content = result.value;
    } else if (ext === '.txt') {
      content = await fs.readFile(filepath, 'utf8');
    }

    // データベースに保存
    db.run(
      `INSERT INTO files (filename, filepath, category, tags, content) VALUES (?, ?, ?, ?, ?)`,
      [filename, filepath, category || '', tags || '', content],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save file information' });
        }

        res.json({
          success: true,
          file: {
            id: this.lastID,
            filename,
            category,
            tags,
            uploadedAt: new Date().toISOString()
          }
        });
      }
    );

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process file',
      details: error.message 
    });
  }
});

// ファイル一覧取得エンドポイント
router.get('/list', (req, res) => {
  db.all(
    `SELECT id, filename, category, tags, uploaded_at FROM files ORDER BY uploaded_at DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch files' });
      }
      res.json(rows);
    }
  );
});

// ファイル詳細取得エンドポイント
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(
    `SELECT * FROM files WHERE id = ?`,
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch file' });
      }
      if (!row) {
        return res.status(404).json({ error: 'File not found' });
      }
      res.json(row);
    }
  );
});

// ファイル削除エンドポイント
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  db.get(
    `SELECT filepath FROM files WHERE id = ?`,
    [id],
    async (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'File not found' });
      }

      try {
        // ファイルシステムから削除
        await fs.unlink(row.filepath);
        
        // データベースから削除
        db.run(
          `DELETE FROM files WHERE id = ?`,
          [id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to delete file record' });
            }
            res.json({ success: true, message: 'File deleted successfully' });
          }
        );
      } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
      }
    }
  );
});

module.exports = router; 