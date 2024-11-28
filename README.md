Role Based Access Control

This is a Role Based Access Control application using Nodejs, Express, Passport Js, etc.

For authentication we have only Email & Password option but other authentication options using OAuth/OAuth2.0 like Google, Facebook, Apple, GitHub, etc, can be easily incorporated.

Also funtions like search, add, delete, update, users have been added along with pagination with maximum of 10 users per page.

The application is based on the **MVC pattern** i.e. Model View Controller.

**Mongoose** is used as an ORM for MongoDB for storing Users in Database.

**Passport JS** is used for local(email, password) authentication.
-

## To start setting up the project



```bash
npm install
```

Put your credentials in the .env file.

```bash
PORT=3000
MONGODB_URI=YOUR_MONGODB_URI(example: mongodb://localhost:27017)
DB_NAME=YOUR_DB_NAME
```

Install MongoDB (Linux Ubuntu)

See <https://docs.mongodb.com/manual/installation/> for more infos

Run Mongo daemon

```bash
sudo service mongod start
```
Start the app by

```bash
npm start
```


