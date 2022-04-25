const models = require('../models/answers.js');
const app = require('../app.js');

exports.getAnswers = async (req, res) => {
  try {
    const question_id = req.params.question_id;
    const page = req.query.page || 1;
    const count = req.query.count || 5;
    await models.getAnswers(question_id, page, count, (data) => {
    res.status(200);
    res.send(data);
    })
  } catch (err) {
    console.log('Error getting answers from server', err);
    res.sendStatus(400);
  }
}

exports.addAnswer = async (req, res) => {
  try {
    const question_id = parseInt(req.params.question_id);
    await models.addAnswer(question_id, req.body.body, req.body.name, req.body.email, req.body.photos)
    res.status(201).send('Answer added.');
  } catch (err) {
    console.log('Error posting answer from server', err);
    res.sendStatus(400);
  }
}

exports.helpfulAnswer = async (req, res) => {
  try {
    await models.helpfulAnswer(req.params.answer_id)
    res.status(204).send('Answer marked as helpful.');
  } catch (err) {
    console.log('Error putting answer helpfulness from server', err);
    res.sendStatus(400);
  }
}

exports.reportAnswer = async (req, res) => {
  try {
    await models.reportAnswer(req.params.answer_id)
    res.status(204).send('Answer reported.');
  } catch (err) {
    console.log('Error putting answer report from server', err);
    res.sendStatus(400);
  }
}
