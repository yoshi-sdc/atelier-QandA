require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.SERVERPORT;

var router = require('./routes.js');

app.use(express.json());

app.get(`/${process.env.LOADER}`, (req, res) => {
  res.send(`${process.env.LOADER}`);
});

app.use('/qa', router);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})

module.exports = app;
