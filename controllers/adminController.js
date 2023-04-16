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
  getAllMovies: (req, res) => {
    let movies;
    if (db.ping(db.node1())) {
      movies = db.query('SELECT * FROM movies', db.node1());
    } else if (db.ping(db.localNode())) {
      movies = db.query('SELECT * FROM movies', db.localNode());

      if (process.env.NODE_NUMBER === '2') {
        if (db.ping(db.node3())) {
          movies = movies.concat(db.query('SELECT * FROM movies', db.node3())).sort((a, b) => a.id - b.id);
        }
      }
      if (process.env.NODE_NUMBER === '3') {
        if (db.ping(db.node2())) {
          movies = movies.concat(db.query('SELECT * FROM movies', db.node2())).sort((a, b) => a.id - b.id);
        }
      }
    } else {
      movies = [];
    }

    res.json(movies);
  },
  getMovie: (req, res) => {
    db.localNode().query(`SELECT * FROM movies WHERE id = ${req.params.id}`, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    });
  },
  updateMovie: (req, res) => {
    db.localNode().query(`SELECT * FROM movies WHERE id = ${req.params.id}`, (err) => {
      if (err) {
        console.log(err);
      } else {
        db.localNode().query(
          'UPDATE movies SET name = ?, year= ?, rank= ? WHERE id = ?',
          [req.body.name, req.body.year, req.body.rank, req.params.id],
          (err2) => {
            if (err2) {
              console.log(err2);
            } else {
              res.json('Update successful');
            }
          }
        );
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
  setIsolationLevel: (req, res) => {
    db.localNode().query(`SET SESSION TRANSACTION ISOLATION LEVEL ${req.params.level}`, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    });
  },
};
module.exports = adminController;
