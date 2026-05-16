# FBStocks

日本株のお気に入り銘柄をFINVIZ風ヒートマップで表示するモバイルファーストのPWA。

![スクリーンショット](public/images/fbstocks120-120.png)

## 機能

- **Google OAuth 2.0 ログイン** — アカウント登録不要
- **ヒートマップ表示** — 前日比変動率をカラースケールで可視化（+5%〜−5%の6段階）
- **お気に入り管理** — 4桁の証券コードで銘柄を追加・削除
- **初回ログイン時サンプル表示** — `favorite_samples` の銘柄を自動コピーしてすぐ使える
- **モバイル対応** — ボトムナビ、ボトムシート、iPhoneノッチ対応
- **デスクトップ対応** — 768px以上でヘッダーにナビゲーションを表示

## アーキテクチャ

```
ブラウザ (HTTPS)
  ↓
Apache (TLS終端 / Let's Encrypt)
  ├── /        → /var/www/fbstocks/public/  (静的ファイル)
  └── /api/*   → http://localhost:1234/api/ (リバースプロキシ)
                    ↓
              Express (Node.js 22, port 1234)
                    ↓
              MariaDB (fbstocks データベース)
```

## 技術スタック

| 項目 | 内容 |
|------|------|
| ランタイム | Node.js 22 |
| フレームワーク | Express 4 |
| 認証 | Passport.js (Google OAuth 2.0) |
| ORM | Sequelize 6 (mysql2) |
| データベース | MariaDB 10.5 |
| フロントエンド | Vanilla JS (フレームワークなし) |
| Webサーバー | Apache 2 (TLS終端・リバースプロキシ) |
| OS | Rocky Linux 9 |
| サービス管理 | systemd |

## ファイル構成

```
fbstocks/
├── CLAUDE.md              # Claude Code向けプロジェクトガイド
├── README.md
├── public/                # Apache が直接配信する静的ファイル
│   ├── index.html
│   ├── css/styles.css
│   ├── js/app.js
│   └── images/
├── backend/
│   ├── server.js          # エントリーポイント (port 1234)
│   ├── app.js             # Express設定 (session, passport, routes)
│   ├── .env               # 環境変数 (Git管理外)
│   ├── auth/passport.js   # Google OAuth戦略
│   ├── middleware/auth.js
│   ├── models/            # Sequelizeモデル
│   │   ├── index.js       # まとめてexport・アソシエーション定義
│   │   ├── User.js
│   │   ├── Stock.js
│   │   ├── Favorite.js
│   │   └── FavoriteSample.js
│   └── routes/api.js      # 全APIルート
└── db/
    ├── schema.sql          # テーブル定義
    └── seeds.sql           # favorite_samplesの初期データ
```

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/IchikabuImpact/fbstocks.git
cd fbstocks
```

### 2. 依存パッケージのインストール

```bash
cd backend
npm install
```

### 3. 環境変数の設定

`backend/.env` を作成:

```env
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=fbstocks
DATABASE_HOST=localhost
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

### 4. データベースの初期化

```bash
mysql -uroot -p fbstocks < db/schema.sql
mysql -uroot -p fbstocks < db/seeds.sql
```

### 5. systemd サービスの登録（本番）

```bash
sudo cp /etc/systemd/system/fbstocks.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fbstocks
```

`/etc/systemd/system/fbstocks.service` の例:

```ini
[Unit]
Description=FBStocks Node.js server
After=network.target mariadb.service

[Service]
Type=simple
User=rocky
WorkingDirectory=/var/www/fbstocks/backend
ExecStart=/home/rocky/.nvm/versions/node/v22.22.0/bin/node server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## 株価データAPI

外部APIを `/api/stock/:ticker` でプロキシしています。

```
GET https://jpx-indicator.pinkgold.space/scrape?ticker=8306
```

レスポンスキー: `companyName`, `currentPrice`, `previousClose`, `dividendYield`, `per`, `pbr`, `marketCap`

## APIエンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/check-auth` | 認証状態の確認 |
| GET | `/api/auth/google` | Googleログイン開始 |
| GET | `/api/auth/google/callback` | OAuthコールバック |
| POST | `/api/logout` | ログアウト |
| GET | `/api/heatmap` | ヒートマップ用銘柄一覧（初回ログイン時にサンプルをコピー）|
| GET | `/api/stock/:ticker` | 株価データ取得（外部APIプロキシ）|
| GET | `/api/favorites` | お気に入り一覧 |
| POST | `/api/favorites/add` | お気に入り追加 |
| POST | `/api/favorites/remove` | お気に入り削除 |

## ローカル開発（WSL）

```bash
# .env の CALLBACK_URL を変更
CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# サーバー起動
cd backend
npm run dev  # nodemon使用
```

GCP OAuth クライアントに以下を追加してください:
- 承認済みJavaScript生成元: `http://localhost:3000`
- 承認済みリダイレクトURI: `http://localhost:3000/api/auth/google/callback`

## サービス管理

```bash
sudo systemctl status fbstocks    # 状態確認
sudo systemctl restart fbstocks   # 再起動
sudo journalctl -u fbstocks -f    # ログをリアルタイムで確認
```

## ライセンス

MIT
