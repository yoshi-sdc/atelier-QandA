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
    var finalResponse = {product_id: product_id}
    const skipped = (page - 1) * count;
    var allQuestions =
    `WITH q AS (
      SELECT *
      FROM questions q
      WHERE product_id=${product_id}
      ORDER BY q.q_id
      LIMIT ${count}
      OFFSET ${skipped})
    SELECT q.question_body, q.question_date, q.asker_name, q.question_helpfulness,
      a.question_id, a.body, a.date, a.answerer_name, a.helpfulness,
      p.p_id, p.answer_id, p.url
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
        if (!lastQ || lastQ['question_id'] !== current['question_id']) {
          // make new object
          var questionObj = {
            question_id: current['question_id'],
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
        if (!lastQ.answers['answer_id'])
          // create new answer object
          var answerObj = {
            id: current['answer_id'],
            body: current['body'],
            date: current['date'],
            answerer_name: current['answerer_name'],
            answerer_email: current['answerer_email'],
            helpfulness: current['helpfulness'],
            photos: []
          }
          lastQ.answers[current['answer_id']] = answerObj;
        // photos are always going to be unique, so if it exists, push it into answer's photos
        if (current['p_id']) {
          var photoObj = {
            id: current['p_id'],
            url: current['url']
          }
            lastQ.answers[current['answer_id']].photos.push(photoObj);
        }
      }
      finalResponse['results'] = results;
      callback(finalResponse);
      })
  } catch(err) {
    console.error('Error querying all questions', err)
  }
}

async function getAnswers(q_id, page, count, callback) {
  try {
    var finalResponse = {
      question: q_id,
      page: page,
      count: count,
      results: []
    }
    const skipped = (page - 1) * count;
    // select answers where q_id = answer question_id (limited and offset)
    // join with photos table on answer id = photos answer_id
    var allAnswers =
    `WITH a AS (
      SELECT *
      FROM answers a
      WHERE question_id=${q_id} AND a.reported=false
      ORDER BY a.a_id
      LIMIT ${count}
      OFFSET ${skipped})
    SELECT a.body, a.date, a.answerer_name, a.helpfulness,
      p.p_id, p.answer_id, p.url
    FROM a
    JOIN photos p
    ON p.answer_id=a.a_id
    ORDER BY a.a_id`;
    await pool.query(allAnswers)
    .then ((res) => {
      const data = res.rows;
      var lastA;
      // iterate overe data
      for (let i = 0; i < data.length; i++) {
        const current = data[i];
        if (!lastA || lastA['answer_id'] !== current['answer_id']) {
          var answerObj = {
            answer_id: current['answer_id'],
            body: current.body,
            date: current.date,
            answerer_name: current['answerer_name'],
            helpfulness: current.helpfulness,
            photos: []
          }
          lastA = answerObj;
          finalResponse.results.push(answerObj);
        }
        if (current['p_id']) {
          var photoObj = {
            id: current['p_id'],
            url: current.url
          }
          lastA.photos.push(photoObj);
        }
      }
      callback(finalResponse);
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

