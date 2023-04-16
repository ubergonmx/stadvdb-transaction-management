const db = require('../model/db');

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
    db.ping(db.node1(), (isNode1Up) => {
      if (isNode1Up) {
        db.node1().query('SELECT * FROM movies', (err, result) => {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            res.send(result);
          }
        });
      } else {
        const node = process.env.NODE_NUMBER === '1' ? db.node2() : db.localNode();
        db.ping(node, (isLocalNodeUp) => {
          if (isLocalNodeUp) {
            db.localNode().query('SELECT * FROM movies', (err, result) => {
              movies = result;
              if (err) {
                console.log(err);
                res.send(err);
              } else {
                if (process.env.NODE_NUMBER === '2') {
                  db.ping(db.node3(), (isNode3Up) => {
                    if (isNode3Up) {
                      db.node3().query('SELECT * FROM movies', (errNode, node3) => {
                        if (errNode) {
                          console.log(errNode);
                          res.send(errNode);
                        } else {
                          movies = movies.concat(node3).sort((a, b) => a.id - b.id);
                          res.send(movies);
                        }
                      });
                    }
                  });
                }
                if (process.env.NODE_NUMBER === '3') {
                  db.ping(db.node2(), (isNode2Up) => {
                    if (isNode2Up) {
                      db.query('SELECT * FROM movies', (errNode, node2) => {
                        if (errNode) {
                          console.log(errNode);
                          res.send(errNode);
                        } else {
                          movies = movies.concat(node2).sort((a, b) => a.id - b.id);
                          res.send(movies);
                        }
                      });
                    }
                  });
                }
              }
            });
          } else {
            res.send('No database connection available. Please try again later.');
          }
        });
      }
    });

    // if (db.ping(db.node1())) {
    //   db.node1().query('SELECT * FROM movies', (err, result) => {
    //     if (err) {
    //       console.log(err);
    //       res.send(err);
    //     } else {
    //       res.send(result);
    //     }
    //   });
    // } else if (db.ping(db.localNode())) {
    //   db.localNode().query('SELECT * FROM movies', (err, result) => {
    //     movies = result;
    //     if (err) {
    //       console.log(err);
    //       res.send(err);
    //     } else {
    //       if (process.env.NODE_NUMBER === '2') {
    //         if (db.ping(db.node3())) {
    //           db.node3().query('SELECT * FROM movies', (errNode, node3) => {
    //             if (errNode) {
    //               console.log(errNode);
    //               res.send(errNode);
    //             } else {
    //               movies = movies.concat(node3).sort((a, b) => a.id - b.id);
    //             }
    //           });
    //         }
    //       }
    //       if (process.env.NODE_NUMBER === '3') {
    //         if (db.ping(db.node2())) {
    //           db.query('SELECT * FROM movies', (errNode, node2) => {
    //             if (errNode) {
    //               console.log(errNode);
    //               res.send(errNode);
    //             } else {
    //               movies = movies.concat(node2).sort((a, b) => a.id - b.id);
    //             }
    //           });
    //         }
    //       }
    //     }
    //   });
    // } else {
    //   res.send('No database connection');
    // }
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
