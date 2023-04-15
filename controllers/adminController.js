const { db } = require('../model/db');

const adminController = {
  index: (req, res) => {
    db.localNode().query('SELECT * FROM movies', (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result.slice(0, 2));
        res.render('index', { movies: result.slice(0, 100) });
      }
    });
  },
};

module.exports = adminController;
