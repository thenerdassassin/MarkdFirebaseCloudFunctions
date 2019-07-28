// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const database = require("firebase").database();

exports.plumberReferenceChange = functions.database.ref('/users/{customerId}/plumberReference')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        const contractors = [getValue(change.before), getValue(change.after)];

        if(contractors[0] === contractors[1]) {
            console.log("No change to plumberReference")
            return Promise.resolve("No change to plumberReference")
        }
        const contractorReferences = mapToDatabaseReferences(contractors);
        console.log("Updating plumber customer lists of " + contractors, " to remove/add " + customerId);
        return updateCustomerLists(contractorReferences, customerId);
});

exports.electricianReferenceChange = functions.database.ref('/users/{customerId}/electricianReference')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        const contractors = [getValue(change.before), getValue(change.after)];

        if(contractors[0] === contractors[1]) {
            console.log("No change to electricianReference")
            return Promise.resolve("No change to electricianReference")
        }
        console.log("Updating electrician customer lists of " + contractors, " to remove/add " + customerId);
        const contractorReferences = mapToDatabaseReferences(contractors);
        console.log("Got references: ", contractorReferences)
        return updateCustomerLists(contractorReferences, customerId);
});

exports.hvactechnicianReferenceChange = functions.database.ref('/users/{customerId}/hvactechnicianReference')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        const contractors = [getValue(change.before), getValue(change.after)];

        if(contractors[0] === contractors[1]) {
            console.log("No change to hvactechnicianReference")
            return Promise.resolve("No change to hvactechnicianReference")
        }
        const contractorReferences = mapToDatabaseReferences(contractors);
        console.log("Updating hvac customer lists of " + contractors, " to remove/add " + customerId);
        return updateCustomerLists(contractorReferences, customerId);
});

exports.painterReferenceChange = functions.database.ref('/users/{customerId}/painterReference')
    .onWrite((change, context) => {
        const customerId = context.params.customerId
        const contractors = [getValue(change.before), getValue(change.after)];

        if(contractors[0] === contractors[1]) {
            console.log("No change to painterReference")
            return Promise.resolve("No change to painterReference")
        }
        const contractorReferences = mapToDatabaseReferences(contractors);
        console.log("Updating painter customer lists of " + contractors, " to remove/add " + customerId);
        return updateCustomerLists(contractorReferences, customerId);
});

function updateCustomerLists(contractorReferences, customerId) {
    return Promise.all(
      contractorReferences.map(reference => {
        console.log("Mapping reference: " + reference)
        return reference == undefined ? undefined : reference.once('value')
      })
    ).then(snapshots => {
        console.log("Processing snapshots: ", snapshots)
        return processSnapshots(contractorReferences, snapshots, customerId);
    }).then(_ => {
        console.log("Updated customerLists")
    }).catch(error => {
        console.error(error)
    });
}

function processSnapshots(contractorReferences, snapshots, customerId) {
    return Promise.all([
        deleteFromCustomerList(contractorReferences[0], snapshots[0], customerId),
        insertInCustomerList(contractorReferences[1], snapshots[1], customerId)
    ])
}

function mapToDatabaseReferences(contractors) {
    return contractors
        .map((contractor) => {
          let referenceString = getReferenceStringOfCustomerList(contractor)
          return referenceString == undefined ? undefined : database.ref(referenceString)
        });
}

function deleteFromCustomerList(databaseRef, snapshot, customerId) {
    console.log("Deleting ", customerId, "from ", databaseRef)
    if(snapshot && snapshot.exists()) {
      let oldCustomerList = snapshot.val();
      if(oldCustomerList) {
          console.log("Previous customerList: ", oldCustomerList)
        return databaseRef.set(oldCustomerList.filter(id => id !== customerId));
      }
    }
    return Promise.resolve("No customers in list");
}

function insertInCustomerList(databaseRef, snapshot, customerId) {
    console.log("Inserting ", customerId, "to ", databaseRef)
    if(!snapshot) {
      return Promise.resolve("No contractor to insert customer into.")
    }
    if(snapshot.exists()) {
        const oldCustomerList = snapshot.val();
        if(oldCustomerList) {
            console.log("Previous customerList: ", oldCustomerList)
            return databaseRef.set([...oldCustomerList, customerId])
        }
    }
    return databaseRef.set({"0":customerId})
}

function getReferenceStringOfCustomerList(id) {
    if(id) {
      const referenceString = '/users/' + id + '/customers'
      console.log(referenceString)
      return referenceString
    }
    return undefined
}

function getValue(changeItem) {
    if(changeItem.exists()) {
        return changeItem.val();
    } else {
        return undefined;
    }
}
