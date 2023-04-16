const { db } = require('../model/db');

const adminController = {
  index: (req, res) => {
    db.localNode().query('SELECT * FROM movies', (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result.slice(0, 2));
        res.render('index', {
          title: 'IMDB Movies',
          styles: ['index.css'],
          movies: result.slice(0, 100),
        });
      }
    });
  },
  getMovies: (req, res) => {
    db.localNode().query('SELECT * FROM movies', (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    });
  },
  editMovie: (req, res) => {
    db.localNode().query(`SELECT * FROM movies WHERE id = ${req.params.id}`, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    });
  },
  deleteMovie: (req, res) => {
    db.localNode().query(`DELETE FROM movies WHERE id = ${req.params.id}`, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    });
  },
  getCount: (req, res) => {
    db.localNode().query('SELECT COUNT(*) FROM movies', (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    });
  },
};
module.exports = adminController;
