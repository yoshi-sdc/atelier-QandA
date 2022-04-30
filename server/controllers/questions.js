/* eslint-disable camelcase */
const models = require('../models/questions');

exports.getAll = async (req, res) => {
  try {
    const { product_id } = req.query;
    const page = req.query.page || 1;
    const count = req.query.count || 5;
    await models.getAll(product_id, page, count, (data) => {
      res.status(200);
      res.send(data);
    });
  } catch (err) {
    console.log('Error getting all from server', err);
    res.sendStatus(400);
  }
};

exports.addQuestion = async (req, res) => {
  try {
    await models.addQuestion(req.body.product_id, req.body.body, req.body.name, req.body.email);
    res.status(201).send('Question posted.');
  } catch (err) {
    console.log('Error posting question from server', err);
    res.sendStatus(400);
  }
};

exports.helpfulQuestion = async (req, res) => {
  try {
    await models.helpfulQuestion(req.params.question_id);
    res.status(204).send('Question marked as helpful.');
  } catch (err) {
    console.log('Error putting question helpfulness from server', err);
    res.sendStatus(400);
  }
};

exports.reportQuestion = async (req, res) => {
  try {
    await models.reportQuestion(req.params.question_id);
    res.status(204).send('Question reported.');
  } catch (err) {
    console.log('Error putting question report from server', err);
    res.sendStatus(400);
  }
};
