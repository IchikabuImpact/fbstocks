// 楽天証券の保有銘柄(assset-balance-rakutensec)を取得し、
// ヒートマップに表示する対象ユーザーのお気に入りをその内容で入れ替える日次バッチ。
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize, User } = require('../models');
const { dedupeByCode, replaceFavoritesForUser } = require('../lib/replaceFavorites');

if (!process.env.SYNC_HOLDINGS_VERBOSE) {
  sequelize.options.logging = false;
}

const HOLDINGS_API = process.env.HOLDINGS_API_URL || 'http://localhost:4600/api/jpxtocks';
const TARGET_USER_EMAIL = process.env.HOLDINGS_TARGET_EMAIL || 'kenchanbaken@gmail.com';

async function fetchHoldings() {
  const res = await fetch(HOLDINGS_API, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.holdings || [];
}

async function main() {
  const holdings = await fetchHoldings();
  const symbolMap = dedupeByCode(holdings);

  if (symbolMap.size === 0) {
    throw new Error('保有銘柄(4桁コード)が0件だったため中止しました');
  }

  const user = await User.findOne({ where: { email: TARGET_USER_EMAIL } });
  if (!user) {
    throw new Error(`ユーザーが見つかりません: ${TARGET_USER_EMAIL}`);
  }

  const { total, added, removed } = await replaceFavoritesForUser(user.id, symbolMap);
  console.log(`[sync-holdings] ${new Date().toISOString()} 保有銘柄数=${total} 追加=${added} 削除=${removed}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[sync-holdings] failed:', err);
    process.exit(1);
  });
