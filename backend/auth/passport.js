const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models'); // sequelizeインスタンスは不要
require('dotenv').config();

// Googleストラテジーの設定
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // ユーザーの検索または作成
    let user = await User.findOne({ where: { email: profile.emails[0].value } });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// シリアライズとデシリアライズ
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
