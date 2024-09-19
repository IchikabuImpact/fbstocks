const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class Stock extends Model {}

Stock.init({
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
  modelName: 'Stock',
  tableName: 'stocks', // テーブル名を明示的に指定
});

module.exports = Stock;
