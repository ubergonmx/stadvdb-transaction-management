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
