# ハイブリッド開発環境構築ガイド

## 概要
ローカル（Cursor）とEC2（claude code）の両方を使える柔軟な開発環境の構築方法

## 開発フローの選択肢

### 1. ローカル（Cursor）で開発 → GitHub → EC2にデプロイ（推奨）
```
[ローカルCursor] → git push → [GitHub] → CI/CD → [EC2本番環境]
     ↑                                              ↓
     └──────────── ブラウザで動作確認 ←──────────────┘
```

**メリット：**
- バージョン管理が確実
- チーム開発に適している
- ロールバック可能
- CI/CDで自動テスト可能

### 2. EC2上のclaude codeの使い方

**使うべき場面：**
- 🔧 緊急のバグ修正
- 🔍 本番環境特有の問題調査
- ⚙️ 設定ファイルの微調整
- 📝 ログ確認・デバッグ

**使うべきでない場面：**
- ❌ 新機能開発
- ❌ 大規模な変更
- ❌ 実験的なコード

## ハイブリッド環境の構築手順

### 1. ディレクトリ構成
```bash
# EC2上に3つの環境を作る
/var/www/
├── production/          # 本番環境（GitHub経由のみ）
│   └── byk-chatbot/
├── staging/            # ステージング（GitHub経由）
│   └── byk-chatbot/
└── development/        # 開発環境（直接編集OK）
    └── byk-chatbot/
```

### 2. セットアップスクリプト
```bash
# EC2で実行
cd /var/www

# 開発環境用をクローン
sudo mkdir -p development
cd development
sudo git clone https://github.com/Co-Ltd-VOLTMIND/BYK_Japan_KK.git byk-chatbot
sudo chown -R ec2-user:ec2-user byk-chatbot

# ステージング環境
cd /var/www/staging
# すでに作成済み

# 本番環境
cd /var/www
sudo mkdir -p production
cd production
sudo git clone https://github.com/Co-Ltd-VOLTMIND/BYK_Japan_KK.git byk-chatbot
sudo chown -R ec2-user:ec2-user byk-chatbot
```

### 3. ポート割り当て
```javascript
// 各環境で異なるポートを使用
// development/.env
PORT=3001

// staging/.env
PORT=3002

// production/.env
PORT=3000
```

### 4. Nginxでの振り分け（オプション）
```nginx
# /etc/nginx/conf.d/byk-chatbot.conf
server {
    listen 80;
    server_name [EC2のIP];

    # 本番環境
    location / {
        proxy_pass http://localhost:3000;
    }

    # ステージング環境
    location /staging/ {
        proxy_pass http://localhost:3002/;
    }

    # 開発環境
    location /dev/ {
        proxy_pass http://localhost:3001/;
    }
}
```

### 5. 運用ルール

**EC2で直接編集（claude code）**
```bash
# 開発環境で自由に編集
cd /var/www/development/byk-chatbot
claude code .

# 良い変更ができたらGitHubへ
git add .
git commit -m "EC2上で開発: 新機能追加"
git push origin feature/ec2-development
```

**ローカル（Cursor）から**
```bash
# 通常の開発フロー
git checkout -b feature/new-feature
# 開発...
git push origin feature/new-feature
# PR → マージ → CI/CDで自動デプロイ
```

### 6. 便利なエイリアス設定
```bash
# ~/.bashrc に追加
alias dev='cd /var/www/development/byk-chatbot && claude code .'
alias staging='cd /var/www/staging/byk-chatbot'
alias prod='cd /var/www/production/byk-chatbot'

# 環境切り替えスクリプト
alias start-dev='cd /var/www/development/byk-chatbot && npm start'
alias start-staging='cd /var/www/staging/byk-chatbot && npm start'
alias start-prod='cd /var/www/production/byk-chatbot && npm start'
```

### 7. GitHub Actions の更新
```yaml
name: Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    types: [closed]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true || github.event_name == 'push'
    
    steps:
    - name: Deploy to EC2
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ${{ secrets.EC2_USER }}
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          # mainブランチ → 本番環境
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            cd /var/www/production/byk-chatbot
            git pull origin main
            npm install
            # pm2 restart prod-app
          # developブランチ → ステージング
          elif [ "${{ github.ref }}" == "refs/heads/develop" ]; then
            cd /var/www/staging/byk-chatbot
            git pull origin develop
            npm install
            # pm2 restart staging-app
          fi
```

## 実践的な使い分け例

### 新機能開発の流れ
1. ローカル（Cursor）で開発
2. feature ブランチにpush
3. PR作成・レビュー
4. develop にマージ → ステージング環境に自動デプロイ
5. 動作確認
6. main にマージ → 本番環境に自動デプロイ

### 緊急バグ修正の流れ
1. EC2の開発環境でclaude codeを使って修正
2. 動作確認
3. hotfixブランチにpush
4. PRを作成して即マージ
5. CI/CDで本番環境に反映

## まとめ
- **通常の開発**: ローカル（Cursor）を使用
- **緊急対応・調査**: EC2上のclaude codeを使用
- **実験・検証**: EC2の開発環境を自由に使用
- **本番反映**: 必ずGitHub経由で行う

この構成により、状況に応じて最適な開発方法を選択できます。 