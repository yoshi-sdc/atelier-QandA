const router = require('express').Router();
const question = require('./controllers/questions.js');
const answer = require('./controllers/answers.js');

router.get('/questions', question.getAll);

router.post('/questions', question.addQuestion);

router.put('/questions/:question_id/helpful', question.helpfulQuestion);

router.put('/questions/:question_id/report', question.reportQuestion);

router.get('/questions/:question_id/answers', answer.getAnswers);

router.post('/questions/:question_id/answers', answer.addAnswer);

router.put('/answers/:answer_id/helpful', answer.helpfulAnswer);

router.put('/answers/:answer_id/report', answer.reportAnswer);

module.exports = router;
