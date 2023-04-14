"use strict"
import "dotenv/config";
import express from 'express';
import exphbs, { engine } from 'express-handlebars';
import mysql from 'mysql';
import morgan from 'morgan';
import path from 'path';

// create express app
const app = express();

const port = process.env.PORT || 3000;

const __dirname = path.resolve();

// set json and urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// set view engine
app.engine('handlebars', engine());
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));

// set morgan to log HTTP requests
app.use(morgan('dev'));

// 404 page
app.use((req, res) => {
    res.status(404).render('404');
    }
);

// start express server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    }
)