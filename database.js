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

// NEED TO FIGURE OUT HOW TO LIMIT AND OFFSET
async function getAll(product_id, page, count, callback) {
  try {
    const skipped = (page - 1) * count;
    const allQuestions =
    `SELECT product_id, json_agg(json_build_object('question_id', q_id, 'question_body', question_body, 'question_date', TO_TIMESTAMP(question_date / 1000), 'asker_name', asker_name,
      'question_helpfulness', question_helpfulness, 'reported', reported, 'answers',
      (SELECT json_object_agg(a_id,
        json_build_object('id', a_id, 'body', body, 'date', TO_TIMESTAMP(date / 1000), 'answerer_name', answerer_name, 'helpfulness', helpfulness, 'photos',
          (SELECT array_agg(url) FROM photos WHERE answer_id=a_id)))
      FROM answers a
      WHERE question_id=q_id AND a.reported=false))) AS results
    FROM questions q
    WHERE product_id=${product_id} AND q.reported=false
    GROUP BY product_id`
    const client = await pool.connect();
    await client.query(allQuestions)
      .then((res) => {
        client.release();
        const results = res.rows;
        callback(results[0])
      })
  } catch(err) {
    console.error('Error querying all questions', err)
  }
}

async function getAnswers(q_id, page, count, callback) {
  try {
    const skipped = (page - 1) * count;
    const allAnswers =
    `SELECT a_id AS answer_id, body, TO_TIMESTAMP(date / 1000), answerer_name, helpfulness,
      (SELECT json_agg(json_build_object('id', p_id, 'url', url))
      FROM photos WHERE answer_id=a_id) AS photos
    FROM answers a
    WHERE question_id=${q_id} AND reported=false
    LIMIT ${count}
    OFFSET ${skipped}`
    const client = await pool.connect();
    await client.query(allAnswers)
      .then((res) => {
        client.release();
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
      (${product_id}, '${body}', EXTRACT(EPOCH from CURRENT_TIMESTAMP)::bigint * 1000, '${name}', '${email}', false, 0)
      RETURNING q_id`;
    const client = await pool.connect();
    await client.query(addQuestion)
      .then(() => {
        client.release();
    })
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
    const client = await pool.connect();
    await client.query(helpfulQ)
      .then(() => {
        client.release();
      })
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
    const client = await pool.connect();
    await client.query(reportQ)
      .then(() => {
        client.release();
      })
  } catch (err) {
    console.error('Error reporting question in db', err);
  }
}

async function addAnswer(question_id, body, name, email, photos) {
  try {
    const addAnswer =
    `INSERT INTO answers
      (question_id, body, date, answerer_name, answerer_email, reported, helpfulness)
    VALUES
      (${question_id}, '${body}', EXTRACT(EPOCH from CURRENT_TIMESTAMP)::bigint * 1000, '${name}', '${email}', false, 0)
    RETURNING a_id`;
    const client = await pool.connect();
    await client.query(allQuestions)
      .then((res) => {
        client.release();
        const answerId = res.rows[0]['a_id'];
        if (photos.length > 0) {
          for (let i = 0; i < photos.length; i++) {
            const url = photos[i];
            const addPhotos =
            `INSERT INTO photos
            (answer_id, url)
            VALUES (${answerId}, '${url}')`;
            pool.query(addPhotos)
              .catch(err => console.error('Error adding photos', err))
          }
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
    const client = await pool.connect();
    await client.query(helpfulA)
      .then(() => {
        client.release();
      })
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
    const client = await pool.connect();
    await client.query(reportA)
      .then(() => {
        client.release();
      })
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

