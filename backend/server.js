const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const port = process.env.PORT || 1234;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
})();
