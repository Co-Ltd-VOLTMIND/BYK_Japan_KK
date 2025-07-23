const express = require('express');
const router = express.Router();
const db = require('../database/db');

// 検索エンドポイント
router.get('/', (req, res) => {
  const { q, category, limit = 20 } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // 検索クエリを構築
  let searchQuery = q.trim();
  let params = [searchQuery, parseInt(limit)];
  let sql = `
    SELECT 
      files.*,
      snippet(files_fts, -1, '<mark>', '</mark>', '...', 30) as snippet,
      rank
    FROM files 
    JOIN files_fts ON files.id = files_fts.rowid
    WHERE files_fts MATCH ?
  `;

  // カテゴリフィルターを追加
  if (category) {
    sql += ` AND files.category = ?`;
    params.splice(1, 0, category);
  }

  sql += ` ORDER BY rank LIMIT ?`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Search error:', err);
      return res.status(500).json({ error: 'Search failed' });
    }

    res.json({
      query: q,
      results: rows || [],
      count: rows ? rows.length : 0
    });
  });
});

// 詳細検索エンドポイント
router.post('/advanced', (req, res) => {
  const { 
    query, 
    categories = [], 
    tags = [], 
    dateFrom, 
    dateTo,
    limit = 20 
  } = req.body;

  let conditions = [];
  let params = [];

  // 基本検索条件
  if (query && query.trim()) {
    conditions.push(`files_fts MATCH ?`);
    params.push(query.trim());
  }

  // カテゴリフィルター
  if (categories.length > 0) {
    const placeholders = categories.map(() => '?').join(',');
    conditions.push(`files.category IN (${placeholders})`);
    params.push(...categories);
  }

  // タグフィルター
  if (tags.length > 0) {
    const tagConditions = tags.map(() => `files.tags LIKE ?`);
    conditions.push(`(${tagConditions.join(' OR ')})`);
    params.push(...tags.map(tag => `%${tag}%`));
  }

  // 日付フィルター
  if (dateFrom) {
    conditions.push(`files.uploaded_at >= ?`);
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push(`files.uploaded_at <= ?`);
    params.push(dateTo);
  }

  // SQLクエリを構築
  let sql = `
    SELECT 
      files.*,
      ${query ? `snippet(files_fts, -1, '<mark>', '</mark>', '...', 30) as snippet,` : ''}
      ${query ? 'rank' : '1 as rank'}
    FROM files
    ${query ? 'JOIN files_fts ON files.id = files_fts.rowid' : ''}
  `;

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  sql += ` ORDER BY ${query ? 'rank,' : ''} uploaded_at DESC LIMIT ?`;
  params.push(parseInt(limit));

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Advanced search error:', err);
      return res.status(500).json({ error: 'Advanced search failed' });
    }

    res.json({
      results: rows || [],
      count: rows ? rows.length : 0,
      filters: {
        query,
        categories,
        tags,
        dateFrom,
        dateTo
      }
    });
  });
});

// サジェスト機能
router.get('/suggest', (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json({ suggestions: [] });
  }

  // ファイル名とタグからサジェストを生成
  db.all(
    `SELECT DISTINCT filename FROM files WHERE filename LIKE ? 
     UNION 
     SELECT DISTINCT tags FROM files WHERE tags LIKE ? AND tags != ''
     LIMIT 10`,
    [`%${q}%`, `%${q}%`],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Suggestion failed' });
      }

      const suggestions = rows
        .map(row => Object.values(row)[0])
        .filter(val => val && val.toLowerCase().includes(q.toLowerCase()));

      res.json({ suggestions });
    }
  );
});

// カテゴリ一覧取得
router.get('/categories', (req, res) => {
  db.all(
    `SELECT DISTINCT category, COUNT(*) as count 
     FROM files 
     WHERE category != '' 
     GROUP BY category 
     ORDER BY count DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch categories' });
      }
      res.json(rows || []);
    }
  );
});

module.exports = router; 