const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const db = require('../database/db');
const fs = require('fs').promises;
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// デフォルトのシステムプロンプト
const DEFAULT_SYSTEM_PROMPT = `あなたはBYK Japan KKの社内ナレッジ共有システムのAIアシスタントです。

以下の社内文書の内容を熟知しており、これらの情報を基に質問に答えてください。
文書を参照する際は、文書名を【】で囲んで明示してください（例：【海外出張旅費規定】）。

回答は以下の点に注意してください：
- 正確で簡潔な情報提供
- 関連する文書への適切な参照
- 必要に応じて具体的な手順や例の提示
- 不明な点は推測せず、正直に伝える`;

// システムプロンプトの設定を読み込む
async function loadSystemPrompt() {
  try {
    const configPath = path.join(__dirname, '..', 'config', 'system-prompt.txt');
    const customPrompt = await fs.readFile(configPath, 'utf-8');
    return customPrompt.trim() || DEFAULT_SYSTEM_PROMPT;
  } catch (error) {
    // ファイルが存在しない場合はデフォルトを使用
    return DEFAULT_SYSTEM_PROMPT;
  }
}

// すべてのファイル内容を取得する関数
async function getAllFilesContent() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT filename, category, tags, content FROM files ORDER BY uploaded_at DESC`,
      (err, files) => {
        if (err) {
          console.error('Error fetching files:', err);
          resolve([]);
        } else {
          resolve(files || []);
        }
      }
    );
  });
}

router.post('/message', async (req, res) => {
  try {
    const { question, userId = 'demo-user' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // システムプロンプトを読み込む
    const baseSystemPrompt = await loadSystemPrompt();
    
    // すべてのファイルを取得
    const allFiles = await getAllFilesContent();

    // システムプロンプトを構築
    let systemPrompt = baseSystemPrompt + '\n\n=== アップロードされた社内文書 ===\n';

    allFiles.forEach((file, index) => {
      systemPrompt += `
【文書${index + 1}】${file.filename}
カテゴリ: ${file.category || '未分類'}
タグ: ${file.tags || 'なし'}
内容:
${file.content}

---
`;
    });

    if (allFiles.length === 0) {
      systemPrompt += `
現在、社内文書はアップロードされていません。
一般的な知識に基づいて回答します。
`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
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
      [userId, question, answer, JSON.stringify(allFiles.map(f => f.filename))],
      (err) => {
        if (err) {
          console.error('Error saving chat history:', err);
        }
      }
    );

    res.json({
      answer,
      relatedFiles: allFiles.map(file => ({
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

// システムプロンプトの更新エンドポイント
router.post('/system-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const configDir = path.join(__dirname, '..', 'config');
    await fs.mkdir(configDir, { recursive: true });
    
    const configPath = path.join(configDir, 'system-prompt.txt');
    await fs.writeFile(configPath, prompt, 'utf-8');
    
    res.json({ message: 'System prompt updated successfully' });
  } catch (error) {
    console.error('Error updating system prompt:', error);
    res.status(500).json({ error: 'Failed to update system prompt' });
  }
});

// 現在のシステムプロンプトを取得
router.get('/system-prompt', async (req, res) => {
  try {
    const prompt = await loadSystemPrompt();
    res.json({ prompt });
  } catch (error) {
    console.error('Error loading system prompt:', error);
    res.status(500).json({ error: 'Failed to load system prompt' });
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

module.exports = router; 