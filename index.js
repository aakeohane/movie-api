const express = require('express');
const app = express();

let favMovies = [
   {
     title: 'Harry Potter and the Sorcerer\'s Stone',
     year: '2001',
     rating: '7.6'
   },
   {
      title: 'Harry Potter and the Chamber of Secrets',
      year: '2002',
      rating: '7.4'
   },
   {
      title: 'Harry Potter and the Prisoner of Azkaban',
      year: '2004',
      rating: '7.9'
   },
   {
      title: 'Harry Potter and the Goblet of Fire',
      year: '2005',
      rating: '7.7'
   },
   {
      title: 'Harry Potter and the Order of the Phoenix',
      year: '2007',
      rating: '7.5'
   },
   {
      title: 'Harry Potter and the Half-Blood Prince',
      year: '2009',
      rating: '7.6'
   },
   {
      title: 'Harry Potter and the Deathly Hallows: Part 1',
      year: '2010',
      rating: '7.7'
   },
   {
      title: 'Harry Potter and the Deathly Hallows: Part 2',
      year: '2011',
      rating: '8.1'
   },
   {
      title: 'Fantastic Beasts and Where to Find Them',
      year: '2016',
      rating: '7.3'
   },
   {
      title: 'Fantastic Beasts: the Crimes of Grindelwald',
      year: '2018',
      rating: '6.6'
   },
 ];

 app.get('/movies', (req, res) => {
    res.json(favMovies);
 })

 app.get('/', (req, res) => {
    res.send('Welcome to myFlix.');
 })

 app.use(express.static('public'));

 app.listen(8080, () =>{
   console.log('Your app is running on port 8080.');
 });