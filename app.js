const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const graphqlHTTP = require('express-graphql');
const testSchema = require("./graphql/testSchemas");
const userSchema = require("./graphql/userSchemas");
const mixtapeSchema = require("./graphql/mixtapeSchemas");
const cors = require("cors");

mongoose.connect('mongodb://localhost/node-graphql', { promiseLibrary: require('bluebird'), useNewUrlParser: true })
  .then(() =>  console.log('connection successful'))
  .catch((err) => console.error(err));

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('*', cors());
app.use('/test', cors(), graphqlHTTP({
  schema: testSchema,
  rootValue: global,
  graphiql: true,
}));
app.use('/users', cors(), graphqlHTTP({
  schema: userSchema,
  rootValue: global,
  graphiql: true,
}));
app.use('/mixtapes', cors(), graphqlHTTP({
  schema: mixtapeSchema,
  rootValue: global,
  graphiql: true,
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
