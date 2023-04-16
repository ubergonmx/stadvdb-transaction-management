const express = require('express');
const adminController = require('../controllers/adminController');

const app = express();

app.get('/', adminController.index);

// API routes
app.get('/api/getMovies', adminController.getMovies);
app.post('/api/editMovie=:id', adminController.editMovie);
app.delete('/api/deleteMovie=:id', adminController.deleteMovie);

module.exports = app;
