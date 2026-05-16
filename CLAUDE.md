# FBStocks — Claude Code 向けプロジェクトガイド

## プロジェクト概要

日本株のヒートマップ PWA。Google OAuth でログインし、お気に入り銘柄の前日比変動率をFINVIZ風のカラースケールで表示する。

## アーキテクチャ

```
ブラウザ
  ↓ HTTPS
Apache (TLS終端)
  ├── /        → /var/www/fbstocks/public/ (静的ファイル)
  └── /api/*   → http://localhost:1234/api/* (Node.js リバースプロキシ)
                    ↓
              backend/server.js (Express, port 1234)
                    ↓
              MariaDB (fbstocks データベース)
```

## 絶対に変更しないこと

- **Apache VirtualHost の設定** — リバースプロキシ構成はそのまま維持する
- **`backend/app.js` の `secure: false`** — Apache が TLS 終端するため Node.js には HTTP で届く。`secure: true` にするとセッションCookieが発行されなくなる
- **`app.set('trust proxy', 1)`** — 上記と同じ理由で必須

## 株価データ API

```
GET https://jpx-indicator.pinkgold.space/scrape?ticker=8306
```

レスポンス例のキー: `companyName`, `currentPrice`, `previousClose`, `dividendYield`, `per`, `pbr`, `marketCap`

バックエンドは `/api/stock/:ticker` でこの外部APIをプロキシしている（タイムアウト8秒）。

## データベース

- DB名: `fbstocks` (MariaDB)
- ORM: Sequelize (mysql2 dialect)
- 主要テーブル: `users`, `stocks`, `favorites`, `favorite_samples`
- スキーマ: `db/schema.sql` / シードデータ: `db/seeds.sql`

**初回ログイン動作**: `favorites` が空のユーザーには `favorite_samples` のレコードを自動コピーする (`/api/heatmap` 内)。

## ファイル構成

```
/var/www/fbstocks/
├── CLAUDE.md
├── public/              # Apache が直接配信する静的ファイル
│   ├── index.html
│   ├── css/styles.css
│   ├── js/app.js
│   └── images/
├── backend/
│   ├── server.js        # エントリーポイント (port 1234)
│   ├── app.js           # Express 設定 (session, passport, routes)
│   ├── .env             # 環境変数 (Git管理外)
│   ├── auth/passport.js # Google OAuth 戦略
│   ├── middleware/auth.js
│   ├── models/          # Sequelize モデル (index.js でまとめて export)
│   └── routes/api.js    # 全APIルート
└── db/
    ├── schema.sql
    └── seeds.sql
```

## よく使うコマンド

```bash
# サービス管理
sudo systemctl status fbstocks
sudo systemctl restart fbstocks
sudo journalctl -u fbstocks -f

# API 疎通確認
curl http://localhost:1234/api/check-auth
curl http://localhost:1234/api/heatmap

# ログイン不要で株価取得テスト
curl "http://localhost:1234/api/stock/8306"
```

## 開発環境 (WSL / ローカル)

WSL での開発時はポート 3000 を想定。`.env` の `CALLBACK_URL` を変更すること:

```
CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

GCP OAuth クライアントに以下を追加済み (2026-05-16):
- JavaScript 生成元: `http://localhost:3000`
- リダイレクト URI: `http://localhost:3000/api/auth/google/callback`

WSL では Apache なしで動かすため、Express から静的ファイルを配信する設定が必要。

## フロントエンド設計方針

- モバイルファーストの Vanilla JS (フレームワークなし)
- タイルタップ → ボトムシートで詳細表示（ホバー・ツールチップは使わない）
- ボトムナビゲーション (768px 以上では非表示)
- `env(safe-area-inset-bottom)` で iPhone ノッチ対応済み
- カラースケール: `#006400`（+5%以上）〜 `#8b0000`（-5%以下）の6段階
