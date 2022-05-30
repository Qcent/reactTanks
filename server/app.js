const createError = require('http-errors');
const express = require('express');
const { join } = require('path');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const onlineUsers = require('./onlineUsers');

const { json, urlencoded } = express;

const app = express();

app.use(json());
app.use(urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../client/build')));
} else {
  app.use(express.static(join(__dirname, 'public')));
}

app.use(function (req, res, next) {
  const token = req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, process.env.SESSION_SECRET, (err, decoded) => {
      if (err) {
        return next();
      }
      if (onlineUsers[decoded.id]) {
        req.user = onlineUsers[decoded.id];
        return next();
      } else {
        return next();
      }
    });
  } else {
    return next();
  }
});

// require api routes
app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = { app };
