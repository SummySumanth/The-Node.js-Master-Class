/*
* Library for storing and editing data
*/

// Dependencies
var fs = require('fs');
var path = require('path');
const helpers = require('./helpers');

// Container for the module (to be exported)
var lib = {};

// Define base directory of the data folder
lib.baseDir = path.join(__dirname, '../.data/');

// Write data to a file
lib.create = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDiscriptor) => {
    if(!err && fileDiscriptor) {
      // Convert data to string 
      const stringData = JSON.stringify(data);

      //write to file and close it
      fs.writeFile(fileDiscriptor, stringData, (err) => {
        if(!err) {
          fs.close(fileDiscriptor, (err) => {
            if(!err) {
              callback(false);
            } else {
              callback('Error closing the file');
            }
          })
        } else {
          callback('Error writing to the file');
        }
      })
    } else {
      callback('Could not create new file, it may already exist');
    }
  });
};

// Read data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8', (err, data) => {
    if(!err && data) {
      let parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data)
    }
  })
};

// Update data inside a file
lib.update = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(lib.baseDir+dir+'/'+file+'.json','r+', (err, fileDiscriptor) => {
    if(!err && fileDiscriptor) {
      // convert data to string
      let stringData = JSON.stringify(data);

      // Truncare the file
      fs.truncate(fileDiscriptor, (err) => {
        if(!err) {
          // Write to the file and close it
          fs.writeFile(fileDiscriptor, stringData, (err) => {
            if(!err){
              fs.close(fileDiscriptor, (err) => {
                if(!err){
                  callback(false);
                } else {
                  callback('Error closing the existing file');
                }
              })
            } else {
              callback('Error writing to existing file');
            }
          })
        } else {
          callback('error truncating file');
        }
      });

    } else {
      callback('Could not open the file for updating, it may not exist');
    }
  });
}

// Delete a file

lib.delete = (dir, file, callback) => {
  // Unlinking the file
  fs.unlink(lib.baseDir+dir+'/'+file+'.json' , err => {
    if(!err){
      callback(false)
    } else {
      callback('Trouble deleting the file');
    }
  })
}
// Export the module
module.exports = lib;