### ELT

1. Navigate to project repository ELT Scripts folder.
2. Start postgres server: `code sudo service postgresql start`
3. Start psql shell: `code psql -U postgres`
  i. Create database: `code CREATE DATABASE 'database-name-here';`
  ii. Nagivate to database: `code \c 'database';`
  iii. Create tables with schema file: `code \i CreateTables.sql;`
4. Ensure the following files are available for loading: questions.csv, answers.csv, answer_photos.csv.
5. Put the absolute path to the respective files in the LoadData.sql file, eg. '/home/user/.../SDC/questions.csv'.
6. in the psql shell: `code \i LoadData.sql;`. Depending on the size of your files, this may take several minutes.
7. If you need to drop the tables in the database: `code \i DropTables.sql;`.

The database and data is now ready for use!

