# examen_WEB2_Backend

After cloning this repository, create your own .env file and configure it based on the .env.example file.
Then go to your machine's terminal to create a database whose name should be similar to the DB_NAME in your .env.
Now run the following commands in order:
    - npm install (to install the necessary dependencies)
    - psql -U your_username -d your_database -f ./database/schema.sql (this will execute the SQL queries in this file against your database)
    - npm run seed:admin (to create an administrator if one doesn't exist yet)
    - npm run dev (to launch the project)