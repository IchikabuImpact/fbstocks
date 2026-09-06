const { Stock, Favorite } = require('../models');

// 国内株式の4桁証券コードのみを対象に、同一コードの重複行(複数口座保有等)を排除する
function dedupeByCode(holdings) {
  const map = new Map();
  for (const h of holdings) {
    const code = h.security_code;
    if (!/^\d{4}$/.test(code || '')) continue;
    if (h.asset_type && h.asset_type !== '国内株式') continue;
    if (!map.has(code)) {
      map.set(code, (h.security_name || code).trim());
    }
  }
  return map;
}

// userId のお気に入りを symbolMap(code -> name) の内容に完全入れ替えする
async function replaceFavoritesForUser(userId, symbolMap) {
  const stockIds = [];
  for (const [symbol, name] of symbolMap) {
    const [stock, created] = await Stock.findOrCreate({
      where: { stock_symbol: symbol },
      defaults: { stock_name: name },
    });
    if (!created && name && stock.stock_name !== name) {
      await stock.update({ stock_name: name });
    }
    stockIds.push(stock.id);
  }

  const currentFavorites = await Favorite.findAll({ where: { user_id: userId } });
  const newStockIds = new Set(stockIds);
  const currentStockIds = new Set(currentFavorites.map((f) => f.stock_id));

  const toRemove = currentFavorites.filter((f) => !newStockIds.has(f.stock_id)).map((f) => f.stock_id);
  const toAdd = stockIds.filter((id) => !currentStockIds.has(id));

  if (toRemove.length) {
    await Favorite.destroy({ where: { user_id: userId, stock_id: toRemove } });
  }
  for (const stock_id of toAdd) {
    await Favorite.findOrCreate({ where: { user_id: userId, stock_id } });
  }

  return { total: symbolMap.size, added: toAdd.length, removed: toRemove.length };
}

module.exports = { dedupeByCode, replaceFavoritesForUser };
