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

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro acquiring client', err);
  }
});

// function that takes a callback to send result to client
async function getAll(product_id, page, count, callback) {
  var finalResponse = {product_id: product_id}
  const skipped = (page - 1) * count;
  var allQuestions =
  `WITH q AS (
    SELECT *
    FROM questions q
    WHERE product_id=${product_id} AND q.q_id > ${skipped}
    ORDER BY q.q_id
    LIMIT ${count})
  SELECT *
  FROM q
  JOIN answers a
  ON a.question_id=q.q_id
  LEFT JOIN photos p
  ON p.answer_id=a.a_id
  WHERE q.reported=false AND a.reported=false
  ORDER BY q.q_id`;
  await pool.query(allQuestions)
  .then ((res) => {
    const data = res.rows;
    var results = [];
    var lastQ;
    // iterate through data
    for (let i = 0; i < data.length; i++) {
      // if question id not already seen
      const current = data[i];
      if (!lastQ || lastQ['question_id'] !== current['q_id']) {
        // make new object
        var questionObj = {
          question_id: current['q_id'],
          question_body: current['question_body'],
          question_date: current['question_date'],
          asker_name: current['asker_name'],
          question_helpfulness: current['question_helpfulness'],
          reported: false,
          answers: {}
        }
        lastQ = questionObj;
        results.push(questionObj);
      }
      // if answer has not been seen before
      if (!lastQ.answers['a_id'])
        // create new answer object
        var answerObj = {
          id: current['a_id'],
          body: current['body'],
          date: current['date'],
          answerer_name: current['answerer_name'],
          answerer_email: current['answerer_email'],
          helpfulness: current['helpfulness'],
          photos: []
        }
        lastQ.answers['a_id'] = answerObj;
      // photos are always going to be unique, so if it exists, push it into answer's photos
      if (current['p_id']) {
        var photoObj = {
          id: current['p_id'],
          url: current['url']
        }
          lastQ.answers['a_id'].photos.push(photoObj);
      }
    }
    finalResponse['results'] = results;
    callback(finalResponse);
    })
    .catch(err => console.error('Error querying all questions', err))
  }

  module.exports.getAll = getAll;

