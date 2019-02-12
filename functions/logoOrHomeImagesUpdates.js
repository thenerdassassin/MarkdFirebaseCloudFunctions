// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();
const bucketName = 'markd-schmidt-happens.appspot.com';

//Used to delete old image when new image is loaded for home
exports.homeImageUpdated = functions.database.ref('/users/{customerId}/homeImageFileName')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        if (!change.before.exists()) {
            console.log("No previous home image exists.");
            return Promise.resolve("No previous home image.")
        }
        const oldFile = change.before.val();
        const filename = 'images/homes/' + customerId + "/" + oldFile;

        // Deletes the file from the bucket
        return storage.bucket(bucketName).file(filename).delete()
            .then(() => {
              console.log(`gs://${bucketName}/${filename} deleted.`);
            })
            .catch(err => {
              console.error('ERROR:', err);
            });
});

exports.logoImageUpdated = functions.database.ref('/users/{contractorId}/logoFileName')
    .onWrite((change, context) => {
        const contractorId = context.params.contractorId
        if (!change.before.exists()) {
            console.log("No previous logo image exists.");
            return Promise.resolve("No previous logo")
        }
        const oldFile = change.before.val();
        const filename = 'images/logos/' + contractorId + "/" + oldFile;

        // Deletes the file from the bucket
        return storage.bucket(bucketName).file(filename).delete()
            .then(() => {
              console.log(`gs://${bucketName}/${filename} deleted.`);
            })
            .catch(err => {
              console.error('ERROR:', err);
            });
});
