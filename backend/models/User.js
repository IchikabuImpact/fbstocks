const { DataTypes, Model } = require('sequelize');
const sequelize = require('./database');

class User extends Model {}

User.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users', // テーブル名を明示的に指定
});

module.exports = User;
