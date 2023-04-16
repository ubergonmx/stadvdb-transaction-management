const express = require('express');
const adminController = require('../controllers/adminController');

const app = express();

// pages
app.get('/', adminController.index);
app.get('/movie/:id', adminController.getMovieNode1, adminController.getMovieNode2, adminController.getMovieNode3);

// API routes
app.get('/api/getAllMovies', adminController.getAllMovies);
app.post('/api/addMovie', adminController.addMovieNode1, adminController.addMovieNode2, adminController.addMovieNode3);
app.post(
  '/api/editMovie=:id',
  adminController.updateMovieNode1,
  adminController.updateMovieNode2,
  adminController.updateMovieNode3
);
app.delete(
  '/api/deleteMovie=:id',
  adminController.deleteMovieNode1,
  adminController.deleteMovieNode2,
  adminController.deleteMovieNode3
);

// set isolation level to the following: 1=READ UNCOMMITTED, 2=READ COMMITTED, 3=REPEATABLE READ, 4=SERIALIZABLE
app.post('/api/setIsolationLevel=:level', adminController.setIsolationLevel);

module.exports = app;
