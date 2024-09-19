const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated } = require('../middleware/auth');
const favoritesRouter = require('./favorites');

// 認証ルート
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/api/dashboard');
  }
);

// ダッシュボード
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send(`こんにちは、${req.user.name}さん`);
});

// お気に入り銘柄のルート
router.use('/favorites', ensureAuthenticated, favoritesRouter);

// ログアウトエンドポイント
router.post('/logout', (req, res) => {
    req.logout(() => {
        res.json({ message: 'Logged out' });
    });
});

module.exports = router;
