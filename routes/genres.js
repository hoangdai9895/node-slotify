var express = require('express');
var router = express.Router();
var data = require('../models/firebase')
var Firebase = require('firebase');

router.get('*', function(req, res, next) {
    // Check Authentication
    if (Firebase.auth().currentUser == null) {
        res.redirect('/users/login');
        // return;
    } else {
        next();
    }


});


router.get('/', (req, res, next) => {
    var genresRef = data.ref('genres');
    genresRef.once('value', function(snapshot) {
        var data = [];

        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val().name;
            // console.log(childData)
            if (childSnapshot.val().uid === Firebase.auth().currentUser.uid) {
                data.push({
                    id: childKey,
                    name: childData
                })
            }
        });
        res.render('genres/index', { genres: data });
        // console.log(data)

    });
})

router.get('/add', (req, res, next) => {
    res.render('genres/add');
})

router.post('/add', (req, res, next) => {
    var genre = {
        name: req.body.name,
        uid: Firebase.auth().currentUser.uid
    }

    // console.log(genre)
    var genreRef = data.ref('genres');
    genreRef.push().set(genre);
    req.flash('success_msg', "Genres is Added !!!");
    res.redirect('/genres');
})


router.get('/edit/:id', (req, res, next) => {
    var id = req.params.id;
    var genresRef = data.ref('genres');
    genresRef.once('value', function(snapshot) {
        var data = [];
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            console.log(id)
            if (id == childKey) {
                data.push({
                    id: childKey,
                    name: childData.name,
                })
            }
            // console.log(data)
        });
        res.render('genres/edit', { genre: data[0] });
    })

})

router.post('/edit/:id', (req, res, next) => {
    var id = req.params.id;
    var name = req.body.name;
    // return;
    var genresRef = data.ref('genres/');
    genresRef.child(id).update({
        "name": name
    });
    res.redirect('/genres')
})


router.delete('/delete/:id', (req, res, next) => {
    var id = req.params.id;
    // var name = req.body.name;
    // return;
    var genresRef = data.ref('genres');
    genresRef.child(id).remove();
    req.flash('success_msg', 'Genre Deleted')
    res.send(200);
})

// router.get('/delete/:id', (req, res, next) => {
//     // var id = req.params.id;
//     // // var name = req.body.name;
//     // // return;
//     // var genresRef = data.ref('genres');
//     // genresRef.child(id).remove();
//     // req.flash('success_msg', 'Genre Deleted')
//     res.redirect('/genres');
// })


module.exports = router;