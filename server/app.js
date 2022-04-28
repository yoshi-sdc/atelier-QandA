require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.SERVERPORT;

var router = require('./routes.js');

app.use(express.json());
app.get ('ec2-54-177-194-184.us-west-1.compute.amazonaws.com:3000/loaderio-86f2e33a233b27c25850d8e19e495686.txt', (req, res) => {
  res.sendFile('loaderio-86f2e33a233b27c25850d8e19e495686.txt', function (err) {
    if (err) {
      console.log(err);
    }
  });
});

app.use('/qa', router);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})

module.exports = app;
