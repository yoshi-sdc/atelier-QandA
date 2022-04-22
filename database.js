require('dotenv').config()
// make connection to database (pool accomodates more user requests)

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDB,
  password: process.env.PGPWD,
  port: process.env.PGPORT
})

pool.connect();

// query for all questions

// function that takes a callback to send result to client
async function getAll(product_id, page, count, callback) {
  var finalResponse = {product_id: product_id}
  // var allQuestions =
  //   `SELECT questions.id, questions.question_body, questions.question_date, questions.asker_name, questions.question_helpfulness, questions.reported, answers.id, answers.body FROM questions
  //   INNER JOIN answers ON answers.question_id=questions.id
  //   INNER JOIN photos ON photos.answer_id=answers.id
  //   WHERE product_id=${product_id}`;
  var allQuestions =
  `SELECT questions.id, questions.question_body, questions.question_date, questions.asker_name, questions.question_helpfulness, questions.reported FROM questions
  WHERE product_id=${product_id}`;
    // var allQuestions =
    // `SELECT id, url FROM photos
    // WHERE answer_id=5`;
  // var allQuestions = `SELECT id, question_body, question_date, asker_name, question_helpfulness, reported FROM questions WHERE product_id=${product_id}`;
  await pool.query(allQuestions)
    .then ((res) => {
      const questions = res.rows;
    })
    .catch(err => console.error('Error querying all questions', err))
  }

  module.exports.getAll = getAll;
  // // iterate over rows and assign answers = result of all answers query
  // const questions = res.rows;
  // finalResponse.results = [];
  // for (let i = 0; i < questions.length; i++) {
  //   const question = questions[i];
  //   // weed out for reported questions
  //   var validQuestions = 0;
  //   if (!question.reported) {
  //     validQuestions += 1;
  //     question['question_id'] = question.id;
  //     delete question.id;
  //     var allAnswers = `SELECT id, body, date, answerer_name, helpfulness FROM answers WHERE question_id=${question['question_id']}`;
  //     // var allAnswers = `SELECT * FROM answers WHERE question_id=${question.id}`;
  //     pool.query(allAnswers)
  //     .then((res) => {
  //       const answers = res.rows;
  //       // iterate over answers to get photos property of answers
  //       for (let j = 0; j < answers.length; j++) {
  //         const answer = answers[j];
  //         question.answers = {};
  //         // weed out for reported answers
  //         if (!answer.reported) {
  //           var id = answer.id;
  //           question.answers[id] = answer;
  //           var allPhotos = `SELECT id, url FROM photos WHERE answer_id=${answer.id}`;
  //           pool.query(allPhotos)
  //             .then((res) => {
  //               const photos = res.rows;
  //               answer.photos = photos | [];
  //               if (j === answers.length - 1) {
  //                 finalResponse.results.push(question);
  //               }
  //             })
  //             .catch(err => console.error('Error querying all photos', err))
  //             .then ((res) => {
  //               if (finalResponse.results.length === validQuestions) {
  //                 callback(finalResponse);
  //               }
  //             })
  //           }
  //       }
  //     })
  //     .catch(err => console.error('Error querying all answers', err))
  //   }
  // }

