// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();
const bucketName = 'markd-home.appspot.com';

exports.plumbingServiceImageUpdated = functions.database.ref('/users/{customerId}/plumbingServices/{serviceId}/files')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        if (!change.before.exists()) {
            console.log("No previous files exists.");
            return Promise.resolve("No previous files.")
        }
        const oldFiles = change.before.val();
        var newFiles = [];
        if(!change.after.exists()) {
            console.log("Files have been deleted.");
        } else {
            newFiles = change.after.val();
        }

        return Promise.all(oldFiles.filter((oldFile) => oldFile && oldFile.guid).map((oldFile) =>
            deleteOldFile(customerId, oldFile, newFiles)))
            .then(_ => {
                console.log("Successfully processed files.")
            })
            .catch(error => {
                console.error(error)
            });
});

exports.electricalServiceImageUpdated = functions.database.ref('/users/{customerId}/electricalServices/{serviceId}/files')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        if (!change.before.exists()) {
            console.log("No previous files exists.");
            return Promise.resolve("No previous files.")
        }
        const oldFiles = change.before.val();
        var newFiles = [];
        if(!change.after.exists()) {
            console.log("Files have been deleted.");
        } else {
            newFiles = change.after.val();
        }

        return Promise.all(oldFiles.filter((oldFile) => oldFile && oldFile.guid).map((oldFile) =>
            deleteOldFile(customerId, oldFile, newFiles)))
            .then(_ => {
                console.log("Successfully processed files.")
            })
            .catch(error => {
                console.error(error)
            });
});

exports.hvacServiceImageUpdated = functions.database.ref('/users/{customerId}/hvacServices/{serviceId}/files')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        if (!change.before.exists()) {
            console.log("No previous files exists.");
            return Promise.resolve("No previous files.")
        }
        const oldFiles = change.before.val();
        var newFiles = [];
        if(!change.after.exists()) {
            console.log("Files have been deleted.");
        } else {
            newFiles = change.after.val();
        }

        return Promise.all(oldFiles.filter((oldFile) => oldFile && oldFile.guid).map((oldFile) =>
            deleteOldFile(customerId, oldFile, newFiles)))
            .then(_ => {
                console.log("Successfully processed files.")
            })
            .catch(error => {
                console.error(error)
            });
});

function deleteOldFile(customerId, oldFile, newFiles) {
    const oldGuid = oldFile.guid;
    if(newFiles.some(newFile => newFile.guid === oldGuid)) {
        //do nothing
        console.log('No need to delete ' + oldGuid);
        return Promise.resolve()
    } else {
        const filename = 'images/services/' + customerId + "/" + oldGuid;
        // Deletes the file from the bucket
        return storage.bucket(bucketName).file(filename).delete()
            .then(() => {
                console.log(`gs://${bucketName}/${filename} deleted.`);
            });
    }
}
