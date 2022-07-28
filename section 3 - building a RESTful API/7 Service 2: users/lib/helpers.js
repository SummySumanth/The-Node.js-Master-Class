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

module.exports = helpers;