// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const firebase = require("firebase");
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();
admin.initializeApp();

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDsTyX8ior-fA9960MD6GyQfsX5_8DkSq0",
    authDomain: "markd-home.firebaseapp.com",
    databaseURL: "https://markd-home.firebaseio.com",
    projectId: "markd-home",
    storageBucket: "markd-home.appspot.com",
    messagingSenderId: "659561774379"
  };

firebase.initializeApp(config);


const logoOrHomeImagesUpdates = require('./logoOrHomeImagesUpdates.js');
const serviceImageUpdates = require('./serviceImageUpdates.js');
const notifications = require('./notifications.js');
const customersList = require('./customersList.js');
const contractorZipCodeUpdated = require('./contractorZipCodeUpdated.js');

exports.homeImageUpdated = logoOrHomeImagesUpdates.homeImageUpdated;
exports.logoImageUpdated = logoOrHomeImagesUpdates.logoImageUpdated;
exports.hvacServiceImageUpdated = serviceImageUpdates.hvacServiceImageUpdated;
exports.electricalServiceImageUpdated = serviceImageUpdates.electricalServiceImageUpdated;
exports.plumbingServiceImageUpdated = serviceImageUpdates.plumbingServiceImageUpdated;
exports.notifications = notifications.notifications;
exports.plumberReferenceChange = customersList.plumberReferenceChange;
exports.electricianReferenceChange = customersList.electricianReferenceChange;
exports.hvactechnicianReferenceChange = customersList.hvactechnicianReferenceChange;
exports.painterReferenceChange = customersList.painterReferenceChange;
exports.contractorZipCodeUpdated = contractorZipCodeUpdated.contractorZipCodeUpdated;
