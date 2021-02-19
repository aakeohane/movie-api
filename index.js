const express = require('express');
const app = express();
const morgan = require('morgan');

// let favMovies = [
//    {
//      title: 'Harry Potter and the Sorcerer\'s Stone',
//      year: '2001',
//      rating: '7.6'
//    },
//    {
//       title: 'Harry Potter and the Chamber of Secrets',
//       year: '2002',
//       rating: '7.4'
//    },
//    {
//       title: 'Harry Potter and the Prisoner of Azkaban',
//       year: '2004',
//       rating: '7.9'
//    },
//    {
//       title: 'Harry Potter and the Goblet of Fire',
//       year: '2005',
//       rating: '7.7'
//    },
//    {
//       title: 'Harry Potter and the Order of the Phoenix',
//       year: '2007',
//       rating: '7.5'
//    },
//    {
//       title: 'Harry Potter and the Half-Blood Prince',
//       year: '2009',
//       rating: '7.6'
//    },
//    {
//       title: 'Harry Potter and the Deathly Hallows: Part 1',
//       year: '2010',
//       rating: '7.7'
//    },
//    {
//       title: 'Harry Potter and the Deathly Hallows: Part 2',
//       year: '2011',
//       rating: '8.1'
//    },
//    {
//       title: 'Fantastic Beasts and Where to Find Them',
//       year: '2016',
//       rating: '7.3'
//    },
//    {
//       title: 'Fantastic Beasts: the Crimes of Grindelwald',
//       year: '2018',
//       rating: '6.6'
//    },
//  ];

//  logs IP address/time of request/ request method and path/ status code to terminal
app.use(morgan('common'));

//  Welcome page
app.get('/', (req, res) => {
   res.send('Welcome to myFlix.');
});

app.get('/movies', (req, res) => {
   res.send('Successful GET request returning data on all the movies');
});

app.get('/movies/:Title', (req, res) => {
   res.send('Successful GET request returning data on specific movie');
});

app.get('/genres/:Title', (req, res) => {
   res.send('Successful GET request returning data on specific movie genre');
});

app.get('/directors/:Name', (req, res) => {
   res.send('Successful GET request returning data on movie director');
});

app.post('/users', (req, res) => {
   res.send('Successful POST request - new user registered');
});

app.put('/users/:Username', (req, res) => {
   res.send('Successful PUT request - new user updated');
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