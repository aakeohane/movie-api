const mongoose = require('mongoose');
const morgan = require('morgan');
const express = require('express');
const Models = require('./models.js');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const {check, validationResult} = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedToplogy: true });
mongoose.connect( process.env.CONNECTION_URI , { useNewUrlParser: true, useUnifiedToplogy: true });

const app = express();
app.use(bodyParser.json());

require('./auth')(app);
require('./passport');

const allowedOrigins = ['http://localhost:4200'];


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

/**
 * @function GET request for welcome page
 * @returns Welcome to myFlix
 */
app.get('/', (req, res) => {
  res.send('Welcome to myFlix.');
});

/**
 * @function GET request for all movies in the database
 * @returns {object} JSON object of each movie with all of their details
 */
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

/**
 * @function GET request for a single movie by title
 * @returns {object} JSON of a single movie and all of its details
 */
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

/**
 * @function GET request for a specific Genre among all the movies
 * @returns {object} JSON of Genre and its details 
 */
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

/**
 * @function GET request for a specific Director
 * @returns {object} JSON of director and their details
 */
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

/**
 * @function GET request for one specific user
 * @returns {JSON} object containing users details along with hashed password
 */
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

/**
 * @function POST request to create new user No Token needed as parameter. New users get JWT once created
 * @example
 * axios({
 * method: 'post',
 * Example request: {
        "Username": "A10isaussie",
        "Password": "Bananas11",
        "Email": "exampleemail@gmail.com",
        "Birthday": "10/22/1994"
      }
 * })
 * @param {JSON} User the user JSON object containing username, password, email, and birthday
 * @returns {JSON} JSON object of new user details along with hashed password
 */
app.post('/users',
  [ //validation logic here for request
    check('Username', 'Username is required.').isLength({min: 5}), 
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {

    // check the validation object for errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array() });
    }

    const hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username})
      .then((user) => {
        if (user) {
          res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users.create({
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

/**
 * @function PUT request which updates users details
 * @param {JSON} User the user JSON object containing username, password, email, and birthday
 * @returns {JSON} containing users updated details along with the hashed password
 */
app.put('/users/:Username',
  [ //validation logic here for request
    check('Username', 'Username is required.').isLength({min: 5}), 
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],

  passport.authenticate('jwt', { session: false}), (req, res) => {

    // check the validation object for errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array() });
    }
    
    const hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username },
      {
        $set:
          {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          }
      },
      { new: true })
      .then( (updatedUser) => {
        res.json(updatedUser);
      }) 
      .catch( (err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

/**
 * @function POST request that adds a movie to list of users favorite movies
 * @returns {JSON} the updated user details with the favorite movie added to favorites array
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    {
      // changed from $push so that it wont add duplicates to array (wont throw error if it already exists)
      $addToSet:
       {
         FavoriteMovies: req.params.MovieID
       }
    },
    { new: true }) // makes sure updated details/object is returned
    .then( (updatedUser) => {
      res.json(updatedUser);
    }) 
    .catch( (err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @function DELETE request that removes a movie from list of users favorite movies
 * @returns {JSON} the updated user details with the favorite movie removed from favorites array
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, 
    { $pull: { FavoriteMovies: req.params.MovieID }},
    { new: true })
    .then( (updatedUser) => {
      res.json(updatedUser);
    }) 
    .catch( (err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * DELETE request to remove/deregister a user from database
 * @returns {string} message containing whether it was succesful or not
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found.');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
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

