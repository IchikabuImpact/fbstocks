const sequelize = require('./database');
const User = require('./User');
const Stock = require('./Stock');
const Favorite = require('./Favorite');
const FavoriteSample = require('./FavoriteSample');

User.belongsToMany(Stock, { through: Favorite, foreignKey: 'user_id', otherKey: 'stock_id' });
Stock.belongsToMany(User, { through: Favorite, foreignKey: 'stock_id', otherKey: 'user_id' });
Favorite.belongsTo(Stock, { foreignKey: 'stock_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Stock, Favorite, FavoriteSample };
