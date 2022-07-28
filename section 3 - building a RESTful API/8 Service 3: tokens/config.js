/* 
* Create and export config variables
*/

// Container for all the environments 
let environments = {};

// Staging (default) environment
environments.staging = {
  httpPort: 1000,
  httpsPort: 1001,
  envName: 'Staging',
  hashingSecret: 'this is a secret',
}

// Staging environment
environments.production = {
  httpPort: 6000,
  httpsPort: 6001,
  envName: 'Production',
  hashingSecret: 'this is a secret',
}

// Determine which environment was passed as a command-line argument
var currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not, default to staging,
var environmentToExport = typeof(environments[currentEnv]) === 'object' ? environments[currentEnv] : environments.staging;

// Export the module
module.exports = environmentToExport;