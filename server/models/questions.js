/* eslint-disable camelcase */
const pool = require('../db/database');

module.exports = {
  getAll: async function getAll(product_id, page, count, callback) {
    try {
      // const skipped = (page - 1) * count;
      const allQuestions = `SELECT product_id, json_agg(json_build_object('question_id', q_id, 'question_body', question_body, 'question_date', TO_TIMESTAMP(question_date / 1000), 'asker_name', asker_name,
        'question_helpfulness', question_helpfulness, 'reported', reported, 'answers',
        (SELECT json_object_agg(a_id,
          json_build_object('id', a_id, 'body', body, 'date', TO_TIMESTAMP(date / 1000), 'answerer_name', answerer_name, 'helpfulness', helpfulness, 'photos',
            (SELECT array_agg(url) FROM photos WHERE answer_id=a_id)))
        FROM answers a
        WHERE question_id=q_id AND a.reported=false))) AS results
      FROM questions q
      WHERE product_id=${product_id} AND q.reported=false
      GROUP BY product_id`;
      const client = await pool.connect();
      await client.query(allQuestions)
        .then((res) => {
          client.release();
          const results = res.rows;
          callback(results[0]);
        });
    } catch (err) {
      console.error('Error querying all questions', err);
    }
  },
  addQuestion: async function addQuestion(product_id, body, name, email) {
    try {
      const addQ = `INSERT INTO questions
        (product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness)
      VALUES
        (${product_id}, '${body}', EXTRACT(EPOCH from CURRENT_TIMESTAMP)::bigint * 1000, '${name}', '${email}', false, 0)
        RETURNING q_id`;
      const client = await pool.connect();
      await client.query(addQ)
        .then(() => {
          client.release();
        });
    } catch (err) {
      console.error('Error adding question to database', err);
    }
  },
  helpfulQuestion: async function helpfulQuestion(question_id) {
    try {
      const helpfulQ = `UPDATE questions
      SET question_helpfulness = question_helpfulness + 1
      WHERE q_id=${question_id}`;
      const client = await pool.connect();
      await client.query(helpfulQ)
        .then(() => {
          client.release();
        });
    } catch (err) {
      console.error('Error marking question as helpful in db', err);
    }
  },
  reportQuestion: async function reportQuestion(question_id) {
    try {
      const reportQ = `UPDATE questions
      SET reported = true
      WHERE q_id=${question_id}`;
      const client = await pool.connect();
      await client.query(reportQ)
        .then(() => {
          client.release();
        });
    } catch (err) {
      console.error('Error reporting question in db', err);
    }
  },
};
