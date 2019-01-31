// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

//Used to delete old image when new image is loaded for home
exports.homeImageUpdated = functions.database.ref('/users/{customerId}/homeImageFileName')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        if (!change.before.exists()) {
            console.log("No previous home image exists.");
            return Promise.resolve("No previous home image.")
        }
        const oldFile = change.before.val();

        const {Storage} = require('@google-cloud/storage');
        const storage = new Storage();
        const bucketName = 'markd-schmidt-happens.appspot.com';
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

        const {Storage} = require('@google-cloud/storage');
        const storage = new Storage();
        const bucketName = 'markd-schmidt-happens.appspot.com';
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

exports.plumbingServiceImageUpdated = functions.database.ref('/users/{customerId}/plumbingServices/{serviceId}/files/{fileId}')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        if (!change.before.exists()) {
            console.log("No previous service image exists.");
            return Promise.resolve("No previous service")
        }
        const oldFile = change.before.val().guid;
        if(change.after.exists()) {
            const newFile = change.after.val().guid;

            if(oldFile == newFile) {
                console.log("No change to file")
                return Promise.resolve("No change")
            }
        }

        const {Storage} = require('@google-cloud/storage');
        const storage = new Storage();
        const bucketName = 'markd-schmidt-happens.appspot.com';
        const filename = 'images/services/' + customerId + "/" + oldFile;

        // Deletes the file from the bucket
        return storage.bucket(bucketName).file(filename).delete()
            .then(() => {
              console.log(`gs://${bucketName}/${filename} deleted.`);
            })
            .catch(err => {
              console.error('ERROR:', err);
            });
});

exports.electricalServiceImageUpdated = functions.database.ref('/users/{customerId}/electricalServices/{serviceId}/files/{fileId}')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        if (!change.before.exists()) {
            console.log("No previous service image exists.");
            return Promise.resolve("No previous service image")
        }
        const oldFile = change.before.val().guid;
        if(change.after.exists()) {
            const newFile = change.after.val().guid;

            if(oldFile == newFile) {
                console.log("No change to file")
                return Promise.resolve("No change.")
            }
        }

        const {Storage} = require('@google-cloud/storage');
        const storage = new Storage();
        const bucketName = 'markd-schmidt-happens.appspot.com';
        const filename = 'images/services/' + customerId + "/" + oldFile;

        // Deletes the file from the bucket
        return storage.bucket(bucketName).file(filename).delete()
            .then(() => {
              console.log(`gs://${bucketName}/${filename} deleted.`);
            })
            .catch(err => {
              console.error('ERROR:', err);
            });
});

exports.hvacServiceImageUpdated = functions.database.ref('/users/{customerId}/hvacServices/{serviceId}/files/{fileId}')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        if (!change.before.exists()) {
            console.log("No previous service image exists.");
            return Promise.resolve("No previous service image")
        }
        const oldFile = change.before.val().guid;
        if(!oldFile) {
            console.log("No previous service image exists.");
            return Promise.resolve("No previous service image")
        }
        if(change.after.exists()) {
            const newFile = change.after.val().guid;

            if(oldFile == newFile) {
                console.log("No change to file")
                return Promise.resolve("No change.")
            }
        }

        const {Storage} = require('@google-cloud/storage');
        const storage = new Storage();
        const bucketName = 'markd-schmidt-happens.appspot.com';
        const filename = 'images/services/' + customerId + "/" + oldFile;

        // Deletes the file from the bucket
        return storage.bucket(bucketName).file(filename).delete()
            .then(() => {
              console.log(`gs://${bucketName}/${filename} deleted.`);
            })
            .catch(err => {
              console.error('ERROR:', err);
            });
});

//Used to send Push Notifications when new notification exists
exports.notifications = functions.database.ref('/notifications/{customerId}')
    .onWrite((change, context) => {
        console.log("Received write event on notifications")
        const customerId = context.params.customerId
        const previous = change.before
        var previousNotificationList = null;

        if (!change.after.exists()) {
            console.log("For ", customerId, " data deleted.")
            return Promise.resolve("Data deleted.")
        }

        if (previous.exists()) {
            previousNotificationList = previous.val()
        }

        const value = change.after.val()
        const currentNotificationList = value
        const notification = currentNotificationList[0]
        if(!currentNotificationList ||
            currentNotificationList.length < 1 ||
            (previousNotificationList &&
                previousNotificationList.some(element => element.message === notification.message)
        )) {
            console.log("Already sent this notification")
            return Promise.resolve("Already sent.")
        }
        console.log('customer:', customerId, ', message:', notification);

        //Get registrationToken
        var tokenRef = admin.database().ref('/tokens').child(customerId)
        return tokenRef.once('value').then(function(token) {
            const registrationTokens = token.val()
            console.log("TokensMap:", registrationTokens)

            var tokensToSendTo = []
            for (var key in registrationTokens) {
                tokensToSendTo.push(registrationTokens[key])
            }
    		console.log("Notification:" + JSON.stringify(notification))
            console.log("Message:" + notification.message)

    		const payload = {
                        notification: {
                            title: "Contractor Notification",
                            body: notification.message,
                            "sound" : "default",
                            badge: "1"
                        }
                    };
            console.log("Tokens:", tokensToSendTo)
    		if(tokensToSendTo == null || tokensToSendTo.length == 0) {
    			console.log("No tokens to send.")
    			return Promise.resolve("No tokens.")
    		}
            // Send a message to the device corresponding to the provided registration token.
            return admin.messaging().sendToDevice(tokensToSendTo, payload).then(function(response) {
                if(response.failureCount > 0) {
                    console.log(response.results[0].error)
                }
                console.log("Successfully sent message:", response);
            }).catch(function(error) {
                console.log("Error sending message:", error);
            });
        });
});
