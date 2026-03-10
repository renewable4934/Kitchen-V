// Load local .env variables before the app reads config values.
require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config');

app.listen(config.port, () => {
  console.log(`Kitchen_V server started on http://localhost:${config.port}`);
});
