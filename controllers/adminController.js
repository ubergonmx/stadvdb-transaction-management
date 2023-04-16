/* eslint consistent-return: "off" */
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
  },
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
              movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rank: 'N/A' },
              styles: ['index.css'],
            });
          }
          if (result[1].length === 0) {
            return res.render('movie', {
              title: 'Movie error',
              movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rank: 'N/A' },
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
              movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rank: 'N/A' },
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
          movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rank: 'N/A' },
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
              movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rank: 'N/A' },
              styles: ['index.css'],
            });
          }
          if (result[1].length === 0) {
            return res.render('movie', {
              title: 'Movie error',
              movie: { id: req.params.id, name: 'Movie not found', year: 'N/A', rank: 'N/A' },
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
  addMovieNode1: (req, res, next) => {
    db.ping(db.node1(), (isNode1Up) => {
      if (!isNode1Up) {
        if (process.env.NODE_NUMBER === '1') db.node1DownLog(req.body, 'add');
        next();
      }
      db.getLastId((lastId) => {
        db.node1().query(
          `start transaction; INSERT INTO movies (id, name, year, \`rank\`) VALUES (?, ?, ?, ?); commit;`,
          [lastId + 1, req.body.name, req.body.year, req.body.rank],
          (err) => {
            if (err) {
              console.log(err);
              return res.json('Insert to node1 failed');
            }
            return res.json('Insert to node1 successful');
          }
        );
      });
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
      db.getLastId((lastId) => {
        db.node2().query(
          `start transaction; INSERT INTO movies (id, name, year, \`rank\`) VALUES (?, ?, ?, ?); commit;`,
          [lastId + 1, req.body.name, req.body.year, req.body.rank],
          (err) => {
            if (err) {
              console.log(err);
              return res.json('Insert to node2 failed');
            }
            return res.json('Insert to node2 successful');
          }
        );
      });
    });
  },
  addMovieNode3: (req, res) => {
    db.ping(db.node3(), (isNode3Up) => {
      if (!isNode3Up) {
        if (process.env.NODE_NUMBER === '3') db.node3DownLog(req.body, 'add');
        res.json('Insert failed');
      }
      db.getLastId((lastId) => {
        db.node3().query(
          `start transaction; INSERT INTO movies (id, name, year, \`rank\`) VALUES (?, ?, ?, ?); commit;`,
          [lastId + 1, req.body.name, req.body.year, req.body.rank],
          (err) => {
            if (err) {
              console.log(err);
              return res.json('Insert to node3 failed');
            }
            return res.json('Insert to node3 successful');
          }
        );
      });
    });
  },
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
          'UPDATE movies SET name = ?, year= ?, `rank`= ? WHERE id = ?; commit;',
          [req.body.name, req.body.year, req.body.rank, req.params.id],
          (err2) => {
            if (err2) {
              console.log(err2);
              return res.json('Update to node1 failed');
            }
            return res.json('Update to node1 successful');
          }
        );
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
          'UPDATE movies SET name = ?, year= ?, `rank`= ? WHERE id = ?; commit;',
          [req.body.name, req.body.year, req.body.rank, req.params.id],
          (err2) => {
            if (err2) {
              console.log(err2);
              return res.json('Update to node2 failed');
            }
            return res.json('Update to node2 successful');
          }
        );
      });
    });
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
          'UPDATE movies SET name = ?, year= ?, `rank`= ? WHERE id = ?; commit;',
          [req.body.name, req.body.year, req.body.rank, req.params.id],
          (err2) => {
            if (err2) {
              console.log(err2);
              return res.json('Update to node3 failed');
            }
            return res.json('Update to node3 successful');
          }
        );
      });
    });
  },
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
    db.localNode().query(`SET SESSION TRANSACTION ISOLATION LEVEL ${req.params.level}`, (err) => {
      if (err) {
        console.log(err);
        res.json('Error setting isolation level');
      } else {
        console.log(`Isolation level set to ${req.params.level}`);
        res.json(`Isolation level set to ${req.params.level}`);
      }
    });
  },
};
module.exports = adminController;
