const db = require('../model/db');

const adminController = {
  index: (req, res) => {
    res.render('index', {
      title: 'IMDB Movies',
      styles: ['index.css'],
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
            res.json(result);
          }
        });
      } else {
        const isCentralNodeDown = process.env.NODE_NUMBER === '1';
        const node = process.env.NODE_NUMBER === '1' ? db.node2() : db.localNode();
        db.ping(node, (isLocalNodeUp) => {
          if (isLocalNodeUp) {
            node.query('SELECT * FROM movies', (err, result) => {
              movies = result;
              if (err) {
                console.log(err);
                res.send(err);
              } else {
                if (process.env.NODE_NUMBER === '2' || isCentralNodeDown) {
                  db.ping(db.node3(), (isNode3Up) => {
                    if (isNode3Up) {
                      db.node3().query('SELECT * FROM movies', (errNode, node3) => {
                        if (errNode) {
                          console.log(errNode);
                          res.send(errNode);
                        } else {
                          movies = movies.concat(node3).sort((a, b) => a.id - b.id);
                          res.json(movies);
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
                          res.json(movies);
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
  // getMovie: (req, res, next) => {
  //   db.ping(db.localNode(), (isLocalNodeUp) => {
  //     if (!isLocalNodeUp) {
  //       res.locals.NODE_NUMBER = process.env.NODE_NUMBER;
  //       next();
  //     }
  //     db.localNode().query(
  //       `start transaction; Select * from movies WHERE id = ${req.params.id}; commit;`,
  //       (err, result) => {
  //         if (err) {
  //           console.log(err);
  //           return res.render('movie', {
  //             title: 'Movie error',
  //             movie: { id: req.params.id, name : 'Movie not found', year: 'N/A', rating: 'N/A'},
  //             styles: ['index.css'],
  //           });
  //         }
  //         if (result.length === 0){
  //           res.locals.NODE_NUMBER = process.env.NODE_NUMBER;
  //           return next();
  //         }
  //         return res.render('movie', {
  //           title: result.name,
  //           movie: result,
  //           styles: ['index.css'],
  //         });
  //       }
  //     );
  //   });
  // },
  getMovieNode1: (req, res, next) => {
    db.ping(db.node1(), (isNode1Up) => {
      if (!isNode1Up) {
        next();
      }
      db.node1().query(
        `start transaction; Select * from movies WHERE id = ${req.params.id}; commit;`,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.render('movie', {
              title: 'Movie error',
              movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rating: 'N/A' },
              styles: ['index.css'],
            });
          }
          if (result[1].length === 0) {
            return res.render('movie', {
              title: 'Movie error',
              movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rating: 'N/A' },
              styles: ['index.css'],
            });
          }
          const movie = Object.values({ ...result[1] })[0];
          console.log('-! node1');
          console.log(movie);
          return res.render('movie', {
            title: movie.name,
            movie,
            styles: ['index.css'],
          });
        }
      );
    });
  },
  getMovieNode2: (req, res, next) => {
    db.ping(db.node2(), (isNode2Up) => {
      if (!isNode2Up) {
        next();
      }
      db.node2().query(
        `start transaction; Select * from movies WHERE id = ${req.params.id}; commit;`,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.render('movie', {
              title: 'Movie error',
              movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rating: 'N/A' },
              styles: ['index.css'],
            });
          }
          if (result[1].length === 0) {
            return next();
          }
          const movie = Object.values({ ...result[1] })[0];
          console.log('-! node2');
          console.log(movie);
          return res.render('movie', {
            title: movie.name,
            movie,
            styles: ['index.css'],
          });
        }
      );
    });
  },
  getMovieNode3: (req, res) => {
    db.ping(db.node3(), (isNode3Up) => {
      if (!isNode3Up) {
        res.render('movie', {
          title: 'Movie error',
          movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rating: 'N/A' },
          styles: ['index.css'],
        });
      }
      db.node3().query(
        `start transaction; Select * from movies WHERE id = ${req.params.id}; commit;`,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.render('movie', {
              title: 'Movie error',
              movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rating: 'N/A' },
              styles: ['index.css'],
            });
          }
          if (result[1].length === 0) {
            return res.render('movie', {
              title: 'Movie error',
              movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rating: 'N/A' },
              styles: ['index.css'],
            });
          }
          const movie = Object.values({ ...result[1] })[0];
          console.log('-! node3');
          console.log(movie);
          return res.render('movie', {
            title: movie.name,
            movie,
            styles: ['index.css'],
          });
        }
      );
    });
  },
  // addMovie: (req, res, next) => {
  //   db.ping(db.localNode(), (isLocalNodeUp) => {
  //     if (!isLocalNodeUp) {
  //       res.locals.NODE_NUMBER = process.env.NODE_NUMBER;
  //       next();
  //     }
  //     db.localNode().query(
  //       `start transaction; INSERT INTO movies (name, year, rank) VALUES (?, ?, ?); commit;`,
  //       [req.body.name, req.body.year, req.body.rank],
  //       (err) => {
  //         if (err) {
  //           console.log(err);
  //           return res.json('Insert failed');
  //         }
  //         return res.json('Insert successful');
  //       }
  //     );
  //   });
  // },
  addMovieNode1: (req, res, next) => {
    db.ping(db.node1(), (isNode1Up) => {
      if (!isNode1Up) {
        if (process.env.NODE_NUMBER === '1') db.node1DownLog(req.body, 'add');
        next();
      }
      db.node1().query(
        `start transaction; INSERT INTO movies (name, year, rank) VALUES (?, ?, ?); commit;`,
        [req.body.name, req.body.year, req.body.rank],
        (err) => {
          if (err) {
            console.log(err);
            return res.json('Insert to node1 failed');
          }
          return res.json('Insert to node1 successful');
        }
      );
    });
  },
  addMovieNode2: (req, res, next) => {
    if (req.body.year >= 1980) {
      return next();
    }
    db.ping(db.node2(), (isNode2Up) => {
      if (!isNode2Up) {
        if (process.env.NODE_NUMBER === '2') db.node2DownLog(req.body, 'add');
        next();
      }
      db.node2().query(
        `start transaction; INSERT INTO movies (name, year, rank) VALUES (?, ?, ?); commit;`,
        [req.body.name, req.body.year, req.body.rank],
        (err) => {
          if (err) {
            console.log(err);
            return res.json('Insert to node2 failed');
          }
          return res.json('Insert to node2 successful');
        }
      );
    });
    return res.send('Insert to node2 -return-');
  },
  addMovieNode3: (req, res) => {
    db.ping(db.node3(), (isNode3Up) => {
      if (!isNode3Up) {
        if (process.env.NODE_NUMBER === '3') db.node3DownLog(req.body, 'add');
        res.json('Insert failed');
      }
      db.node3().query(
        `start transaction; INSERT INTO movies (name, year, rank) VALUES (?, ?, ?); commit;`,
        [req.body.name, req.body.year, req.body.rank],
        (err) => {
          if (err) {
            console.log(err);
            return res.json('Insert to node3 failed');
          }
          return res.json('Insert to node3 successful');
        }
      );
    });
  },
  // updateMovie: (req, res) => {
  //   db.localNode().query(`start transaction; SELECT * FROM movies WHERE id = ${req.params.id};`, (err) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       db.localNode().query(
  //         'UPDATE movies SET name = ?, year= ?, rank= ? WHERE id = ?; commit;',
  //         [req.body.name, req.body.year, req.body.rank, req.params.id],
  //         (err2) => {
  //           if (err2) {
  //             console.log(err2);
  //           } else {
  //             res.json('Update successful');
  //           }
  //         }
  //       );
  //     }
  //   });
  // },
  updateMovieNode1: (req, res, next) => {
    db.ping(db.node1(), (isNode1Up) => {
      if (!isNode1Up) {
        if (process.env.NODE_NUMBER === '1') db.node1DownLog(req.body, 'update');
        next();
      }
      db.node1().query(`start transaction; SELECT * FROM movies WHERE id = ${req.params.id};`, (err) => {
        if (err) {
          console.log(err);
          return res.json('Update to node1 failed (error)');
        }
        db.node1().query(
          'UPDATE movies SET name = ?, year= ?, rank= ? WHERE id = ?; commit;',
          [req.body.name, req.body.year, req.body.rank, req.params.id],
          (err2) => {
            if (err2) {
              console.log(err2);
              return res.json('Update to node1 failed');
            }
            return res.json('Update to node1 successful');
          }
        );
        return res.send('Update to node1 -return-');
      });
    });
  },
  updateMovieNode2: (req, res, next) => {
    if (req.body.year >= 1980) {
      return next();
    }
    db.ping(db.node2(), (isNode2Up) => {
      if (!isNode2Up) {
        if (process.env.NODE_NUMBER === '2') db.node2DownLog(req.body, 'update');
        next();
      }
      db.node2().query(`start transaction; SELECT * FROM movies WHERE id = ${req.params.id};`, (err) => {
        if (err) {
          console.log(err);
          return res.json('Update to node2 failed (error)');
        }
        db.node2().query(
          'UPDATE movies SET name = ?, year= ?, rank= ? WHERE id = ?; commit;',
          [req.body.name, req.body.year, req.body.rank, req.params.id],
          (err2) => {
            if (err2) {
              console.log(err2);
              return res.json('Update to node2 failed');
            }
            return res.json('Update to node2 successful');
          }
        );
        return res.send('Update to node2 -return-');
      });
    });
    return res.send('Update to node2 -return-');
  },
  updateMovieNode3: (req, res) => {
    db.ping(db.node3(), (isNode3Up) => {
      if (!isNode3Up) {
        if (process.env.NODE_NUMBER === '3') db.node3DownLog(req.body, 'update');
        res.json('Update failed');
      }
      db.node3().query(`start transaction; SELECT * FROM movies WHERE id = ${req.params.id};`, (err) => {
        if (err) {
          console.log(err);
          return res.json('Update to node3 failed (error)');
        }
        db.node3().query(
          'UPDATE movies SET name = ?, year= ?, rank= ? WHERE id = ?; commit;',
          [req.body.name, req.body.year, req.body.rank, req.params.id],
          (err2) => {
            if (err2) {
              console.log(err2);
              return res.json('Update to node3 failed');
            }
            return res.json('Update to node3 successful');
          }
        );
        return res.send('Update to node3 -return-');
      });
    });
  },
  // deleteMovie: (req, res) => {
  //   db.localNode().query(
  //     `start transaction; DELETE FROM movies WHERE id = ${req.params.id}; commit;`,
  //     (err, result) => {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         res.json(result);
  //       }
  //     }
  //   );
  // },
  deleteMovieNode1: (req, res, next) => {
    db.ping(db.node1(), (isNode1Up) => {
      if (!isNode1Up) {
        if (process.env.NODE_NUMBER === '1') db.node1DownLog(req.body, 'delete');
        next();
      }
      db.node1().query(`start transaction; DELETE FROM movies WHERE id = ${req.params.id}; commit;`, (err) => {
        if (err) {
          console.log(err);
          return res.json('Delete from node1 failed (error)');
        }
        return res.json('Delete from node1 successful');
      });
    });
  },
  deleteMovieNode2: (req, res, next) => {
    if (req.body.year >= 1980) {
      return next();
    }
    db.ping(db.node2(), (isNode2Up) => {
      if (!isNode2Up) {
        if (process.env.NODE_NUMBER === '2') db.node2DownLog(req.body, 'delete');
        next();
      }
      db.node2().query(`start transaction; DELETE FROM movies WHERE id = ${req.params.id}; commit;`, (err) => {
        if (err) {
          console.log(err);
          return res.json('Delete from node2 failed (error)');
        }
        return res.json('Delete from node2 successful');
      });
    });
    return res.send('Delete from node2 -return-');
  },
  deleteMovieNode3: (req, res) => {
    db.ping(db.node3(), (isNode3Up) => {
      if (!isNode3Up) {
        if (process.env.NODE_NUMBER === '3') db.node3DownLog(req.body, 'delete');
        res.json('Delete failed');
      }
      db.node3().query(`start transaction; DELETE FROM movies WHERE id = ${req.params.id}; commit;`, (err) => {
        if (err) {
          console.log(err);
          return res.json('Delete from node3 failed (error)');
        }
        return res.json('Delete from node3 successful');
      });
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
