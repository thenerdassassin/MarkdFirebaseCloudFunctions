// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.notifications =  functions.database.ref('/notifications/{customerId}')
    .onWrite(event => {
        const customerId = event.params.customerId
        const previous = event.data.previous
        const value = event.data.val()
        var previousNotification = null;

        if (!event.data.exists()) {
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
                const registrationToken = token.val()
                console.log("Token:", registrationToken)

                const payload = {
                    notification: {
                        title: "Sent to " + customerId,
                        body: notification
                    }
                };

                // Send a message to the device corresponding to the provided registration token.
                return admin.messaging().sendToDevice(registrationToken, payload).then(function(response) {
                        console.log("Successfully sent message:", response);
                }).catch(function(error) {
                    console.log("Error sending message:", error);
                });
        });
});
