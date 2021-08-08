
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { installHandler } = require('./api_handler.js');
const auth = require('./auth.js');

const app = express();
app.use(cookieParser());
app.use('/auth', auth.routes);

const port = process.env.API_SERVER_PORT || 3000;

(async function start() {
  installHandler(app);

  try {
    app.listen(port, () => {
      console.log(`API server started on port ${port}`);
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
}());
