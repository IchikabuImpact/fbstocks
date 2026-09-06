#!/usr/bin/env bash
# 日次バッチ: assset-balance-rakutensecの保有銘柄でfbstocksのお気に入りを入れ替える。
# cron実行例 (平日8:50, CRON_TZ=Asia/Tokyo):
#   50 8 * * 1-5 /home/ichikabu/projects/fbstocks/backend/scripts/sync_holdings.sh >> /home/ichikabu/projects/fbstocks/backend/sync_holdings.log 2>&1
set -euo pipefail
source "$HOME/.nvm/nvm.sh"
cd "$(dirname "$0")/.."
node scripts/syncHoldingsFavorites.js
