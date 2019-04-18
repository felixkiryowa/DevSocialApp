const express = require('express');
const app = express();
require("dotenv").config()
// console.log(process.env)
const path = require('path');
const bodyParser = require('body-parser')
const {Client} = require('pg')
// Main authentication module of node js
const passport = require('passport'); 
//Bring in files
const user = require('./routes/api/users')
const profiles = require('./routes/api/profile')
const posts = require('./routes/api/posts')

// app.set('view engine', 'pug')
app.set('view engine','ejs');


//Ser static folder
app.use(express.static(path.join(__dirname, 'public')))
// app.set('views',path.join(__dirname,'views'));
// Adding body parser middle ware for body parse
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.listen(process.env.PORT, () => {
    console.log("Listening on port 5006");
});

app.get('/', (req, res)=> {
    res.render('index', { title: 'Hey', message: 'Hello there!' })
});

app.get('/about', (req, res)=> {
    res.render('about', { title: 'Hey', message: 'Hello there!' })
});

app.get('/book/add', (req, res)=> {
    res.render('bookform');
});

app.post('/book/add', (req, res)=> {
    console.log('post body', req.body);
    const client = new Client()
    client.connect().then(() => {
        console.log('connection completed');
        //do query stuff
        const sql = 'INSERT INTO books (title, authors) VALUES ($1,$2)';
        const params = [req.body.title, req.body.author];
        return client.query( sql, params).then((result) => {
            console.log('result?', result );
            res.redirect('/list');
        })
    })
   
});

app.get('/books', (req, res)=> {
    const client = new Client()
    // Using Aynchronous calls
    client.connect().then(() => {
        //do query stuff
        const sql = 'SELECT * FROM books';
        return client.query(sql);
  }).then((results) => {
    console.log('results?', results.rows);
    res.render('booklist', {books:results.rows, title:"Book List"});
  }).catch((err) => {
      console.log('error', err);
      res.send('Something bad happened');
  })
});

// Delete a book
app.post('/book/delete/:id', (req, res) => {
    const client = new Client()
    const sql = 'DELETE FROM books WHERE book_id=$1;';
    const params = [req.params.id];
    return client.query( sql, params).then((result) => {
            console.log('result?', result );
            res.redirect('/books');
        }).catch((error) => {
            console.log('error', error);
        })

});

// Passport Middleware
app.use(passport.initialize())

// Passport Config
require('./config/passport')(passport)



// User Routes
app.use('/api/users', user);
app.use('/api/profile', profiles);
app.use('/api/posts', posts);
