var express = require('express');
var router = express.Router();
var data = require('../models/firebase');
var multer = require('multer');
var upload = multer({ dest: './public/images/uploads' })
var Firebase = require('firebase');

router.get('*', function(req, res, next) {
    // Check Authentication
    if (Firebase.auth().currentUser == null) {
        res.redirect('/users/login');
    } else {
        next();
    }

});


router.get('/', (req, res, next) => {
    var albumsRef = data.ref('albums');
    // console.log(albumsRef)
    // return;
    albumsRef.once('value', function(snapshot) {
        var data = [];
        // console.log(snapshot.val())

        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            if (childData && childData.uid === Firebase.auth().currentUser.uid) {
                data.push({
                    id: childKey,
                    artist: childData.artist,
                    genre: childData.genre,
                    info: childData.info,
                    title: childData.title,
                    label: childData.label,
                    tracks: childData.tracks,
                    cover: childData.cover,
                    year: childData.year
                })
            }
        });
        res.render('albums/index', { albums: data });
    });
});

router.get('/add', (req, res, next) => {
    var genresRef = data.ref('genres');
    genresRef.once('value', function(snapshot) {
        var data = [];
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val().name;
            // console.log(childData)
            if (childData && childSnapshot.val().uid === Firebase.auth().currentUser.uid) {
                data.push({
                    id: childKey,
                    name: childData
                })
            }
        });
        // console.log(data)
        res.render('albums/add', { genres: data });
    });
});

router.post('/add', upload.single('cover'), (req, res, next) => {
    // Check File Upload
    if (req.file) {
        console.log('Uploading File...');
        var cover = req.file.filename;
    } else {
        console.log('No File Uploaded...');
        var cover = 'noimage.jpg';
    }
    // Build Album Object
    var album = {
            artist: req.body.artist,
            title: req.body.title,
            genre: req.body.genre,
            info: req.body.info,
            year: req.body.year,
            label: req.body.label,
            tracks: req.body.tracks,
            cover: cover,
            uid: Firebase.auth().currentUser.uid
        }
        // Create Reference
    var albumRef = data.ref("albums");
    albumRef.push().set(album)
    req.flash('success_msg', 'Album Saved !!!!');
    res.redirect('/albums');
});

router.get('/details/:id', (req, res) => {
    var id = req.params.id;
    var albumsRef = data.ref('albums');
    albumsRef.once('value', function(snapshot) {
        var data = [];
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            console.log(id)
            if (id == childKey) {
                data.push({
                    id: childKey,
                    artist: childData.artist,
                    genre: childData.genre,
                    info: childData.info,
                    title: childData.title,
                    label: childData.label,
                    tracks: childData.tracks,
                    cover: childData.cover
                })
            }
            // console.log(data)
        });
        console.log(data[0])
            // return;
        res.render('albums/details', { album: data[0] });
    });
})
router.get('/edit/:id', (req, res, next) => {
    var id = req.params.id;
    var albumRef = data.ref('albums');
    var genresRef = data.ref('genres');
    genresRef.once('value', snapshot => {
            genres = [];
            snapshot.forEach(function(childSnapshot) {
                    var childKeyGenres = childSnapshot.key;
                    var dataGenres = childSnapshot.val();
                    genres.push({
                        id: childKeyGenres,
                        name: dataGenres.name
                    })
                })
                // console.log(genres)
        })
        // return;
    albumRef.once('value', function(snapshot) {
        var data = [];
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            console.log(id)
            if (id == childKey) {
                data.push({
                    id: childKey,
                    artist: childData.artist,
                    genre: childData.genre,
                    info: childData.info,
                    title: childData.title,
                    label: childData.label,
                    tracks: childData.tracks,
                    cover: childData.cover,
                    year: childData.year
                })
            }
        });
        // return;
        res.render('albums/edit', { album: data[0], genres: genres });
    })

})


router.post('/edit/:id', upload.single('cover'), (req, res, next) => {
    var id = req.params.id;
    // return;
    var albumsRef = data.ref('albums');
    // Check File Upload
    if (req.file) {
        // get Cover Filename
        var cover = req.file.filename;
        // Update Album With Cover
        albumsRef.child(id).update({
            artist: req.body.artist,
            title: req.body.title,
            genre: req.body.genre,
            info: req.body.info,
            year: req.body.year,
            label: req.body.label,
            tracks: req.body.tracks,
            cover: cover
        });
    } else {
        // Update Album Without Cover
        albumsRef.child(id).update({
            artist: req.body.artist,
            title: req.body.title,
            genre: req.body.genre,
            info: req.body.info,
            year: req.body.year,
            label: req.body.label,
            tracks: req.body.tracks
        });
    }

    req.flash('success_msg', 'Album Updated');
    res.redirect('/albums/details/' + id);
})


router.delete('/delete/:id', (req, res, next) => {
    var id = req.params.id;
    // var name = req.body.name;
    // return;
    var albumsRef = data.ref('albums');
    albumsRef.child(id).remove();
    req.flash('success_msg', 'Albums Deleted')
    res.send(200);
})

module.exports = router;