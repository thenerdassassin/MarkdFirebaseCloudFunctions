// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const database = require("firebase").database();

exports.contractorZipCodeUpdated = functions.database
    .ref('/users/{contractorId}/contractorDetails/zipCode')
    .onWrite((change, context) => {
        const contractorId = context.params.contractorId
        const zipcodes = [getValue(change.before), getValue(change.after)];

        if(zipcodes[0] === zipcodes[1]) {
            console.log("No change to zipcodes")
            return Promise.resolve("No change to zipcodes")
        }
        const zipCodeDatabaseReferences = mapToDatabaseReferences(zipcodes);
        console.log("Updating contractors in zipcodes lists for " + zipcodes, " to remove/add " + contractorId);
        database.ref('users/' + contractorId + "/type")
          .once('value')
          .then(contractorType => {
            console.log("Contractor Type", contractorType.val());
            return updateZipCodeLists(zipCodeDatabaseReferences, contractorId, contractorType.val());
          })
          .catch(error => {
            console.log(error)
            return Promise.reject(error)
          });

});

function getValue(changeItem) {
    if(changeItem.exists()) {
        return changeItem.val();
    } else {
        return undefined;
    }
}

function mapToDatabaseReferences(zipcodes) {
    return zipcodes
        .map((zipcode) => {
          let referenceString = getReferenceStringOfZipcodeList(zipcode)
          return referenceString == undefined ? undefined : database.ref(referenceString)
        });
}

function getReferenceStringOfZipcodeList(zipcode) {
    if(zipcode) {
      const referenceString = '/zip_codes/' + zipcode
      console.log(referenceString)
      return referenceString
    }
    return undefined
}

function updateZipCodeLists(zipCodeDatabaseReferences, contractorId, contractorType) {
  Promise.all(
    zipCodeDatabaseReferences.map(reference => {
      console.log("Mapping reference: " + reference)
      return reference == undefined ? undefined : reference.once('value')
    })
  ).then(snapshots => {
      return processZipcodeReferences(zipCodeDatabaseReferences, contractorId, contractorType)
  }).then(_ => {
        console.log("Updated zipCodeLists")
        return Promise.resolve("Update completed.")
  }).catch(error => {
        console.error(error)
        return Promise.reject(error)
  });
}

function processZipcodeReferences(zipCodeDatabaseReferences, contractorId, contractorType) {
    return Promise.all([
        deleteFromZipcodeList(zipCodeDatabaseReferences[0], contractorId),
        insertInZipcodeList(zipCodeDatabaseReferences[1], contractorId, contractorType)
    ])
}

function deleteFromZipcodeList(databaseRef, contractorId) {
    console.log("Deleting", contractorId, "from", databaseRef)
    if(databaseRef && contractorId) {
      databaseRef.once('value', function(snapshot) {
        if(snapshot.exists() && snapshot.hasChild(contractorId)) {
          return databaseRef.child(contractorId).remove();
        } else {
          return Promise.resolve("Contractor", contractorId, "not in Zipcode")
        }
      })
    }
    return Promise.resolve("No zipcodes in list");
}

function insertInZipcodeList(databaseRef, contractorId, contractorType) {
    console.log("Inserting ", contractorId, "to ", databaseRef)
    if(databaseRef && contractorId) {
      return databaseRef.child(contractorId).set(contractorType);
    }
    return Promise.resolve("No contractor to insert into zipcode.")
}
