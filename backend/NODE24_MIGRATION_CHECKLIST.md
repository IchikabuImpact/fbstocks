# Node.js v24 移行チェックリスト（本番安全運用）

## 0. 重要な前提
- 指定の `v24.13.0` は `nvm` 上で取得不可の可能性があります（`Version '24.13.0' not found`）。
- まず `nvm ls-remote | rg 'v24\.'` で利用可能な v24 系を確認してください。
- 既存本番の Node v22.22.0 は残し、即時ロールバック可能な状態を維持してください。

## 1. 現在の起動方法確認
```bash
# 1) systemd の有無・サービス確認
systemctl status fbstocks --no-pager
systemctl cat fbstocks

# 2) pm2 の有無確認
pm2 ls
pm2 describe fbstocks

# 3) 手動起動判定 + 実行コマンド確認
ps -eo pid,user,lstart,cmd | rg 'node|server.js' | rg -v rg

# 4) 起動中プロセスの cwd（PID は上記で取得）
readlink -f /proc/<PID>/cwd
```

判定ルール:
- `systemctl status` が active なら systemd 管理。
- `pm2 ls` に対象があれば pm2 管理。
- どちらにも無く node が存在すれば手動起動。

## 2. 変更前バックアップ（必須）
```bash
# 日付付きバックアップディレクトリ
TS=$(date +%Y%m%d-%H%M%S)
mkdir -p ~/backup/fbstocks-$TS

# systemd service
sudo cp /etc/systemd/system/fbstocks.service ~/backup/fbstocks-$TS/fbstocks.service.bak

# アプリ依存ファイル
cp /var/www/fbstocks/backend/package.json ~/backup/fbstocks-$TS/package.json.bak
cp /var/www/fbstocks/backend/package-lock.json ~/backup/fbstocks-$TS/package-lock.json.bak
```

## 3. Node v24 の静的確認（本番非破壊）
```bash
cd /var/www/fbstocks/backend
source ~/.nvm/nvm.sh

# 指定版が無い場合は v24 系利用可能版に読み替え
nvm use 24.13.0
node -v
npm -v

node -c server.js
node -c app.js
npm ls --depth=0
```

注意:
- `npm update` は実施しない。
- `npm install` も原則行わない（lock 更新回避）。

## 4. 別ポート一時起動確認（可能な場合のみ）
```bash
# 既存ポート確認（例: 1234）
ss -ltnp | rg ':1234|node'

# .env に PORT があっても上書きして衝突回避
cd /var/www/fbstocks/backend
source ~/.nvm/nvm.sh
nvm use 24.13.0
PORT=12434 NODE_ENV=production /home/rocky/.nvm/versions/node/v24.13.0/bin/node server.js
```

別ターミナルで:
```bash
curl -i http://127.0.0.1:12434/
curl -i http://127.0.0.1:12434/api/check-auth
```

DB確認:
- 起動ログに Sequelize / DB 接続エラーが無いこと。
- `journalctl` または標準出力に `ECONNREFUSED`, `ER_ACCESS_DENIED_ERROR` が無いこと。

## 5. systemd の ExecStart 切り替え
```bash
# 編集前確認
sudo systemctl cat fbstocks

# 編集
sudoedit /etc/systemd/system/fbstocks.service
# ExecStart を以下へ変更
# /home/rocky/.nvm/versions/node/v24.13.0/bin/node server.js

# 反映
sudo systemctl daemon-reload
sudo systemctl restart fbstocks
```

## 6. restart 後確認
```bash
systemctl status fbstocks --no-pager
journalctl -u fbstocks -n 100 --no-pager
curl -i http://127.0.0.1:1234/
ps aux | rg '/home/rocky/.nvm/versions/node/v24.13.0/bin/node|server.js' | rg -v rg
```

## 7. 即時ロールバック手順（v22.22.0）
```bash
# service ファイルをバックアップから戻す
sudo cp ~/backup/fbstocks-<TS>/fbstocks.service.bak /etc/systemd/system/fbstocks.service

# もしくは ExecStart を直接戻す
# /home/rocky/.nvm/versions/node/v22.22.0/bin/node server.js

sudo systemctl daemon-reload
sudo systemctl restart fbstocks

# 確認
systemctl status fbstocks --no-pager
journalctl -u fbstocks -n 100 --no-pager
ps aux | rg '/home/rocky/.nvm/versions/node/v22.22.0/bin/node|server.js' | rg -v rg
```
