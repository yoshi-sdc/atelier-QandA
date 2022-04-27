
COPY questions FROM '/home/ivykw/HackReactor/SDC/questions.csv' DELIMITER ',' CSV HEADER;
COPY answers FROM '/home/ivykw/HackReactor/SDC/answers.csv' DELIMITER ',' CSV HEADER;
COPY photos FROM '/home/ivykw/HackReactor/SDC/answers_photos.csv' DELIMITER ',' CSV HEADER;


SELECT SETVAL('public.questions_q_id_seq', COALESCE(MAX(q_id), 1) ) FROM public.questions;
SELECT SETVAL('public.answers_a_id_seq', COALESCE(MAX(a_id), 1) ) FROM public.answers;
SELECT SETVAL('public.photos_p_id_seq', COALESCE(MAX(p_id), 1) ) FROM public.photos;