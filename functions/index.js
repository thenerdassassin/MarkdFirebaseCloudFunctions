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
			console.log("No tokens to send to")
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
