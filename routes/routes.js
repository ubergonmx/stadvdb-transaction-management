const express = require('express');
const adminController = require('../controllers/adminController');

const app = express();

app.get('/', adminController.index);

// API routes
app.get('/api/movies', adminController.getMovies);
app.get('/api/performQueryNode1');

module.exports = app;
