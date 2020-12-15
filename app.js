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
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");

mongoose.connect('mongodb+srv://joe-weaver:iamadmin4uall@mixnmash.c25ol.mongodb.net/mixnmashdev?retryWrites=true&w=majority', { promiseLibrary: require('bluebird'), useNewUrlParser: true })
  .then(() =>  console.log('connection successful'))
  .catch((err) => console.error(err));

const indexRouter = require('./routes/index');
const youtubeRouter = require("./routes/youtube");
const authRouter = require("./routes/auth")

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if(process.env.NODE_ENV === "production"){
  app.use(expres.static("client/build"));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, "./client", "build", "index.html"));
  });
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use('/test', cors(), graphqlHTTP({
  schema: testSchema,
  rootValue: global,
  graphiql: true,
}));

// Initialize the users route as a GraphQL route
app.use('/users', cors(), graphqlHTTP({
  schema: userSchema,
  rootValue: global,
  graphiql: true,
}));

// Initialize te mixtapes route as a GraphQL route
app.use('/mixtapes', cors(), graphqlHTTP({
  schema: mixtapeSchema,
  rootValue: global,
  graphiql: true,
}));

// Initialize the youtube route
app.use("/youtube", youtubeRouter);

// Auth route
app.use("/auth", bodyParser.json());
app.use("/auth", bodyParser.urlencoded({extended: true}));

app.use("/auth", cors({
  origin: "http://localhost:3001",
  credentials: true
}))

app.use("/auth", session({
  secret: "secretcode",
  resave: true,
  saveUninitialized: true
}));

app.use("/auth", cookieParser("secretcode"));

app.use("/auth", passport.initialize());
app.use("/auth", passport.session());
require("./routes/passportConfig")(passport);

app.use("/auth", authRouter);

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

var port = process.env.PORT || '3000';
app.listen(port);

module.exports = app;
