const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(1234, () => {
      console.log('Server is running on port 1234');
    });
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
})();
