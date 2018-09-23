// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

//Used to delete old image when new image is loaded for home
exports.homeImageUpdated = functions.database.ref('/users/{customerId}/homeImageFileName')
    .onUpdate((change, context) => {
        const customerId = context.params.customerId
        if (!change.before.exists()) {
            console.log("No previous home image exists.");
            return null;
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


//Used to send Push Notifications when new notification exists
exports.notifications = functions.database.ref('/notifications/{customerId}')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        const previous = change.before
        const value = change.after.val()
        var previousNotification = null;

        if (!change.after.exists()) {
            console.log("For ", customerId, " data deleted.")
            return null;
        }

        if (previous.exists()) {
            previousNotification = previous.val()[0]
        }

        const notification = value[0]
        if(previousNotification == notification) {
            return null;
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
                            "sound" : "default"
                        }
                    };
            console.log("Tokens:", tokensToSendTo)
    		if(tokensToSendTo == null || tokensToSendTo.length == 0) {
    			console.log("No tokens to send.")
    			return null;
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
