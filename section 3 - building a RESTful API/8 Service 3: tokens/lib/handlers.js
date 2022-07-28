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
handlers._users.get = (data, callback) => {
  // Check that the phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // only let an authenticated user access their data. Don't let them access anyone else's

    // Get the token from the headers
    var token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

    // Verify that the given token from headers is valid for the phone number
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
      if(tokenIsValid) {
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
        callback(403, {
          Error: 'Token is invalid'
        })
      }
    });
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
      // only let an authenticated user access their data. Don't let them access anyone else's

      // Get the token from the headers
      var token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

      // Verify that the given token from headers is valid for the phone number
      handlers._tokens.verifyToken(token, phone, tokenIsValid => {
        if(tokenIsValid) {
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
          callback(403, {
            Error: 'Token is invalid'
          })
        }
      });
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
      // only let an authenticated user access their data. Don't let them access anyone else's

      // Get the token from the headers
      var token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

      // Verify that the given token from headers is valid for the phone number
      handlers._tokens.verifyToken(token, phone, tokenIsValid => {
        if(tokenIsValid) {
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
          callback(403, {
            Error: 'Token is invalid'
          })
        }
      });
  } else {
    callback(400, {
      Error: 'Missing required fields'
    })
  }
};

// Tokens
handlers.tokens = (data, callback) => {
  console.log('at tokens handler ~~~~');
  const acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
}

// Container for all the tokens mthods
handlers._tokens = {};

// Required data: phone, password
// optional data: none
handlers._tokens.post = (data, callback) => {
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  if(phone && password){
    // Lookup the user matches that phone number
    _data.read('users', phone, (err, userData) => {
      if(!err && userData) {
        // Hash the sent password and compare it to the password stored in the user object
        var receivedPassword = helpers.hash(data.payload.password);
        var storedPassword = userData.hashedPassword;
        if(receivedPassword === storedPassword) {
          // if valid, create a new token with a random name. Set expiration date 1 hour in the future
          var tokenId =  helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          }

          // Store the token
          _data.create('tokens', tokenId, tokenObject, err => {
            if(!err){
              callback(200, tokenObject)
            } else {
              callback(500, { Error: 'Could not create the new token '})
            }
          })
        } else {
          callback(403, { Error: 'Unauthorized access. Password didn\' match'});
        }
      } else {
        callback(400, { Error: 'Could not find the specified user'})
      }
    });

    //
  } else {
    callback(403, {
      error: 'Missing Fields'
    })
  }
}

// tokens - get
// Required Data - id
// Optional Data - none
handlers._tokens.get = (data, callback) => {
  // Check that the ID is valid

  // Check that the id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
  if(id){
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if(!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, {
          Error: 'token does not exist'
        })
      }
    })

  } else {
    callback(400, {
      Error: 'Missing required fields',
      id,
      data: data.queryStringObject.id,
    });
  }
}

// tokens - put
// Required data: id, extend (boolean)
// Optional data: none
handlers._tokens.put = (data, callback) => {
  // Check that the id is valid
  var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
  // Check that the extend is valid
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend === true ?  data.payload.extend : false;

  if(extend && id) {
    _data.read('tokens', id, (err, tokenData) => {
      if(!err) {
        // check to make sure the token isn't already expired
        if(tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // Store the new updated token data
          _data.update('tokens', id, tokenData, (err) => {
            if(!err) {
              callback(200, { Message: 'Token expiry extended'});
            } else {
              callback(500, { Error: 'Failed to extend the expiration'})
            }
          })
        } else {
          callback(400, { Error: 'Token has already expired, and cannot be extended'});
        }
      } else {
        callback(400, { Error: 'Specified token does not exist'});
      }
    });
  } else {
    callback(400, {Error: 'Missing required field(s) or field(s) are invalid'});
  }
}
// Tokens - delete
// Required Data - id
// Optional Data - none
handlers._tokens.delete = (data, callback) => {
    //Check if the id number is valid
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
    if(id){
      // Look up for the user
      _data.read('tokens', id, (err, data) => {
        if(!err && data) {
          _data.delete('tokens', id,(err) => {
            if(!err){
              callback(200);
            } else {
              callback(500, {
                Error: 'Could not find the specified token'
              });
            }
          });
        } else {
          callback(500, {
            Error: 'Something went wrong'
          });
        }
      })
    } else {
      callback(400, {
        Error: 'Missing required fields'
      })
    }
}

// Verify if a given id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData) => {
    if(!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if(tokenData.phone === phone && tokenData.expires > Date.now()){
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  })
}

// Sample handler
handlers.sample = (data, callback) => {
  console.log('sample handler got called');
  callback(200,{
    message: 'hello world!'
  })
}

// Ping handler
handlers.ping = (data, callback) => {
  callback(200);
}

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
}

module.exports = handlers;