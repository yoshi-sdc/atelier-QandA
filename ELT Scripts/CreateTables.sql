CREATE TABLE IF NOT EXISTS questions(
  id SERIAL NOT NULL PRIMARY KEY,
  product_id INT NOT NULL,
  question_body TEXT NOT NULL,
  question_date BIGINT NOT NULL,
  asker_name TEXT NOT NULL,
  asker_email TEXT NOT NULL,
  reported BOOLEAN NOT NULL,
  question_helpfulness INT NOT NULL
);

CREATE TABLE IF NOT EXISTS answers(
  id SERIAL NOT NULL PRIMARY KEY,
  question_id INT references questions(id),
  body TEXT NOT NULL,
  date BIGINT NOT NULL,
  answerer_name TEXT NOT NULL,
  answerer_email TEXT NOT NULL,
  reported BOOLEAN NOT NULL,
  helpfulness INT NOT NULL
);

CREATE TABLE IF NOT EXISTS photos(
  id SERIAL NOT NULL PRIMARY KEY,
  answer_id INT references answers(id),
  url TEXT NOT NULL
);


