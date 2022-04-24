// set up express and build out endpoints
require('dotenv').config()
const express = require('express');
const app = express();
const psql = require('./database.js');
const port = process.env.SERVERPORT;

app.use(express.json());

app.get('/qa/questions', async (req, res) => {
  // will get as parameters: product_id, page (default 1), count (per page, default 5);
  try {
    const product_id = req.query.product_id;
    const page = req.query.page || 1;
    const count = req.query.count || 5;
    // call database with product id, page, count, and callback to send results
    await psql.getAll(product_id, page, count, (data) => {
      res.status(200);
      res.send(data);
    })
  } catch (err) {
    console.log('Error getting all from server', err);
    res.sendStatus(400);
  }
})

app.get('/qa/questions/:question_id/answers', async (req, res) => {
  try {
    const question_id = req.params.question_id;
    const page = req.query.page || 1;
    const count = req.query.count || 5;
    // call database with product id, page, count, and callback to send results
    await psql.getAnswers(question_id, page, count, (data) => {
    res.status(200);
    res.send(data);
    })
  } catch (err) {
    console.log('Error getting answers from server', err);
    res.sendStatus(400);
  }
})

app.post('/qa/questions', async (req, res) => {
  try {
    // call database with product id, page, count, and callback to send results
    await psql.addQuestion(req.body.product_id, req.body.body, req.body.name, req.body.email)
    res.sendStatus(201);
  } catch (err) {
    console.log('Error posting question from server', err);
    res.sendStatus(400);
  }
})

app.put('/qa/questions/:question_id/helpful', async (req, res) => {
  try {
    await psql.helpfulQuestion(req.params.question_id)
    res.sendStatus(204);
  } catch (err) {
    console.log('Error putting question helpfulness from server', err);
    res.sendStatus(400);
  }
})

app.put('/qa/questions/:question_id/report', async (req, res) => {
  try {
    await psql.reportQuestion(req.params.question_id)
    res.sendStatus(204);
  } catch (err) {
    console.log('Error putting question report from server', err);
    res.sendStatus(400);
  }
})

app.post('/qa/questions/:question_id/answers', async (req, res) => {
  try {
    const question_id = parseInt(req.params.question_id);
    await psql.addAnswer(question_id, req.body.body, req.body.name, req.body.email, req.body.photos)
    res.sendStatus(201);
  } catch (err) {
    console.log('Error posting answer from server', err);
    res.sendStatus(400);
  }
})

app.put('/qa/answers/:answer_id/helpful', async (req, res) => {
  try {
    await psql.helpfulAnswer(req.params.answer_id)
    res.sendStatus(204);
  } catch (err) {
    console.log('Error putting answer helpfulness from server', err);
    res.sendStatus(400);
  }
})

app.put('/qa/answers/:answer_id/report', async (req, res) => {
  try {
    await psql.reportAnswer(req.params.answer_id)
    res.sendStatus(204);
  } catch (err) {
    console.log('Error putting answer report from server', err);
    res.sendStatus(400);
  }
})



app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})

module.exports = app;