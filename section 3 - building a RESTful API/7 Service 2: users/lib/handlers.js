/**
 * These are the request handlers
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define the Handlers
var handlers = {};

// Users
handlers.users = (data, callback) => {
  console.log('at users handler ~~~~');
  const acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    console.log('ACCEPTABLE METHODS @@@@@')
    handlers._users[data.method](data, callback);
  } else {
    console.log('CALLBACK @@@@@')
    callback(405);
  }
}

// Containers for the users submethod
handlers._users = {}

// Users - post
// Required data: firstName, lastName, phone, passoword, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {

  console.log(' USERS POST CALLED +1 +++++++++++');
  // Check that all the required fields are filled out
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false ? data.payload.tosAgreement : false;

  if(firstName, lastName, phone, password, tosAgreement) {
    console.log(' INSIDE IF CONDITION 1 +++++++++++');
    // Make sure that the user doesnt already exist
    _data.read('users', phone, (err, data) => {
      if(err) {
        // Hash the password
        let hashedPassword = helpers.hash(password);
        if(hashedPassword) {
          // Create the user object
          var userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true,
          }

          // Store the user
          _data.create('users', phone, userObject, err => {
            if(!err) {
              callback(200)
            } else {
              console.log(err);
              callback(400, {
                Error: 'Could not create the user'
              })
            }
          })
        } else {
          callback(400, {
            Error: 'Could not hash the user\'s password'
          })
        }
      } else {
        callback(400, {
          Error: 'A User with that phone number already exists'
        });
      }
    }); 
  } else {
    callback(400, {
      Error: 'Missing required fields'
    });
  }
};

// Users - get
// Required Data: phone
// Optional Data: none
// TODO: only let an authenticated user access their data. Don't let them access anyone else's
handlers._users.get = (data, callback) => {
  // Check that the phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    _data.read('users', phone, (err, data) => {
      if(!err) {
        // Remove the hashed password before returning it to the user
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404, {
          Error: 'User not exist'
        })
      }
    })

  } else {
    callback(400, {
      Error: 'Not a valid phone number'
    });
  }
};

// Users - put
// Required data : phone
// Optional data: firstName, lastName, password ( at least one must be specified)
// TODO: only let authenticated user updated their own object. Don't let others update the data
handlers._users.put = (data, callback) => {
  // Check for required field
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
 
  // Check for optional fields
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if the phone is invalid
  if(phone){
    if(firstName || lastName || password){
      _data.read('users', phone, (err, userData) => {
        if(!err && userData){
          // Update the fields that are ncessessary
          if(firstName){
            userData.firstName = firstName;
          }
          if(lastName){
            userData.lastName = lastName;
          }
          if(password){
            userData.password = helpers.hash(password);
          }
          _data.update('users', phone, userData, err => {
            if(!err) {
              callback(200, {
                message: 'Data updated successfully',
              });
            } else {
              console.log('Error Occured ', err);
              callback(500, {
                Error: 'Unable to update the data',
              });
            }
          });
        } else {
          callback(404, {
            Error: 'User does not exist'
          })
        }
      })
    } else {
      callback(400, {
        Error: 'Missing Fields to update'
      })
    }

  } else {
    callback(400, {
      Error: 'Missing required field'
    })
  }
};

// Users - delete
// Required Fields: Phone
// TODO: Only let an authinticated user delete their object. Dont let them do delete anyone else's.
// TODO: Cleanup (delete) any other data files associated wir
handlers._users.delete = (data, callback) => {
  //Check if the phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // Look up for the user
    _data.read('users', phone, (err, data) => {
      if(!err && data) {
        _data.delete('users', phone,(err) => {
          if(!err){
            callback(200);
          } else {
            callback(500, {
              Error: 'Could not find the specified user'
            });
          }
        });
      } else {
        callback(500, {
          Error: 'User not found'
        });
      }
    })
  } else {
    callback(400, {
      Error: 'Missing required fields'
    })
  }
};

// Ping handler
handlers.ping = (data, callback) => {
  callback(200);
}

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
}

module.exports = handlers;