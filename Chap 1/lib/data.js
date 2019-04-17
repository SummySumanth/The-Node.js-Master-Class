/*
* Library for storing and editing data
*/

// Dependencies

const fs = require('fs');
const path = require('path');

// Container for the module (to be exported)
var lib = {}

// Base directory of the data folder
lib.baseDir = path.join(__dirname + '/../.data/');

lib.create = (dir, file, data, callback) =>{
    // Open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json','wx', (err,fileDescriptor) => {

    }); 
}


// Export the module
module.exports = lib;
