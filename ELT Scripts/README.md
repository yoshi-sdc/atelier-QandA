### ELT

1. Navigate to the project repository's ELT Scripts folder.
2. Start postgres server: `sudo service postgresql start`
3. Start psql shell: `psql -U postgres`
  * Create database: `CREATE DATABASE <database-name-here>;`
  * Nagivate to database: `\c <database>;`
  * Create tables with schema file: `\i CreateTables.sql;`
4. Ensure the following files are available for loading: questions.csv, answers.csv, answer_photos.csv.
5. Put the absolute path to the respective files in the LoadData.sql file, eg. '/home/user/.../SDC/questions.csv'.
6. In the psql shell: `\i LoadData.sql;`. (Depending on the size of your files, this may take several minutes.)
7. If you need to drop the tables in the database: `\i DropTables.sql;`.

The database and data is now ready for use!

