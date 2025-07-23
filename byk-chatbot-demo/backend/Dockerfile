# Node.js 18 LTSをベースイメージとして使用
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.json（存在する場合）をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# アップロードとデータベース用のディレクトリを作成
RUN mkdir -p uploads database

# ポート5000を公開
EXPOSE 5000

# 開発用サーバーを起動
CMD ["npm", "run", "dev"] 