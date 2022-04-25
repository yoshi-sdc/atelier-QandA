const controller = require('./controllers');
const router = require('express').Router();

router.get('/questions', controller.questions.getAll);

router.get('/questions/:question_id/answers', controller.answers.getAnswers);

module.exports = router;