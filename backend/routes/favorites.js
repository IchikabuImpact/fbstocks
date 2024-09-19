const express = require('express');
const router = express.Router();
const { Favorite, Stock } = require('../models/associations');

// お気に入り銘柄の一覧取得
router.get('/list', async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [Stock],
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: 'お気に入り銘柄の取得に失敗しました' });
  }
});

// お気に入り銘柄の追加
router.post('/add', async (req, res) => {
  const { ticker } = req.body;
  try {
    const [stock] = await Stock.findOrCreate({
      where: { stock_symbol: ticker },
      defaults: { stock_name: '銘柄名' }, // 必要に応じて設定
    });
    await Favorite.create({
      user_id: req.user.id,
      stock_id: stock.id,
    });
    res.json({ message: 'お気に入りに追加しました' });
  } catch (err) {
    res.status(500).json({ message: 'お気に入りの追加に失敗しました' });
  }
});

// お気に入り銘柄の削除
router.post('/remove', async (req, res) => {
  const { ticker } = req.body;
  try {
    const stock = await Stock.findOne({ where: { stock_symbol: ticker } });
    if (stock) {
      await Favorite.destroy({
        where: {
          user_id: req.user.id,
          stock_id: stock.id,
        },
      });
      res.json({ message: 'お気に入りから削除しました' });
    } else {
      res.status(404).json({ message: '銘柄が見つかりません' });
    }
  } catch (err) {
    res.status(500).json({ message: 'お気に入りの削除に失敗しました' });
  }
});

module.exports = router;
