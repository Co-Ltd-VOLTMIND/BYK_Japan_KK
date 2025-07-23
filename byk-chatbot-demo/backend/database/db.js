const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// データベースファイルのパス
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'chatbot.db');

// データベース接続
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// データベーススキーマの初期化
const initDatabase = () => {
  // ファイル管理テーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      category TEXT,
      tags TEXT,
      content TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // チャット履歴テーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      related_files TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ユーザー管理テーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 検索用の全文検索インデックス
  db.run(`
    CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
      filename, content, tags, content=files, content_rowid=id
    )
  `);

  // トリガーで全文検索インデックスを更新
  db.run(`
    CREATE TRIGGER IF NOT EXISTS files_ai AFTER INSERT ON files BEGIN
      INSERT INTO files_fts(rowid, filename, content, tags) 
      VALUES (new.id, new.filename, new.content, new.tags);
    END
  `);

  console.log('✅ Database schema initialized');
};

// データベース初期化を実行
initDatabase();

module.exports = db; 