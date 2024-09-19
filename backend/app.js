const express = require('express');
const session = require('express-session');
const passport = require('./auth/passport');
const apiRouter = require('./routes/api');
require('dotenv').config();

const app = express();

// セッションの設定
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Passportの初期化
app.use(passport.initialize());
app.use(passport.session());

// JSONのパース
app.use(express.json());

// ルーティング
app.use('/api', apiRouter);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true, // HTTPSを使用している場合はtrue
        sameSite: 'lax',
    },
}));

module.exports = app;
