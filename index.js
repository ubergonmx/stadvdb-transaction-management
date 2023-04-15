require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const morgan = require('morgan');
const path = require('path');
const { db } = require('./model/db');

// create express app
const app = express();

const port = process.env.PORT || 3000;

// set json and urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// set view engine
app.engine(
  'hbs',
  engine({
    extname: 'hbs',
    defaultLayout: 'main',
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));

// set morgan to log HTTP requests
app.use(morgan('dev'));

// set routes
app.use('/', require('./routes/routes'));

// 404 page
app.use((req, res) => {
  res.status(404).render('404');
});

// connect to database
db.connectDB();
setInterval(() => {
  console.log('Checking local database connection');
  db.ping(db.localNode());
}, 5000);

// start express server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
