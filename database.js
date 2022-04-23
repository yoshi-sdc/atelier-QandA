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
  try {
    const skipped = (page - 1) * count;
    const allQuestions =
    `SELECT json_agg(json_build_object('question_id', q_id, 'question_body', question_body, 'question_date', question_date, 'asker_name', asker_name,
      'question_helpfulness', question_helpfulness, 'reported', reported, 'answers',
      (SELECT json_object_agg(a_id,
        json_build_object('id', a_id, 'body', body, 'date', date, 'answerer_name', answerer_name, 'helpfulness', helpfulness, 'photos',
          (SELECT array_agg(url) FROM photos WHERE answer_id=a_id)))
      FROM answers a
      WHERE question_id=5 AND a.reported=false))) AS results
    FROM questions q
    WHERE product_id=${product_id} AND q.reported=false
    GROUP BY product_id
    LIMIT ${count}
    OFFSET ${skipped}
    `

    await pool.query(allQuestions)
      .then((res) => {
        const results = res.rows;
        var response = {
          product_id: product_id
        };;
        callback(results)
      })
  } catch(err) {
    console.error('Error querying all questions', err)
  }
}

async function getAnswers(q_id, page, count, callback) {
  try {
    const skipped = (page - 1) * count;
    const allAnswers =
    `SELECT a_id AS answer_id, body, date, answerer_name, helpfulness,
      (SELECT json_agg(json_build_object('id', p_id, 'url', url))
      FROM photos WHERE answer_id=a_id) AS photos
    FROM answers a
    WHERE question_id=${q_id} AND reported=false
    LIMIT ${count}
    OFFSET ${skipped}`
    await pool.query(allAnswers)
      .then((res) => {
        var results = res.rows
        const response = {
          question: q_id,
          page: page,
          count: count,
          results: results
        };
        callback(response)
      })
  } catch (err) {
    console.error('Error querying answers', err)
  }
}

async function addQuestion(product_id, body, name, email) {
  try {
    const addQuestion =
    `INSERT INTO questions
      (product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness)
    VALUES
      (${product_id}, ${body}, extract('epoch' from CURRENT_TIMESTAMP)::bigint, ${name}, ${email}, false, 0)`;
    await pool.query(addQuestion)
  } catch (err) {
    console.error('Error adding question to database', err);
  }
}

async function helpfulQuestion(question_id) {
  try {
    const helpfulQ =
    `UPDATE questions
    SET question_helpfulness = question_helpfulness + 1
    WHERE q_id=${question_id}`;
    await pool.query(helpfulQ)
  } catch (err) {
    console.error('Error marking question as helpful in db', err);
  }
}

async function reportQuestion(question_id) {
  try {
    const reportQ =
    `UPDATE questions
    SET reported = true
    WHERE q_id=${question_id}`;
    await pool.query(reportQ)
  } catch (err) {
    console.error('Error reporting question in db', err);
  }
}

async function addAnswer(question_id, body, name, email, photos) {
  try{
  // if answer seq out of sync
    // run queries to fix
  // add answer associated with question
  const addAnswer =
  `INSERT INTO answers
    (question_id, body, date, answerer_name, answerer_email, reported, helpfulness)
  VALUES
    (${question_id}, ${body}, extract('epoch' from CURRENT_TIMESTAMP)::bigint, ${name}, ${email}, false, 0)
  RETURNING a_id`;
  await pool.query(addAnswer)
    .then((res) => {
      var answerId = res.rows;
      if (photos.length > 0) {
        var photoVals = ''
        for (let i = 0; i < photos.length; i++) {
          if (i === photos.length - 1) {
            photoVals.concat(`(${answerId}, ${photos[i]})`)
          } else {
            photoVals.concat(`(${answerId}, ${photos[i]}), `)
          }
        }
        const addPhotos =
        `INSERT INTO photos
          (answer_id, url)
        VALUES
          ${photoVals}`
        pool.query(addPhotos)
        .catch(err => console.error('Error adding photos', err))
      }
    })
  // add photos (maybe use spread operator to add all photos at once)
  } catch(err) {
    console.error('Error adding answer to database', err);
  }
}

async function helpfulAnswer(answer_id) {
  try {
    const helpfulA =
    `UPDATE answers
    SET helpfulness = helpfulness + 1
    WHERE a_id=${answer_id}`;
    await pool.query(helpfulA)
  } catch (err) {
    console.error('Error marking answer as helpful in db', err);
  }
}

async function reportAnswer(answer_id) {
  try {
    const reportA =
    `UPDATE answers
    SET reported = true
    WHERE a_id=${answer_id}`;
    await pool.query(reportA)
  } catch (err) {
    console.error('Error reporting answer in db', err);
  }
}



  module.exports.getAll = getAll;
  module.exports.getAnswers = getAnswers;
  module.exports.addQuestion = addQuestion;
  module.exports.helpfulQuestion = helpfulQuestion;
  module.exports.reportQuestion = reportQuestion;
  module.exports.addAnswer = addAnswer;
  module.exports.helpfulAnswer = helpfulAnswer;
  module.exports.reportAnswer = reportAnswer;

