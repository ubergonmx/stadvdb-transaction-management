const express = require('express');
const adminController = require('../controllers/adminController');

const app = express();

app.get('/', adminController.index);

// API routes
app.get('/api/getAllMovies', adminController.getAllMovies);
app.get('/api/getMovie=:id', adminController.getMovie);
app.post('/api/editMovie=:id', adminController.updateMovie);
app.delete('/api/deleteMovie=:id', adminController.deleteMovie);

// set isolation level to the following: 1=READ UNCOMMITTED, 2=READ COMMITTED, 3=REPEATABLE READ, 4=SERIALIZABLE
app.post('/api/setIsolationLevel=:level', adminController.setIsolationLevel);

module.exports = app;
