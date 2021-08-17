const express = require("express");

const app = express();
const GitHubStrategy = require('passport-github').Strategy;
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();

app.use(passport.initialize());
app.use(passport.session());


//to persist the session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));


//to persist the data of user in the session
passport.serializeUser(function(user,cb){
    cb(null,user.id);
});

//to retrive user id from a session
passport.deserializeUser(function(id,cb){
    cb(null,id);
});


//gitHub strategy


passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: "http://localhost:3001/auth/github/callback"
},

    function (accessToken, refreshToken, profile, cb) {
        console.log(profile)
        cb(null, profile);
    }
));

const checkAuth = (req, res, next) => {
    if (req.user) {
        next();
    }

    else {
        res.redirect("/login")
    }
}


app.get("/",checkAuth, (req, res) => {
    //console.log(req.user)
    res.sendFile(__dirname + "/dash.html")
})


app.get("/login", (req, res) => {
    if (req.user) {
        return res.redirect("/")
    }

    else { 


        res.sendFile(__dirname + "/login.html")
    }
})

app.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/login");
})


//authentication 
app.get('/auth/github',
    passport.authenticate('github'));

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });


//server running
app.listen(3001, () => {
    console.log("server is running on port no 3001")
})