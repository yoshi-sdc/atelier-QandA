CREATE TABLE IF NOT EXISTS questions(
  q_id SERIAL NOT NULL PRIMARY KEY,
  product_id INT NOT NULL,
  question_body TEXT NOT NULL,
  question_date BIGINT NOT NULL,
  asker_name TEXT NOT NULL,
  asker_email TEXT NOT NULL,
  reported BOOLEAN NOT NULL,
  question_helpfulness INT NOT NULL
);

CREATE TABLE IF NOT EXISTS answers(
  a_id SERIAL NOT NULL PRIMARY KEY,
  question_id INT REFERENCES questions(q_id),
  body TEXT NOT NULL,
  date BIGINT NOT NULL,
  answerer_name TEXT NOT NULL,
  answerer_email TEXT NOT NULL,
  reported BOOLEAN NOT NULL,
  helpfulness INT NOT NULL
);

CREATE TABLE IF NOT EXISTS photos(
  p_id SERIAL NOT NULL PRIMARY KEY,
  answer_id INT REFERENCES answers(a_id),
  url TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS questions_product_id ON questions(product_id);

CREATE INDEX IF NOT EXISTS answers_question_id ON answers(question_id);

CREATE INDEX IF NOT EXISTS photos_answer_id ON photos(answer_id);

