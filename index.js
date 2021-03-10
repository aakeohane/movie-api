const mongoose = require('mongoose');
const morgan = require('morgan');
const express = require('express');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedToplogy: true });
mongoose.connect( process.env.CONNECTION_URI , { useNewUrlParser: true, useUnifiedToplogy: true });

const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

require('./auth')(app);
const passport = require('passport');
require('./passport');

const cors = require('cors');
const allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

const {check, validationResult} = require('express-validator');

app.use(cors({
  origin: (origin, callback) => {   
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isnt found on the list of allowed origins
      const message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
   }
}));


//  logs IP address/time of request/ request method and path/ status code to terminal
app.use(morgan('common'));

//  Welcome page
app.get('/', (req, res) => {
  res.send('Welcome to myFlix.');
});

// return list of movies
app.get('/movies', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Returns movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Returns genre info from specific movie
app.get('/movies/:Title/genre', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Find director by name
app.get('/directors/:Name', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Director);
    })
   .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
   });
});

//return info for one user
app.get('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOne({ Username: req.params.Username})
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
      });
});

//create username for one user
app.post('/users',
  [ //validation logic here for request
    check('Username', 'Username is required.').isLength({min: 5}), 
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username})
      .then((user) => {
        if (user) {
          res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => {
              res.status(201).json(user)
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
  });

// Update a users info by username
app.put('/users/:Username',
  [ //validation logic here for request
    check('Username', 'Username is required.').isLength({min: 5}), 
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
    passport.authenticate('jwt', { session: false}), (req, res) => {
      Users.findOneAndUpdate({ Username: req.params.Username },
        {
          $set:
            {
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            }
        },
        { new: true },
        (err, updatedUser) => {
          if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
          } else {
            res.json(updatedUser);
          }
        });
});

// add movie to users favorites list
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username},
    {
      // changed from $push so that it wont add duplicates to array (wont throw error if it already exists)
      $addToSet:
       {
         FavoriteMovies: req.params.MovieID
       }
    },
    { new: true },
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

// Delete a users favorite movie from their list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, 
    { $pull: { FavoriteMovies: req.params.MovieID }},
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

// Delete or deregister a user from the database
app.delete('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found.');
      } else {
        res.status(204).end();
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//  Renders documentation page
app.use(express.static('public'));

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});

//  sends error to terminal if code is broken
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oh no! Something broke!');
});

