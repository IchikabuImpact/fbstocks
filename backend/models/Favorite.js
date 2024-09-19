const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class Favorite extends Model {}

Favorite.init({
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users', // テーブル名を小文字で指定
      key: 'id',
    },
  },
  stock_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'stocks', // テーブル名を小文字で指定
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Favorite',
  tableName: 'favorites', // テーブル名を明示的に指定
});

module.exports = Favorite;
