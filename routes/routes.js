const express = require('express');
const adminController = require('../controllers/adminController');

const app = express();

// test query to database and display on page
app.get('/', adminController.index);

module.exports = app;
