// set up express and build out endpoints
require('dotenv').config()
const express = require('express');
const app = express();
const psql = require('./database.js');
const port = process.env.SERVERPORT;

app.use(express.json());

app.get('/qa/questions', (req, res) => {
  // will get as parameters: product_id, page (default 1), count (per page, default 5);
  const product_id = req.query.product_id;
  const page = req.query.page | 1;
  const count = req.query.count | 5;
  // call database with product id, page, count, and callback to send results
  psql.getAll(product_id, page, count, (data) => {
    // if (err) {
    //   console.log('Error getting all from server', err);
    //   res.sendStatus(400);
    // } else {
    res.status(200);
    res.send(data);
    // }
  })
})

// app.get('/qa/questions/:question_id/answers', (req, res) => {
//   // use req.params.question_id, req.query.page / count
//   res.send('getting answers');
// })

// app.post('qa/questions', (req, res) => {
//   // use req.body / name / email / product_id
//   res.send('adding question');
// })

// app.put('/questions/:question_id/helpful', (req, res) => {
//   // use req.query.question_id
//   res.send('marking question as helpful');
// })

// app.put('/questions/:question_id/report', (req, res) => {
//   // use req.query.question_id
//   res.send('reporting question');
// })

// app.post('/questions/:question_id/answers', (req, res) => {
//   // use req.query.question_id, req.body.body / name / email / photos
//   res.send('adding answer');
// })

// app.put('/questions/:answer_id/helpful', (req, res) => {
//   // use req.query.answer_id
//   res.send('marking answer as helpful');
// })

// app.put('/questions/:answer_id/report', (req, res) => {
//   // use req.query.answer_id
//   res.send('reporting answer');
// })



app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})