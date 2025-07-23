# BYK Japan KK チャットボット デモ版

社内ナレッジ共有のためのAIチャットボットのプロトタイプです。

## 機能

- **チャットボット対話**: OpenAI GPT-4o-miniを使用した質問応答
- **ファイル管理**: Word/PDF/テキストファイルのアップロードと管理
- **検索機能**: アップロードされた文書の全文検索

## 必要な環境

### Docker版（推奨）
- Docker
- Docker Compose

### ローカル版
- Node.js (v14以上)
- npm

## セットアップ手順

### 1. OpenAI APIキーの取得

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. APIキーを作成・取得

### 2. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成:

```bash
# .env.exampleをコピー
cp .env.example .env

# .envファイルを編集してAPIキーを設定
OPENAI_API_KEY=your-actual-api-key-here
```

## 起動方法

### 🐳 Docker版（推奨）

```bash
# 初回起動（イメージのビルドが必要）
docker-compose up --build

# 2回目以降
docker-compose up

# バックグラウンドで起動
docker-compose up -d

# 停止
docker-compose down
```

アクセス: http://localhost:3000

### 💻 ローカル版

#### ターミナル1: バックエンドサーバー
```bash
cd backend
npm install  # 初回のみ
npm start    # または npm run dev（開発モード）
```

#### ターミナル2: フロントエンドサーバー
```bash
cd frontend
npm install  # 初回のみ
npm start
```

アクセス: http://localhost:3000

## 使い方

### チャット機能
1. 「チャット」タブを選択
2. 質問を入力して送信
3. AIが関連文書を参照しながら回答

### ファイル管理
1. 「ファイル管理」タブを選択
2. 「ファイルをアップロード」ボタンをクリック
3. Word/PDF/テキストファイルを選択し、カテゴリとタグを設定
4. アップロード実行

### 検索機能
1. 「検索」タブを選択
2. キーワードを入力（カテゴリでフィルタリング可能）
3. 検索実行

## デモ用サンプルファイル

以下のようなサンプルファイルをアップロードしてテスト:
- 海外出張旅費規定.pdf
- 分析機器操作マニュアル.docx
- 人事制度ハンドブック.pdf

サンプルファイルの作成:
```bash
cd backend
node create-sample-files.js
```
（`backend/sample-files`にテキストファイルが作成されます）

## トラブルシューティング

### Docker版

#### コンテナが起動しない
```bash
# ログを確認
docker-compose logs backend
docker-compose logs frontend

# コンテナを再ビルド
docker-compose build --no-cache
docker-compose up
```

#### ポートが使用中
```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :5001

# 別のポートを使用する場合は docker-compose.yml を編集
```

### ローカル版

#### サーバーが起動しない
- Node.jsがインストールされているか確認
- ポート5001（バックエンド）、3000（フロントエンド）が使用されていないか確認

### 共通

#### チャットボットが応答しない
- OpenAI APIキーが正しく設定されているか確認
- インターネット接続を確認
- `.env`ファイルが正しい場所にあるか確認

#### ファイルアップロードエラー
- ファイルサイズが10MB以下か確認
- ファイル形式がPDF/Word（.doc, .docx）/テキスト（.txt）か確認

## 技術スタック

- **フロントエンド**: React, Bootstrap
- **バックエンド**: Node.js, Express
- **データベース**: SQLite
- **AI**: OpenAI GPT-4o-mini
- **ファイル処理**: pdf-parse, mammoth
- **コンテナ**: Docker, Docker Compose

## 開発時のTips

### Docker版でのホットリロード
- フロントエンド: 自動的に変更が反映されます
- バックエンド: nodemonにより自動的に再起動されます

### データの永続化
Docker版では以下のデータが永続化されます:
- `backend/uploads/`: アップロードされたファイル
- `backend/database/`: SQLiteデータベース

### ログの確認
```bash
# 全てのログ
docker-compose logs -f

# 特定のサービスのログ
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 注意事項

- これはデモ版のため、本番環境での使用は想定していません
- アップロードされたファイルはローカルに保存されます
- OpenAI APIの使用には料金が発生します（想定: 2週間で$20-30） 