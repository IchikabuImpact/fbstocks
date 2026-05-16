const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated } = require('../middleware/auth');
const { User, Stock, Favorite, FavoriteSample } = require('../models');

const SCRAPE_API = 'https://jpx-indicator.pinkgold.space/scrape';

async function fetchStockData(ticker) {
  const res = await fetch(`${SCRAPE_API}?ticker=${ticker}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getSampleTickers() {
  const samples = await FavoriteSample.findAll({ order: [['id', 'ASC']] });
  return samples.map(s => s.stock_symbol);
}

// ─── Auth ──────────────────────────────────────────────────────────────────

router.get('/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: { name: req.user.name, email: req.user.email } });
  } else {
    res.json({ isAuthenticated: false });
  }
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);

router.post('/logout', (req, res) => {
  req.logout(() => res.json({ ok: true }));
});

// ─── Stock proxy ────────────────────────────────────────────────────────────

router.get('/stock/:ticker', async (req, res) => {
  const { ticker } = req.params;
  if (!/^\d{4}$/.test(ticker)) {
    return res.status(400).json({ error: '4桁の証券コードを指定してください' });
  }
  try {
    const data = await fetchStockData(ticker);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'データ取得に失敗しました' });
  }
});

// ─── Heatmap ─────────────────────────────────────────────────────────────────

router.get('/heatmap', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.json({ tickers: [], isLoggedIn: false });
    }

    let favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Stock }],
      order: [['created_at', 'ASC']],
    });

    // 初回ログイン：favorite_samples を favorites に移植する
    let isFirstVisit = false;
    if (favorites.length === 0) {
      isFirstVisit = true;
      const samples = await FavoriteSample.findAll({ order: [['id', 'ASC']] });
      for (const sample of samples) {
        const [stock] = await Stock.findOrCreate({
          where: { stock_symbol: sample.stock_symbol },
          defaults: { stock_name: sample.stock_name || sample.stock_symbol },
        });
        await Favorite.findOrCreate({
          where: { user_id: req.user.id, stock_id: stock.id },
        });
      }
      favorites = await Favorite.findAll({
        where: { user_id: req.user.id },
        include: [{ model: Stock }],
        order: [['created_at', 'ASC']],
      });
    }

    res.json({
      tickers: favorites.map(f => f.Stock.stock_symbol),
      isLoggedIn: true,
      isFirstVisit,
    });
  } catch (err) {
    res.status(500).json({ error: 'ヒートマップデータの取得に失敗しました' });
  }
});

// ─── Favorites ───────────────────────────────────────────────────────────────

router.get('/favorites', ensureAuthenticated, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Stock }],
      order: [['created_at', 'ASC']],
    });
    res.json(favorites.map(f => ({
      ticker: f.Stock.stock_symbol,
      name: f.Stock.stock_name,
    })));
  } catch (err) {
    res.status(500).json({ error: 'お気に入りの取得に失敗しました' });
  }
});

router.post('/favorites/add', ensureAuthenticated, async (req, res) => {
  const { ticker } = req.body;
  if (!/^\d{4}$/.test(ticker)) {
    return res.status(400).json({ error: '4桁の証券コードを入力してください' });
  }
  try {
    let stockName = ticker;
    try {
      const data = await fetchStockData(ticker);
      if (data.companyName) {
        stockName = data.companyName.replace(/^\d{4}[\s　]+/, '').trim();
      }
    } catch (_) {}

    const [stock] = await Stock.findOrCreate({
      where: { stock_symbol: ticker },
      defaults: { stock_name: stockName },
    });

    const [, created] = await Favorite.findOrCreate({
      where: { user_id: req.user.id, stock_id: stock.id },
    });

    if (!created) {
      return res.status(409).json({ error: 'すでにお気に入りに追加されています' });
    }

    res.json({ ok: true, ticker, name: stock.stock_name });
  } catch (err) {
    res.status(500).json({ error: 'お気に入りの追加に失敗しました' });
  }
});

router.post('/favorites/remove', ensureAuthenticated, async (req, res) => {
  const { ticker } = req.body;
  try {
    const stock = await Stock.findOne({ where: { stock_symbol: ticker } });
    if (stock) {
      await Favorite.destroy({ where: { user_id: req.user.id, stock_id: stock.id } });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'お気に入りの削除に失敗しました' });
  }
});

module.exports = router;
