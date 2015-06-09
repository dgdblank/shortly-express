var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
// app.use(express.cookieParser('secrets!!'));
app.use(session({
  secret: 'hackreactor',
  resave: false,
  saveUninitialized: true
}));

//function to restrict entry to non logged-in users
var restrict = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    console.log('login first')
    res.redirect('/login');
  }
}

app.get('/', restrict,
function(req, res) {
  res.render('index');
});

app.get('/create', restrict,
function(req, res) {
  res.render('index');
});

app.get('/links', restrict,
function(req, res) {
  Links.reset().where({user_id: req.session.user.get('id')})
    .fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', restrict,
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin,
          user_id: new User({username: req.session.user}).
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

var getCurrentUser = function (username, callback) {
  new User({username: username}).fetch().then(function(found){
    if(found){
      callback(found);
    } else {
      console.log('user not found');
    }
  })
}

// sign-up
app.get('/signup',
  function(req, res){
  res.render('signup');
});

app.post('/signup',
  function(req, res) {
    var username = req.body.username;
    new User({username: username}).fetch().then(function(found) {
      if (found) {
        res.redirect('/login');
      }
      else{
        var user = new User({
          username: username,
          password: req.body.password
        });

        user.save().then(function(newUser){
          Users.add(newUser);
          req.session.regenerate(function(){
            req.session.user = username;
            res.redirect('/');
          });
        });

      }
    })
  }
);

// login
app.get('/login',
function(req, res) {
  res.render('login');
});


app.post('/login', function(req, res){
  // checks if username exists
  var username = req.body.username;
  var password = req.body.password;
  // console.log('password: ', password);
  new User({username: username}).fetch().then(function(found) {
    // console.log('found: ', found);
    if (found) {
      if(found.checkPassword(password)){
        console.log('logged in!');
      // login
        req.session.regenerate(function(){
          req.session.user = username;
          res.redirect('/');
        });
      } else{
        res.redirect('/login');
        // TO DO: Add text to retry password.
      }
    } else {
    // NO
      //TO DO: Add text below.
      console.log("That username doesn't exist! You should create one. Jerk.");
      res.redirect('/login');
    }

  })
})


// logout
app.get('/logout',
function(req, res) {
  req.session.destroy(function(){
    res.render('logout');
  });
});
/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
