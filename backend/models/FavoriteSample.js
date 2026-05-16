const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class FavoriteSample extends Model {}

FavoriteSample.init({
  stock_symbol: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  stock_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'FavoriteSample',
  tableName: 'favorite_samples',
});

module.exports = FavoriteSample;
