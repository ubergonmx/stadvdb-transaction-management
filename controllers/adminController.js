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
  getMovies: (req, res) => {
    db.localNode().query('SELECT * FROM movies', (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    });
  },
  // performQuery: (req, res) => {

  // }
};

module.exports = adminController;

/*

async function heavyTask(){
  ...
}

doSomeWork();
await heavyTask();

*/
