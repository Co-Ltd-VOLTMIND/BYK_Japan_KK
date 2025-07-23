const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const db = require('../database/db');

// OpenAI APIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// チャットエンドポイント
router.post('/message', async (req, res) => {
  try {
    const { question, userId = 'demo-user' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // 関連ファイルを検索
    const relatedFiles = await searchRelatedFiles(question);
    
    // コンテキストを構築
    const context = buildContext(relatedFiles);

    // OpenAI APIを呼び出し
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `あなたは社内ナレッジ共有システムのアシスタントです。
          ユーザーの質問に対して、以下の関連文書を参考にして回答してください。
          回答は簡潔で分かりやすく、必要に応じて関連文書を案内してください。
          
          関連文書の情報:
          ${context}`
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const answer = completion.choices[0].message.content;

    // チャット履歴を保存
    db.run(
      `INSERT INTO chat_history (user_id, question, answer, related_files) VALUES (?, ?, ?, ?)`,
      [userId, question, answer, JSON.stringify(relatedFiles)],
      (err) => {
        if (err) {
          console.error('Error saving chat history:', err);
        }
      }
    );

    // レスポンスを返す
    res.json({
      answer,
      relatedFiles: relatedFiles.map(file => ({
        id: file.id,
        filename: file.filename,
        category: file.category
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    });
  }
});

// チャット履歴取得エンドポイント
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  
  db.all(
    `SELECT * FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch chat history' });
      }
      res.json(rows);
    }
  );
});

// 関連ファイルを検索する関数
function searchRelatedFiles(question) {
  return new Promise((resolve, reject) => {
    // 簡易的なキーワード検索
    const keywords = question.split(/\s+/).filter(word => word.length > 2);
    const searchQuery = keywords.join(' OR ');
    
    db.all(
      `SELECT files.*, snippet(files_fts, -1, '<mark>', '</mark>', '...', 30) as snippet
       FROM files 
       JOIN files_fts ON files.id = files_fts.rowid
       WHERE files_fts MATCH ?
       ORDER BY rank
       LIMIT 5`,
      [searchQuery],
      (err, rows) => {
        if (err) {
          console.error('Search error:', err);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
}

// コンテキストを構築する関数
function buildContext(files) {
  if (!files || files.length === 0) {
    return '関連する文書は見つかりませんでした。';
  }
  
  return files.map(file => 
    `ファイル名: ${file.filename}\nカテゴリ: ${file.category || '未分類'}\n内容の一部: ${file.snippet || file.content?.substring(0, 200) || ''}`
  ).join('\n\n');
}

module.exports = router; 