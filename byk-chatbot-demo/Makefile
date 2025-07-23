# BYK Chatbot Demo - Makefile

# デフォルトターゲット
.PHONY: help
help:
	@echo "BYK Chatbot Demo - 利用可能なコマンド:"
	@echo ""
	@echo "Docker版:"
	@echo "  make up          - Dockerコンテナを起動"
	@echo "  make down        - Dockerコンテナを停止"
	@echo "  make build       - Dockerイメージを再ビルド"
	@echo "  make logs        - ログを表示"
	@echo "  make clean       - コンテナとボリュームを削除"
	@echo ""
	@echo "ローカル版:"
	@echo "  make install     - 依存関係をインストール"
	@echo "  make dev         - 開発サーバーを起動"
	@echo ""
	@echo "その他:"
	@echo "  make sample      - サンプルファイルを作成"

# Docker版コマンド
.PHONY: up
up:
	@if [ ! -f .env ]; then \
		echo "⚠️  .envファイルが見つかりません。作成します..."; \
		cp .env.example .env; \
		echo "✅ .envファイルを作成しました。APIキーを設定してください。"; \
		exit 1; \
	fi
	docker-compose up

.PHONY: down
down:
	docker-compose down

.PHONY: build
build:
	docker-compose build --no-cache

.PHONY: logs
logs:
	docker-compose logs -f

.PHONY: clean
clean:
	docker-compose down -v
	rm -rf backend/uploads/* backend/database/*.db

# ローカル版コマンド
.PHONY: install
install:
	cd backend && npm install
	cd frontend && npm install

.PHONY: dev
dev:
	@echo "2つのターミナルで以下を実行してください:"
	@echo "ターミナル1: cd backend && npm run dev"
	@echo "ターミナル2: cd frontend && npm start"

# その他
.PHONY: sample
sample:
	cd backend && node create-sample-files.js 