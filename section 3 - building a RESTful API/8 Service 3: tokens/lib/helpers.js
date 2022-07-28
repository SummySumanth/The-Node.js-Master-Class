/**
 * Helpers for various tasks
 */


// Dependencies
var crypto = require('crypto');
var config = require('../config');



// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = string => {
  if(typeof(string) === 'string' && string.length > 0){
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(string).digest('hex');
    return hash;
  } else {
    return false;
  }
}

// Create a function string to object
helpers.parseJsonToObject = string => {
  console.log('string is ', string);
  try {
    return JSON.parse(string);
  } catch(e){
    return {};
  }
}

// Create a string of random alphanumeric characters of a give length
helpers.createRandomString = strLength => {
  strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123465798';

    // Start the final string
    var str = '';
    for (i = 0; i !== strLength; i++){
      // Get a random character from the possibleCharacters string
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
      str += randomCharacter;
    }

    // return the final string
    return str;
  } else {
    return false
  }
}

module.exports = helpers;