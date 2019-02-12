// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

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
