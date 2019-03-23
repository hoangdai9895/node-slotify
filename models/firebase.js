var Firebase = require('firebase');
var admin = require('firebase-admin');
var serviceAccount = require('../config/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://album-098.firebaseio.com'
});
var db = admin.database();
var data = module.exports = db