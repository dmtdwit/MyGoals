const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const loginRouter = require('./routes/login');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const awardRouter = require('./routes/award');
const goalRouter = require('./routes/goal');
const remarkRouter = require('./routes/remark');
const logRemarkRouter = require('./routes/logRemark');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!", resave: true, saveUninitialized: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', loginRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/award', awardRouter);
app.use('/goal', goalRouter);
app.use('/remark', remarkRouter);
app.use('/logRemark', logRemarkRouter);

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
