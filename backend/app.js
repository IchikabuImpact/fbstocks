const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('./auth/passport');
const apiRouter = require('./routes/api');
require('dotenv').config();

const app = express();

// Apache がリバースプロキシのため X-Forwarded-* を信頼する
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // Apache で TLS 終端しているため Node.js 側は HTTP。
    // secure:true にすると Apache→Node 間が HTTP のため Cookie が発行されない。
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use('/api', apiRouter);
// 本番はApacheが静的配信するが、Apacheなしのローカル/LAN実行用にExpressからも配信する
app.use(express.static(path.join(__dirname, '..', 'public')));

module.exports = app;
