const sequelize = require('./database');

const User = require('./User');
const Stock = require('./Stock');
const Favorite = require('./Favorite');

// リレーションの設定
User.belongsToMany(Stock, { through: Favorite, foreignKey: 'user_id', otherKey: 'stock_id' });
Stock.belongsToMany(User, { through: Favorite, foreignKey: 'stock_id', otherKey: 'user_id' });

// モデルとsequelizeインスタンスをエクスポート
module.exports = {
  sequelize,
  User,
  Stock,
  Favorite,
};
