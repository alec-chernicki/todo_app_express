var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');


var routes = require('./routes/index');
var users = require('./routes/users');

mongoose.connect('mongodb://localhost/todo_development', function(err) {
  if (!err) {
    console.log('Connected to MongoDB');
  }
  else {
    throw err;
  }
});

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TaskSchema = new Schema({
  task: { type: String, required: true }
});

var Task = mongoose.model('Task', TaskSchema);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.get('/tasks', function (req, res) {
  Task.find(function(err, tasks) {
    res.render('tasks/index', {
      title: 'Your Todos',
      tasks: tasks
    });
  });
});

app.post('/tasks', function (req, res) {
  var task = new Task({task: req.body.task});
  task.save(function (err) {
    if (!err) {
      res.redirect('/tasks');
    }
    else {
      res.redirect('/tasks/new');
    }
  });
});

app.get('/tasks/new', function (req, res) {
  res.render('tasks/new', {
    title: 'New Task'
  });
});

app.get('/tasks/:id/edit', function(req, res) {
  Task.findById(req.params.id, function (err, doc) {
    res.render('tasks/edit', {
      title: 'Edit Task',
      task: doc
    });
  });
});

app.put('/tasks/:id', function(req, res) {
  Task.findById(req.params.id, function(err, doc) {
    doc.task = req.body.task;
    doc.save(function(err) {
      if (!err) {
        res.redirect('/tasks');
      }
      else {
        console.log(err);
      }
    });
  });
});

app.delete('/tasks/:id', function(req, res) {
  Task.findById(req.params.id, function(err, doc) {
    if (!doc) return next (new NotFound('Document not found'));
    doc.remove(function() {
      res.redirect('/tasks');
    });
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
