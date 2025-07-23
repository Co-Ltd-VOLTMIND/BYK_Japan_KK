const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;

// 環境変数の読み込み（ローカル実行時は.envから、Docker実行時はdocker-composeから）
dotenv.config();

// Expressアプリケーションの初期化
const app = express();

// ミドルウェアの設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// アップロードディレクトリの確認・作成
const uploadDir = process.env.UPLOAD_DIR || './uploads';
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

// ルートのインポート
const chatRoutes = require('./routes/chat');
const fileRoutes = require('./routes/files');
const searchRoutes = require('./routes/search');

// APIルートの設定
app.use('/api/chat', chatRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/search', searchRoutes);

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// サーバーの起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 