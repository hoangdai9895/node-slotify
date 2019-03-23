var express = require('express');
var router = express.Router();
var data = require('../models/firebase')
var usersRef = data.ref('users');
var Firebase = require('firebase');
var config = {
    apiKey: "AIzaSyC-u1ZEFqNXzUgK3aBuqas6XILRpcRBn_Y",
    authDomain: "album-098.firebaseapp.com",
    databaseURL: "https://album-098.firebaseio.com",
    projectId: "album-098",
    storageBucket: "album-098.appspot.com",
    messagingSenderId: "58739759163"
};
Firebase.initializeApp(config);
router.get('/register', (req, res, next) => {
    res.render('users/register');
})

router.get('/login', (req, res, next) => {
    if (res.locals.authdata !== null) {
        res.redirect('/albums')
    } else {
        res.render('users/login');
    }
})

router.post('/register', (req, res, next) => {
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    var location = req.body.location;
    var fav_artists = req.body.fav_artists;
    var fav_genres = req.body.fav_genres;

    // Validation
    req.checkBody('first_name', 'First name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('users/register', {
            errors: errors
        });
    } else {
        Firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(e => {
                console.log('user created successfully', e.user.uid);
                var user = {
                    uid: e.user.uid,
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                    location: location,
                    fav_genres: fav_genres,
                    fav_artists: fav_artists
                }
                usersRef.push().set(user);
                req.flash('success_msg', 'You are now registered and can login');
                res.redirect('/users/login');
            })
            .catch(function(err) {
                if (err) console.log(err.message);
                req.flash('error_msg', err.message);
                res.redirect('/users/register');
            });
    }

})

router.post('/login', function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    // Validation
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('users/login', {
            errors: errors
        });
    } else {
        Firebase.auth().signInWithEmailAndPassword(email, password)
            .then(e => {
                console.log('user logged in successfully', e.user.uid);
                req.flash('success_msg', 'You are now logged in');
                res.redirect('/albums');
            })
            .catch(function(err) {
                if (err) console.log(err);
                req.flash('error_msg', 'Login Failed');
                res.redirect('/users/login');
            });
    }
});

router.get('/logout', (req, res) => {
    Firebase.auth().signOut().then(function() {
        // Firebase.unauth();
        req.flash('success_msg', 'You are now logged out');
        res.redirect('/');
    }).catch(function(error) {
        req.flash('error_msg', 'Loggout failes or somthing wrong');
        res.redirect('/');
    });
})
module.exports = router;