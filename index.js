const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedToplogy: true });

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.json());
const morgan = require('morgan');
const e = require('express');


//  logs IP address/time of request/ request method and path/ status code to terminal
app.use(morgan('common'));

//  Welcome page
app.get('/', (req, res) => {
   res.send('Welcome to myFlix.');
});

// return list of movies
app.get('/movies', (req, res) => {
   Movies.find()
      .then((movies) => {
         res.status(201).json(movies);
      })
      .catch((err) => {
         console.error(err);
         res.status(500).send('Error: ' + err);
      });
});

// Returns movie by title
app.get('/movies/:Title', (req, res) => {
   Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
         res.json(movie);
      })
      .catch((err) => {
         console.error(err);
         res.status(500).send('Error: ' + err);
      });
});

// Returns genre info
app.get('/movies/genres/:Title', (req, res) => {
   Movies.findOne({ Title: req.params.Title })
   .then((movie) => {
      res.json(movie.Genre);
   })
   .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
   });
});

app.get('/directors/:Name', (req, res) => {
   res.send('Successful GET request returning data on movie director');
});

//return info for one user
app.get('/users/:Username', (req, res) => {
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
app.post('/users', (req, res) => {
   Users.findOne({ Username: req.body.Username})
   .then((user) => {
      if (user) {
         return res.status(400).send(req.body.Username + ' already exists');
      } else {
         Users
            .create({
               Username: req.body.Username,
               Password: req.body.Password,
               Email: req.body.Email,
               Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
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
app.put('/users/:Username', (req, res) => {
   Users.findOneAndUpdate({ Username: req.params.Username },
{ $set:
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
      }  else {
         res.json(updatedUser);
      }
   });
});

app.post('/users/:Username/movies/:Title', (req, res) => {
   res.send('Successful POST request - movie added to favorites');
});

app.delete('/users/:Username/movies/:Title', (req, res) => {
   res.send('Successful DELETE request - movie removed');
});

app.delete('/users/:Username', (req, res) => {
   res.send('Successful DELETE request - user deactivated');
});

//  Renders documentation page
 app.use(express.static('public'));

 app.listen(8080, () =>{
   console.log('Your app is running on port 8080.');
 });

//  sends error to terminal if code is broken
 app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).send('Oh no! Something broke!');
 });

