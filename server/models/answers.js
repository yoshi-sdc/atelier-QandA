const pool = require('../db/database.js');

module.exports = {
  getAnswers: async function getAnswers(q_id, page, count, callback) {
    try {
      const skipped = (page - 1) * count;
      const allAnswers =
      `SELECT a_id AS answer_id, body, TO_TIMESTAMP(date / 1000)::date, answerer_name, helpfulness,
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
  },
  addAnswer: async function addAnswer(question_id, body, name, email, photos) {
    try {
      const addAnswer =
      `INSERT INTO answers
        (question_id, body, date, answerer_name, answerer_email, reported, helpfulness)
      VALUES
        (${question_id}, '${body}', EXTRACT(EPOCH from CURRENT_TIMESTAMP)::bigint * 1000, '${name}', '${email}', false, 0)
      RETURNING a_id`;
      const client = await pool.connect();
      await client.query(addAnswer)
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
    } catch(err) {
      console.error('Error adding answer to database', err);
    }
  },
  helpfulAnswer: async function helpfulAnswer(answer_id) {
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
  },
  reportAnswer: async function reportAnswer(answer_id) {
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
};
