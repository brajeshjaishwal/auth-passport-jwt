const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const auth = require('./auth')
const mongoose = require('mongoose')
const passport = require('passport')

const dburl = "mongodb://rudra:rudra1@ds231758.mlab.com:31758/blyricaldb"
const localdburl = "mongodb://127.0.0.1:27017/Users"

mongoose.connect(localdburl, { useNewUrlParser: true })

mongoose.connection.on('connect', function() {
    console.log(`data base running: ${dburl}`)
})
mongoose.connection.once('error', function() {
    console.log("data base failure")
})

mongoose.Promise = global.Promise

var app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(auth.initialize(passport))

app.get('/', (req, res) => {
    res.send("Hello dear jindagi")
})


app.post('/register', auth.register)

app.get('/login', (req, res) => {
    res.send("back to login screen.")
})

app.post('/login', auth.login)

app.get("/dashboard", passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), function(req, res){
    res.json("Success! proceed with the secret sause.");
});

app.get('/logout', (req, res) => {
    req.logout()
    res.send("You are now logged out.")
    res.redirect('/')
})

app.listen('4000', () => {
    console.log('Server listening on 4000')
})


